/**
 * Player Model
 * Represents a player on the team
 */

export class Player {
  constructor({
    id,
    firstName,
    lastName,
    nickname = '',
    jerseyNumber = '',
    status = 'on_bench',
    position = null
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.nickname = nickname;
    this.jerseyNumber = jerseyNumber;
    this.status = status; // 'on_field' | 'on_bench'
    this.position = position; // Position name or null
  }

  /**
   * Get display name based on format preference
   * @param {'full'|'nickname'|'last'} format
   * @returns {string}
   */
  getDisplayName(format = 'full') {
    if (format === 'nickname' && this.nickname) {
      return this.nickname;
    }
    if (format === 'last') {
      return `${this.lastName}, ${this.firstName[0]}.`;
    }
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if player is on the field
   * @returns {boolean}
   */
  isOnField() {
    return this.status === 'on_field' && this.position !== null;
  }

  /**
   * Check if player is on the bench
   * @returns {boolean}
   */
  isOnBench() {
    return this.status === 'on_bench';
  }

  /**
   * Assign player to a position
   * @param {string} positionName
   */
  assignToPosition(positionName) {
    this.position = positionName;
    this.status = 'on_field';
  }

  /**
   * Move player to bench
   */
  moveToBench() {
    this.position = null;
    this.status = 'on_bench';
  }

  /**
   * Create a plain object from player (for serialization)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      nickname: this.nickname,
      jerseyNumber: this.jerseyNumber,
      status: this.status,
      position: this.position
    };
  }

  /**
   * Create player from plain object
   * @param {Object} data
   * @returns {Player}
   */
  static fromJSON(data) {
    return new Player(data);
  }
}
