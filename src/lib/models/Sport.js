/**
 * Sport Model
 * Represents a sport with its positions and configurations
 */

export class Sport {
  constructor({ id, name, minPlayers, maxPlayers, positions, formations }) {
    this.id = id;
    this.name = name;
    this.minPlayers = minPlayers;
    this.maxPlayers = maxPlayers;
    this.positions = positions; // Array of Position objects
    this.formations = formations; // Object with formation configurations
  }

  /**
   * Get available team sizes for this sport
   * @returns {number[]} Array of valid team sizes
   */
  getAvailableTeamSizes() {
    return Array.from(
      { length: this.maxPlayers - this.minPlayers + 1 },
      (_, i) => this.minPlayers + i
    );
  }

  /**
   * Get formations for a specific team size
   * @param {number} teamSize
   * @returns {Formation[]} Array of formations
   */
  getFormationsForTeamSize(teamSize) {
    const key = `${teamSize}v${teamSize}`;
    return this.formations[key] || [];
  }

  /**
   * Get position by name
   * @param {string} positionName
   * @returns {Position|undefined}
   */
  getPosition(positionName) {
    return this.positions.find(p => p.name === positionName);
  }

  /**
   * Validate if team size is valid for this sport
   * @param {number} teamSize
   * @returns {boolean}
   */
  isValidTeamSize(teamSize) {
    return teamSize >= this.minPlayers && teamSize <= this.maxPlayers;
  }
}

/**
 * Position Model
 * Represents a position in a sport
 */
export class Position {
  constructor({ name, abbr, color, defaultCount }) {
    this.name = name;
    this.abbr = abbr;
    this.color = color;
    this.defaultCount = defaultCount;
  }
}
