/**
 * Format milliseconds as M:SS
 * @param {number} ms
 * @returns {string}
 */
export function formatPlayTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Countdown display: rounds up so the clock reads 0:00 only at the end.
 * @param {number} ms
 */
export function formatCountdown(ms) {
  return formatPlayTime(Math.ceil(ms / 1000) * 1000);
}

/**
 * Whole minutes played, e.g. "23 min"
 * @param {number} minutes
 */
export function formatMinutes(minutes) {
  return `${minutes} min`;
}

/**
 * Game date, e.g. "Sat, Oct 11, 2026"
 * @param {number} timestamp
 */
export function formatGameDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
