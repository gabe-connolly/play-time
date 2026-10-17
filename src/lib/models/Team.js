/**
 * Team Model
 * A named team and its roster
 */

import { Player } from './Player.js';

export class Team {
  constructor({ id, name, createdAt = 0, players = [] }) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.players = players.map(p => (p instanceof Player ? p : Player.fromJSON(p)));
  }

  /**
   * Add a player to the team
   * @param {Player} player
   */
  addPlayer(player) {
    this.players = [...this.players, player];
  }

  /**
   * Remove a player from the team
   * @param {string} playerId
   * @returns {boolean} True if player was removed
   */
  removePlayer(playerId) {
    const before = this.players.length;
    this.players = this.players.filter(p => p.id !== playerId);
    return this.players.length !== before;
  }

  /**
   * Get player by ID
   * @param {string} playerId
   * @returns {Player|undefined}
   */
  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  /**
   * Update a player's roster fields
   * @param {string} playerId
   * @param {Object} updates
   * @returns {boolean} True if player was updated
   */
  updatePlayer(playerId, updates) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index === -1) return false;
    const updated = new Player({ ...this.players[index].toJSON(), ...updates, id: playerId });
    this.players = this.players.map((p, i) => (i === index ? updated : p));
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      players: this.players.map(p => p.toJSON())
    };
  }

  static fromJSON(data) {
    return new Team(data);
  }
}
