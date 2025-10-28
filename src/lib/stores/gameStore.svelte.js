/**
 * Game Store - Manages game state using Svelte 5 Runes
 */

  // Game view state
let currentView = $state('setup'); // 'setup' | 'game'
let displayFormat = $state('full'); // 'full' | 'nickname' | 'last'
let substituting = $state(null); // Player ID being substituted
let selectedBenchPlayer = $state(null); // Selected bench player for substitution
let fieldMode = $state('active'); // 'active' | 'pending'
let playerListView = $state('bench'); // 'bench' | 'roster'

/**
 * Navigate to setup view
 */
export function goToSetup() {
  currentView = 'setup';
  substituting = null;
  selectedBenchPlayer = null;
  fieldMode = 'active';
  playerListView = 'bench';
}

/**
 * Navigate to game view
 */
export function goToGame() {
  currentView = 'game';
}

/**
 * Set display format
 */
export function setDisplayFormat(format) {
  displayFormat = format;
}

/**
 * Start substitution
 */
export function startSubstitution(playerId) {
  substituting = playerId;
  selectedBenchPlayer = null;
}

/**
 * Select bench player for substitution
 */
export function selectBenchPlayer(playerId) {
  selectedBenchPlayer = playerId;
}

/**
 * Cancel substitution
 */
export function cancelSubstitution() {
  substituting = null;
  selectedBenchPlayer = null;
}

/**
 * Get current view (reactive)
 */
export function getCurrentView() {
  return currentView;
}

/**
 * Get display format (reactive)
 */
export function getDisplayFormat() {
  return displayFormat;
}

/**
 * Get substituting player ID (reactive)
 */
export function getSubstitutingPlayer() {
  return substituting;
}

/**
 * Get selected bench player ID (reactive)
 */
export function getSelectedBenchPlayer() {
  return selectedBenchPlayer;
}

/**
 * Check if currently substituting
 */
export function isSubstituting() {
  return substituting !== null;
}

/**
 * Set field mode (active or pending)
 */
export function setFieldMode(mode) {
  fieldMode = mode;
}

/**
 * Get field mode (reactive)
 */
export function getFieldMode() {
  return fieldMode;
}

/**
 * Check if in pending mode
 */
export function isPendingMode() {
  return fieldMode === 'pending';
}

/**
 * Set player list view (bench or roster)
 */
export function setPlayerListView(view) {
  playerListView = view;
}

/**
 * Get player list view (reactive)
 */
export function getPlayerListView() {
  return playerListView;
}
