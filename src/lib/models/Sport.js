/**
 * Sport Model
 * Represents a sport with its positions and preset formations
 */

export class Sport {
  constructor({ id, name, teamSizes, positions, formations }) {
    this.id = id;
    this.name = name;
    this.teamSizes = teamSizes; // Preset field sizes, e.g. [7, 9, 11]
    this.positions = positions; // Array of Position objects, defensive first
    this.formations = formations; // { '7v7': Formation[], ... }
  }

  /**
   * Preset team sizes offered for this sport
   * @returns {number[]}
   */
  getAvailableTeamSizes() {
    return this.teamSizes;
  }

  /**
   * Get formations for a specific team size
   * @param {number} teamSize
   * @returns {Formation[]}
   */
  getFormationsForTeamSize(teamSize) {
    return this.formations[`${teamSize}v${teamSize}`] || [];
  }

  /**
   * Get position by name
   * @param {string} positionName
   * @returns {Position|undefined}
   */
  getPosition(positionName) {
    return this.positions.find(p => p.name === positionName);
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
