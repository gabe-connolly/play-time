/**
 * Player Model
 * A rostered player on a team. Game-time state lives on Participant.
 */

export class Player {
  constructor({ id, firstName, lastName, nickname = '', jerseyNumber = '' }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.nickname = nickname;
    this.jerseyNumber = jerseyNumber;
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

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      nickname: this.nickname,
      jerseyNumber: this.jerseyNumber
    };
  }

  static fromJSON(data) {
    return new Player(data);
  }
}
