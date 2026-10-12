/**
 * App data document: versioning, legacy migration, import and export.
 *
 * The whole app persists as one JSON document:
 *   { schemaVersion, teams: TeamJSON[], games: GameJSON[], settings }
 */

export const SCHEMA_VERSION = 2;

/** localStorage key used by the single-team v1 app. */
export const LEGACY_TEAM_KEY = 'field_coach_team';
export const LEGACY_GAME_STATE_KEY = 'field_coach_game_state';

export const DEFAULT_SETTINGS = { displayFormat: 'full', timer: null };

export function emptyDoc() {
  return { schemaVersion: SCHEMA_VERSION, teams: [], games: [], settings: { ...DEFAULT_SETTINGS } };
}

/** A v1 export is a bare team object: it has players and no schemaVersion. */
export function isLegacyTeam(data) {
  return !!data && typeof data === 'object' && !('schemaVersion' in data) && Array.isArray(data.players);
}

/**
 * Convert a v1 single-team record into a v2 document. Only roster fields
 * survive; lineup and timer state from v1 is dropped.
 * @param {Object} legacyTeam
 * @param {number} now
 */
export function migrateLegacyTeam(legacyTeam, now) {
  const doc = emptyDoc();
  doc.teams.push({
    id: legacyTeam.id,
    name: legacyTeam.name || 'My Team',
    createdAt: now,
    players: (legacyTeam.players || [])
      .filter(p => p && p.id && (p.firstName || p.lastName))
      .map(p => ({
        id: p.id,
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        nickname: p.nickname || '',
        jerseyNumber: p.jerseyNumber == null ? '' : String(p.jerseyNumber)
      }))
  });
  return doc;
}

/**
 * Bring any stored or imported value up to the current schema.
 * @param {unknown} data
 * @param {number} now
 * @returns {Object} a valid current-version document
 * @throws {Error} when the data is not recognisable app data
 */
export function normalizeDoc(data, now) {
  if (isLegacyTeam(data)) return migrateLegacyTeam(data, now);
  if (!data || typeof data !== 'object' || typeof data.schemaVersion !== 'number') {
    throw new Error('Not a Play Time data file');
  }
  if (data.schemaVersion > SCHEMA_VERSION) {
    throw new Error('This file was made by a newer version of Play Time');
  }
  if (!Array.isArray(data.teams) || !Array.isArray(data.games)) {
    throw new Error('Data file is missing teams or games');
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    teams: data.teams,
    games: data.games,
    settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) }
  };
}

/**
 * Merge an imported document into the current one without losing data:
 * records only one side has are kept, and same-id records are combined.
 */
export function mergeDocs(current, incoming) {
  const byId = (list, extra, combine) => {
    const map = new Map(list.map(x => [x.id, x]));
    extra.forEach(x => map.set(x.id, map.has(x.id) ? combine(map.get(x.id), x) : x));
    return [...map.values()];
  };
  // A team keeps every player either copy knows about; the imported copy wins per field.
  const mergeTeam = (mine, theirs) => ({
    ...mine,
    ...theirs,
    players: byId(mine.players || [], theirs.players || [], (_, p) => p)
  });
  // A game keeps whichever copy got further: final beats live, then more clock played.
  const progress = g => [g.status === 'final' ? 1 : 0, g.clock?.elapsedMs ?? 0];
  const mergeGame = (mine, theirs) => {
    const [a, b] = [progress(mine), progress(theirs)];
    return b[0] > a[0] || (b[0] === a[0] && b[1] >= a[1]) ? theirs : mine;
  };
  return {
    schemaVersion: SCHEMA_VERSION,
    teams: byId(current.teams, incoming.teams, mergeTeam),
    games: byId(current.games, incoming.games, mergeGame),
    settings: current.settings
  };
}

/** Serialize a document for export. */
export function exportDoc(doc, now) {
  return JSON.stringify({ app: 'play-time', exportedAt: new Date(now).toISOString(), ...doc }, null, 2);
}

/** Parse exported text (v2 export or a raw v1 team) into a current document. */
export function parseImport(text, now) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON');
  }
  if (data && data.app === 'play-time') {
    const { app: _app, exportedAt: _at, ...doc } = data;
    data = doc;
  }
  return normalizeDoc(data, now);
}
