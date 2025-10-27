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
    position = null,
    positionIndex = null,
    pendingPosition = null,
    pendingPositionIndex = null
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.nickname = nickname;
    this.jerseyNumber = jerseyNumber;
    this.status = status; // 'on_field' | 'on_bench'
    this.position = position; // Position name or null
    this.positionIndex = positionIndex; // Slot index within position (0-based) or null
    this.pendingPosition = pendingPosition; // Pending position name or null
    this.pendingPositionIndex = pendingPositionIndex; // Pending slot index or null
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
   * @param {number|null} slotIndex - Optional slot index within position
   */
  assignToPosition(positionName, slotIndex = null) {
    this.position = positionName;
    this.positionIndex = slotIndex;
    this.status = 'on_field';
  }

  /**
   * Move player to bench
   */
  moveToBench() {
    this.position = null;
    this.positionIndex = null;
    this.status = 'on_bench';
  }

  /**
   * Assign player to a pending position
   * @param {string} positionName
   * @param {number|null} slotIndex - Optional slot index within position
   */
  assignToPendingPosition(positionName, slotIndex = null) {
    this.pendingPosition = positionName;
    this.pendingPositionIndex = slotIndex;
  }

  /**
   * Clear pending position
   */
  clearPendingPosition() {
    this.pendingPosition = null;
    this.pendingPositionIndex = null;
  }

  /**
   * Apply pending position (move pending to active)
   */
  applyPendingPosition() {
    if (this.pendingPosition !== null) {
      this.position = this.pendingPosition;
      this.positionIndex = this.pendingPositionIndex;
      this.status = 'on_field';
      this.pendingPosition = null;
      this.pendingPositionIndex = null;
    } else {
      // If no pending position, move to bench
      this.moveToBench();
    }
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
      position: this.position,
      positionIndex: this.positionIndex,
      pendingPosition: this.pendingPosition,
      pendingPositionIndex: this.pendingPositionIndex
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
