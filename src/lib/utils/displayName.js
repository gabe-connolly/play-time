/**
 * Get display name for a player
 * @param {Object} player - Player object
 * @param {'full'|'nickname'|'last'} format - Display format
 * @returns {string}
 */
export function getDisplayName(player, format = 'full') {
  if (!player) return '';

  if (format === 'nickname' && player.nickname) {
    return player.nickname;
  }

  if (format === 'last') {
    return `${player.lastName}, ${player.firstName[0]}.`;
  }

  return `${player.firstName} ${player.lastName}`;
}
