/**
 * Format milliseconds as MM:SS
 * @param {number} ms
 * @returns {string}
 */
export function formatPlayTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
