/**
 * App Store - teams, rosters, games and settings, persisted as one document.
 * Model instances are replaced (never mutated in place) so runes see changes.
 */
import { Team } from '$lib/models/Team.js';
import { Player } from '$lib/models/Player.js';
import { Game } from '$lib/models/Game.js';
import { generateId } from '$lib/utils/idGenerator.js';
import {
  emptyDoc,
  normalizeDoc,
  mergeDocs,
  exportDoc,
  parseImport,
  SCHEMA_VERSION,
  DEFAULT_SETTINGS
} from '$lib/data/schema.js';
import {
  readDocText,
  writeDocText,
  clearDocText,
  readLegacyTeamText,
  clearLegacyData
} from '$lib/utils/storage.js';

let ready = $state(false);
let loadError = $state(null);
let teams = $state([]);
let games = $state([]);
let settings = $state({ ...DEFAULT_SETTINGS });

function snapshot() {
  return {
    schemaVersion: SCHEMA_VERSION,
    teams: teams.map(t => t.toJSON()),
    games: games.map(g => g.toJSON()),
    settings: { ...settings }
  };
}

function persist() {
  return writeDocText(JSON.stringify(snapshot()));
}

function hydrate(doc) {
  teams = doc.teams.map(t => Team.fromJSON(t));
  games = doc.games.map(g => Game.fromJSON(g));
  settings = { ...DEFAULT_SETTINGS, ...doc.settings };
}

/**
 * Load the stored document, migrating v1 data on first run.
 */
export async function init() {
  if (ready) return;
  const now = Date.now();
  try {
    const text = await readDocText();
    if (text) {
      hydrate(normalizeDoc(JSON.parse(text), now));
    } else {
      const legacy = readLegacyTeamText();
      hydrate(legacy ? normalizeDoc(JSON.parse(legacy), now) : emptyDoc());
      await persist();
    }
  } catch (error) {
    console.error('Failed to load data:', error);
    loadError = error.message;
    hydrate(emptyDoc());
  }
  ready = true;
}

export function isReady() {
  return ready;
}

export function getLoadError() {
  return loadError;
}

// --- Teams ---

export function getTeams() {
  return teams;
}

export function getTeam(teamId) {
  return teams.find(t => t.id === teamId) ?? null;
}

function replaceTeam(teamId, mutate) {
  const index = teams.findIndex(t => t.id === teamId);
  if (index === -1) return;
  const copy = Team.fromJSON(teams[index].toJSON());
  mutate(copy);
  teams[index] = copy;
  persist();
}

/** @returns {string} the new team's id */
export function createTeam(name) {
  const team = new Team({ id: generateId(), name: name.trim() || 'My Team', createdAt: Date.now() });
  teams = [...teams, team];
  persist();
  return team.id;
}

export function renameTeam(teamId, name) {
  if (!name.trim()) return;
  replaceTeam(teamId, t => {
    t.name = name.trim();
  });
}

/** Delete a team and every game it played. */
export function deleteTeam(teamId) {
  teams = teams.filter(t => t.id !== teamId);
  games = games.filter(g => g.teamId !== teamId);
  persist();
}

export function addPlayer(teamId, playerData) {
  replaceTeam(teamId, t => t.addPlayer(new Player({ ...playerData, id: generateId() })));
}

/** Update a roster player; unfinished games pick up the new name and number. */
export function updatePlayer(teamId, playerId, updates) {
  replaceTeam(teamId, t => t.updatePlayer(playerId, updates));
  const player = getTeam(teamId)?.getPlayer(playerId);
  if (!player) return;
  games.forEach(g => {
    if (g.teamId === teamId && !g.isFinal && g.getParticipant(playerId)) {
      mutateGame(g.id, game => Object.assign(game.getParticipant(playerId), player.toJSON()));
    }
  });
}

export function deletePlayer(teamId, playerId) {
  replaceTeam(teamId, t => t.removePlayer(playerId));
}

// --- Games ---

export function getGame(gameId) {
  return games.find(g => g.id === gameId) ?? null;
}

/** Games for a team, newest first. */
export function getGamesForTeam(teamId) {
  return games.filter(g => g.teamId === teamId).sort((a, b) => b.createdAt - a.createdAt);
}

/** The team's unfinished game, if any. */
export function getLiveGame(teamId) {
  return getGamesForTeam(teamId).find(g => !g.isFinal) ?? null;
}

/** Config of the team's most recent game, for setup defaults. */
export function getLastGameConfig(teamId) {
  return getGamesForTeam(teamId)[0]?.config ?? null;
}

/** @returns {string|null} the new game's id */
export function createGame(teamId, config, availablePlayerIds) {
  const team = getTeam(teamId);
  if (!team) return null;
  const game = Game.create({ id: generateId(), team, config, availablePlayerIds, now: Date.now() });
  games = [...games, game];
  persist();
  return game.id;
}

/**
 * Apply a change to a game. `mutate` receives a fresh copy and the current
 * wall time; return false from it to skip the save.
 */
export function mutateGame(gameId, mutate) {
  const index = games.findIndex(g => g.id === gameId);
  if (index === -1) return;
  const copy = Game.fromJSON(games[index].toJSON());
  if (mutate(copy, Date.now()) === false) return;
  games[index] = copy;
  persist();
}

export function deleteGame(gameId) {
  games = games.filter(g => g.id !== gameId);
  persist();
}

// --- Settings ---

export function getSettings() {
  return settings;
}

export function updateSettings(updates) {
  settings = { ...settings, ...updates };
  persist();
}

// --- Import / export ---

export function exportText() {
  return exportDoc(snapshot(), Date.now());
}

/**
 * Merge an exported file into the current data.
 * @returns {{ teams: number, games: number }} counts found in the file
 * @throws {Error} if the file is not Play Time data
 */
export async function importText(text) {
  const incoming = parseImport(text, Date.now());
  hydrate(mergeDocs(snapshot(), incoming));
  await persist();
  return { teams: incoming.teams.length, games: incoming.games.length };
}

export async function clearAll() {
  await clearDocText();
  clearLegacyData();
  hydrate(emptyDoc());
  await persist();
}
