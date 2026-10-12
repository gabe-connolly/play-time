/**
 * Game UI Store - transient game-screen state and the side countdown timer.
 * Game data itself lives in appStore.
 */

const TIMER_KEY = 'play_time_side_timer';

let substituting = $state(null); // Participant id being subbed out
let selectedBenchPlayer = $state(null); // Bench participant picked for a slot
let fieldMode = $state('active'); // 'active' | 'pending'
let playerListView = $state('bench'); // 'bench' | 'roster'

// Countdown timer (independent utility timer, e.g. for sub rotations)
let timerRunning = $state(false);
let timerStartedAt = $state(null);
let timerElapsedBeforePause = $state(0);
let timerDurationMs = $state(0);

function persistTimer() {
  try {
    localStorage.setItem(
      TIMER_KEY,
      JSON.stringify({ timerRunning, timerStartedAt, timerElapsedBeforePause, timerDurationMs })
    );
  } catch {
    // Timer state is a convenience; losing it is harmless.
  }
}

export function restoreTimer() {
  try {
    const saved = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null');
    if (!saved) return;
    timerRunning = saved.timerRunning || false;
    timerStartedAt = saved.timerStartedAt || null;
    timerElapsedBeforePause = saved.timerElapsedBeforePause || 0;
    timerDurationMs = saved.timerDurationMs || 0;
  } catch {
    // Ignore corrupt timer state.
  }
}

/** Reset per-game UI state when entering a game screen. */
export function resetGameUi() {
  substituting = null;
  selectedBenchPlayer = null;
  fieldMode = 'active';
  playerListView = 'bench';
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

export function getSubstitutingPlayer() {
  return substituting;
}

export function getSelectedBenchPlayer() {
  return selectedBenchPlayer;
}

export function isSubstituting() {
  return substituting !== null;
}

// --- Field mode ---

export function setFieldMode(mode) {
  fieldMode = mode;
}

export function getFieldMode() {
  return fieldMode;
}

// --- Player list ---

export function setPlayerListView(view) {
  playerListView = view;
}

export function getPlayerListView() {
  return playerListView;
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
  persistTimer();
}

export function stopTimer() {
  if (timerRunning && timerStartedAt !== null) {
    timerElapsedBeforePause += Date.now() - timerStartedAt;
  }
  timerStartedAt = null;
  timerRunning = false;
  persistTimer();
}

export function resetTimer() {
  timerRunning = false;
  timerStartedAt = null;
  timerElapsedBeforePause = 0;
  timerDurationMs = 0;
  persistTimer();
}

export function getTimerRunning() {
  return timerRunning;
}

export function getTimerDurationMs() {
  return timerDurationMs;
}

/** Remaining time in ms; 0 when expired. */
export function getTimerRemainingMs() {
  let elapsed = timerElapsedBeforePause;
  if (timerRunning && timerStartedAt !== null) {
    elapsed += Date.now() - timerStartedAt;
  }
  return Math.max(0, timerDurationMs - elapsed);
}

export function isTimerExpired() {
  return timerDurationMs > 0 && getTimerRemainingMs() <= 0;
}
