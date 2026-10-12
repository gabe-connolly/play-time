/**
 * Persistence adapter for the app document.
 * Native builds use Capacitor Preferences (durable app storage); the web
 * build uses localStorage. Writes are serialized so the last save wins.
 */
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { LEGACY_TEAM_KEY, LEGACY_GAME_STATE_KEY } from '$lib/data/schema.js';

const DOC_KEY = 'play_time_doc';

const isNative = () => Capacitor.isNativePlatform();

/** @returns {Promise<string|null>} */
export async function readDocText() {
  if (isNative()) {
    const { value } = await Preferences.get({ key: DOC_KEY });
    return value;
  }
  return localStorage.getItem(DOC_KEY);
}

let writeChain = Promise.resolve();

/** @param {string} text */
export function writeDocText(text) {
  writeChain = writeChain
    .catch(() => {})
    .then(() =>
      isNative() ? Preferences.set({ key: DOC_KEY, value: text }) : localStorage.setItem(DOC_KEY, text)
    );
  return writeChain;
}

export async function clearDocText() {
  await writeChain.catch(() => {});
  if (isNative()) await Preferences.remove({ key: DOC_KEY });
  else localStorage.removeItem(DOC_KEY);
}

/** v1 single-team record, if this origin ever ran the old app. */
export function readLegacyTeamText() {
  try {
    return localStorage.getItem(LEGACY_TEAM_KEY);
  } catch {
    return null;
  }
}

export function clearLegacyData() {
  try {
    localStorage.removeItem(LEGACY_TEAM_KEY);
    localStorage.removeItem(LEGACY_GAME_STATE_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
}
