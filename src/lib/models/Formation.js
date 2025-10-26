/**
 * Formation Model
 * Represents a formation configuration for a team
 */

export class Formation {
  constructor({ name, positions }) {
    this.name = name;
    this.positions = positions; // Object: { positionName: count }
  }

  /**
   * Get total number of players in formation
   * @returns {number}
   */
  getTotalPlayers() {
    return Object.values(this.positions).reduce((sum, count) => sum + count, 0);
  }

  /**
   * Get count for a specific position
   * @param {string} positionName
   * @returns {number}
   */
  getPositionCount(positionName) {
    return this.positions[positionName] || 0;
  }

  /**
   * Check if formation includes a position
   * @param {string} positionName
   * @returns {boolean}
   */
  hasPosition(positionName) {
    return this.positions[positionName] > 0;
  }

  /**
   * Get all position names in formation
   * @returns {string[]}
   */
  getPositionNames() {
    return Object.keys(this.positions);
  }

  /**
   * Validate formation matches team size
   * @param {number} teamSize
   * @returns {boolean}
   */
  isValidForTeamSize(teamSize) {
    return this.getTotalPlayers() === teamSize;
  }
}
