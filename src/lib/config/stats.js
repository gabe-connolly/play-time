/**
 * Trackable player stats.
 * A setting is what the coach switches on in Settings; it expands to one or
 * more stats, each of which gets its own button in the game's stat tracker.
 */

export const STAT_SETTINGS = [
  { id: 'goals', label: 'Goals', stats: [{ id: 'goals', label: 'Goal', short: 'G' }] },
  { id: 'assists', label: 'Assists', stats: [{ id: 'assists', label: 'Assist', short: 'A' }] },
  { id: 'shots', label: 'Shots', stats: [{ id: 'shots', label: 'Shot', short: 'Sh' }] },
  { id: 'shotsOnTarget', label: 'Shots on target', stats: [{ id: 'shotsOnTarget', label: 'Shot on target', short: 'SoT' }] },
  { id: 'passesCompleted', label: 'Passes completed', stats: [{ id: 'passesCompleted', label: 'Pass completed', short: 'PC' }] },
  { id: 'passesAttempted', label: 'Passes attempted', stats: [{ id: 'passesAttempted', label: 'Pass attempted', short: 'PA' }] },
  { id: 'keyPasses', label: 'Key passes', stats: [{ id: 'keyPasses', label: 'Key pass', short: 'KP' }] },
  { id: 'dribbles', label: 'Successful dribbles', stats: [{ id: 'dribbles', label: 'Dribble', short: 'Dr' }] },
  { id: 'dispossessed', label: 'Times dispossessed', stats: [{ id: 'dispossessed', label: 'Dispossessed', short: 'Dis' }] },
  { id: 'tackles', label: 'Tackles won', stats: [{ id: 'tackles', label: 'Tackle won', short: 'Tk' }] },
  { id: 'interceptions', label: 'Interceptions', stats: [{ id: 'interceptions', label: 'Interception', short: 'Int' }] },
  { id: 'clearances', label: 'Clearances', stats: [{ id: 'clearances', label: 'Clearance', short: 'Clr' }] },
  { id: 'recoveries', label: 'Ball recoveries', stats: [{ id: 'recoveries', label: 'Recovery', short: 'Rec' }] },
  { id: 'fouls', label: 'Fouls committed', stats: [{ id: 'fouls', label: 'Foul', short: 'F' }] },
  {
    id: 'cards',
    label: 'Yellow / red cards',
    stats: [
      { id: 'yellowCards', label: 'Yellow card', short: 'YC' },
      { id: 'redCards', label: 'Red card', short: 'RC' }
    ]
  }
];

export const DEFAULT_STAT_SETTING_IDS = ['goals', 'assists'];

/** Every individual stat, in display order. */
export const ALL_STATS = STAT_SETTINGS.flatMap(s => s.stats);

/** @param {string} statId */
export function getStat(statId) {
  return ALL_STATS.find(s => s.id === statId) ?? null;
}

/**
 * The stats the tracker shows for a set of enabled settings, in display order.
 * @param {string[]} settingIds
 */
export function statsForSettings(settingIds) {
  const enabled = new Set(settingIds);
  return STAT_SETTINGS.filter(s => enabled.has(s.id)).flatMap(s => s.stats);
}
