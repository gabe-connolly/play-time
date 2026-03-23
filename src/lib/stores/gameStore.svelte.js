/**
 * Game Store - Manages game state using Svelte 5 Runes
 */
import { saveGameState, loadGameState } from '../utils/storage.js';

// Game view state
let currentView = $state('setup'); // 'setup' | 'game'
let displayFormat = $state('full'); // 'full' | 'nickname' | 'last'
let substituting = $state(null); // Player ID being substituted
let selectedBenchPlayer = $state(null); // Selected bench player for substitution
let fieldMode = $state('active'); // 'active' | 'pending'
let playerListView = $state('bench'); // 'bench' | 'roster'

// Game clock (counts up, tracks total game time + player play times)
let clockRunning = $state(false);
let clockStartedAt = $state(null);
let clockElapsedBeforePause = $state(0);

// Countdown timer (independent utility timer)
let timerRunning = $state(false);
let timerStartedAt = $state(null);
let timerElapsedBeforePause = $state(0);
let timerDurationMs = $state(0);

function persist() {
  saveGameState({
    currentView,
    displayFormat,
    fieldMode,
    playerListView,
    clockRunning,
    clockStartedAt,
    clockElapsedBeforePause,
    timerRunning,
    timerStartedAt,
    timerElapsedBeforePause,
    timerDurationMs
  });
}

/**
 * Restore game state from localStorage
 */
export function restoreGameState() {
  const saved = loadGameState();
  if (saved) {
    currentView = saved.currentView || 'setup';
    displayFormat = saved.displayFormat || 'full';
    fieldMode = saved.fieldMode || 'active';
    playerListView = saved.playerListView || 'bench';
    clockRunning = saved.clockRunning || false;
    clockStartedAt = saved.clockStartedAt || null;
    clockElapsedBeforePause = saved.clockElapsedBeforePause || 0;
    timerRunning = saved.timerRunning || false;
    timerStartedAt = saved.timerStartedAt || null;
    timerElapsedBeforePause = saved.timerElapsedBeforePause || 0;
    timerDurationMs = saved.timerDurationMs || 0;
    return true;
  }
  return false;
}

// --- Navigation ---

export function goToSetup() {
  currentView = 'setup';
  substituting = null;
  selectedBenchPlayer = null;
  fieldMode = 'active';
  playerListView = 'bench';
  persist();
}

export function goToGame() {
  currentView = 'game';
  persist();
}

// --- Display ---

export function setDisplayFormat(format) {
  displayFormat = format;
  persist();
}

// --- Substitution ---

export function startSubstitution(playerId) {
  substituting = playerId;
  selectedBenchPlayer = null;
}

export function selectBenchPlayer(playerId) {
  selectedBenchPlayer = playerId;
}

export function cancelSubstitution() {
  substituting = null;
  selectedBenchPlayer = null;
}

// --- Field mode ---

export function setFieldMode(mode) {
  fieldMode = mode;
  persist();
}

export function getFieldMode() {
  return fieldMode;
}

export function isPendingMode() {
  return fieldMode === 'pending';
}

// --- Player list ---

export function setPlayerListView(view) {
  playerListView = view;
  persist();
}

export function getPlayerListView() {
  return playerListView;
}

// --- Game Clock ---

export function setClockRunning(running) {
  if (running && !clockRunning) {
    clockStartedAt = Date.now();
  } else if (!running && clockRunning) {
    if (clockStartedAt !== null) {
      clockElapsedBeforePause += Date.now() - clockStartedAt;
    }
    clockStartedAt = null;
  }
  clockRunning = running;
  persist();
}

export function getClockRunning() {
  return clockRunning;
}

export function getGameClockMs() {
  if (clockRunning && clockStartedAt !== null) {
    return clockElapsedBeforePause + (Date.now() - clockStartedAt);
  }
  return clockElapsedBeforePause;
}

export function resetGameClock() {
  clockRunning = false;
  clockStartedAt = null;
  clockElapsedBeforePause = 0;
  persist();
}

// --- Countdown Timer ---

export function startTimer(durationMs = null) {
  if (durationMs !== null) {
    timerDurationMs = durationMs;
    timerElapsedBeforePause = 0;
  }
  if (timerDurationMs <= 0) return;
  timerStartedAt = Date.now();
  timerRunning = true;
  persist();
}

export function stopTimer() {
  if (timerRunning && timerStartedAt !== null) {
    timerElapsedBeforePause += Date.now() - timerStartedAt;
  }
  timerStartedAt = null;
  timerRunning = false;
  persist();
}

export function resetTimer() {
  timerRunning = false;
  timerStartedAt = null;
  timerElapsedBeforePause = 0;
  timerDurationMs = 0;
  persist();
}

export function getTimerRunning() {
  return timerRunning;
}

export function getTimerDurationMs() {
  return timerDurationMs;
}

/**
 * Get remaining time in ms. Returns 0 when expired.
 */
export function getTimerRemainingMs() {
  let elapsed = timerElapsedBeforePause;
  if (timerRunning && timerStartedAt !== null) {
    elapsed += Date.now() - timerStartedAt;
  }
  const remaining = timerDurationMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

/**
 * Check if timer has expired
 */
export function isTimerExpired() {
  return timerDurationMs > 0 && getTimerRemainingMs() <= 0;
}

// --- Reactive getters ---

export function getCurrentView() {
  return currentView;
}

export function getDisplayFormat() {
  return displayFormat;
}

export function getSubstitutingPlayer() {
  return substituting;
}

export function getSelectedBenchPlayer() {
  return selectedBenchPlayer;
}

export function isSubstituting() {
  return substituting !== null;
}

// --- Reset ---

export function resetGameState() {
  currentView = 'setup';
  displayFormat = 'full';
  substituting = null;
  selectedBenchPlayer = null;
  fieldMode = 'active';
  playerListView = 'bench';
  clockRunning = false;
  clockStartedAt = null;
  clockElapsedBeforePause = 0;
  timerRunning = false;
  timerStartedAt = null;
  timerElapsedBeforePause = 0;
  timerDurationMs = 0;
}
