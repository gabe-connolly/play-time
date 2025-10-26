/**
 * Team Model
 * Represents a team with players and configuration
 */

import { Player } from './Player.js';

export class Team {
  constructor({
    id,
    name,
    sportId,
    teamSize,
    players = [],
    activeFormation = null
  }) {
    this.id = id;
    this.name = name;
    this.sportId = sportId;
    this.teamSize = teamSize;
    this.players = players.map(p => p instanceof Player ? p : Player.fromJSON(p));
    this.activeFormation = activeFormation;
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
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players = [...this.players.slice(0, index), ...this.players.slice(index + 1)];
      return true;
    }
    return false;
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
   * Update a player
   * @param {string} playerId
   * @param {Object} updates
   * @returns {boolean} True if player was updated
   */
  updatePlayer(playerId, updates) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      const currentPlayer = this.players[index];
      const updatedPlayer = new Player({ ...currentPlayer, ...updates });
      this.players = [...this.players.slice(0, index), updatedPlayer, ...this.players.slice(index + 1)];
      return true;
    }
    return false;
  }

  /**
   * Get all players on the field
   * @returns {Player[]}
   */
  getFieldPlayers() {
    return this.players.filter(p => p.isOnField());
  }

  /**
   * Get all players on the bench
   * @returns {Player[]}
   */
  getBenchPlayers() {
    return this.players.filter(p => p.isOnBench());
  }

  /**
   * Get players by position
   * @param {string} positionName
   * @returns {Player[]}
   */
  getPlayersByPosition(positionName) {
    return this.players.filter(p => p.position === positionName);
  }

  /**
   * Check if formation requirements are met
   * @param {Formation} formation
   * @returns {boolean}
   */
  meetsFormationRequirements(formation) {
    if (!formation) return false;

    for (const [position, count] of Object.entries(formation.positions)) {
      const playersInPosition = this.getPlayersByPosition(position).length;
      if (playersInPosition !== count) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get formation compliance status
   * @param {Formation} formation
   * @returns {Object} Status for each position
   */
  getFormationStatus(formation) {
    if (!formation) return {};

    const status = {};
    for (const [position, needed] of Object.entries(formation.positions)) {
      const current = this.getPlayersByPosition(position).length;
      status[position] = {
        current,
        needed,
        isFull: current >= needed,
        hasSpace: current < needed
      };
    }
    return status;
  }

  /**
   * Serialize team to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      sportId: this.sportId,
      teamSize: this.teamSize,
      players: this.players.map(p => p.toJSON()),
      activeFormation: this.activeFormation
    };
  }

  /**
   * Create team from plain object
   * @param {Object} data
   * @returns {Team}
   */
  static fromJSON(data) {
    return new Team(data);
  }
}
