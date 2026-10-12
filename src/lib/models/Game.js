/**
 * Game Model
 * One real game: its config, period clock, and participating players.
 * Every lineup change takes the wall time `now` and converts it to game
 * time through the clock, so stints are always recorded in game ms.
 */

import { Formation } from './Formation.js';
import { GameClock } from './GameClock.js';
import { Participant } from './Participant.js';

export class Game {
  constructor({
    id,
    teamId,
    createdAt,
    endedAt = null,
    status = 'live',
    config,
    clock,
    participants = []
  }) {
    this.id = id;
    this.teamId = teamId;
    this.createdAt = createdAt;
    this.endedAt = endedAt;
    this.status = status; // 'live' | 'final'
    // { totalMinutes, periodCount, size: number|'custom', formationName, positionCounts }
    this.config = { ...config, positionCounts: { ...config.positionCounts } };
    this.clock = clock instanceof GameClock ? clock : GameClock.fromJSON(clock);
    this.participants = participants.map(p =>
      p instanceof Participant ? p : Participant.fromJSON(p)
    );
  }

  /**
   * Create a new game for a team.
   * @param {Object} args
   * @param {string} args.id
   * @param {import('./Team.js').Team} args.team
   * @param {Object} args.config
   * @param {string[]} args.availablePlayerIds
   * @param {number} args.now
   */
  static create({ id, team, config, availablePlayerIds, now }) {
    const available = new Set(availablePlayerIds);
    return new Game({
      id,
      teamId: team.id,
      createdAt: now,
      config,
      clock: new GameClock({
        periodCount: config.periodCount,
        periodLengthMs: Math.round((config.totalMinutes * 60000) / config.periodCount)
      }),
      participants: team.players
        .filter(p => available.has(p.id))
        .map(p => Participant.fromPlayer(p))
    });
  }

  get isFinal() {
    return this.status === 'final';
  }

  get formation() {
    return new Formation({
      name: this.config.formationName || 'Custom',
      positions: this.config.positionCounts
    });
  }

  clockMs(now) {
    return this.clock.clockMs(now);
  }

  getParticipant(id) {
    return this.participants.find(p => p.id === id);
  }

  // --- Clock ---

  startClock(now) {
    if (this.isFinal) return false;
    return this.clock.start(now);
  }

  pauseClock(now) {
    return this.clock.pause(now);
  }

  /** @returns {boolean} true if the current period just ended */
  tick(now) {
    if (this.isFinal) return false;
    return this.clock.tick(now);
  }

  endPeriod(now) {
    if (this.isFinal) return false;
    return this.clock.endPeriod(now);
  }

  nextPeriod() {
    if (this.isFinal) return false;
    return this.clock.nextPeriod();
  }

  /** Finish the game: stop the clock, close every stint, freeze the record. */
  end(now) {
    if (this.isFinal) return false;
    this.clock.endPeriod(now);
    const clockMs = this.clock.clockMs(now);
    this.participants.forEach(p => {
      p.closeStintAt(clockMs);
      p.clearPendingPosition();
    });
    this.status = 'final';
    this.endedAt = now;
    return true;
  }

  // --- Lineup ---

  assignToPosition(playerId, positionName, slotIndex, now) {
    const p = this.getParticipant(playerId);
    if (!p || p.isOut()) return;
    p.assignToPosition(positionName, slotIndex, this.clockMs(now));
  }

  moveToBench(playerId, now) {
    const p = this.getParticipant(playerId);
    if (p && p.isOnField()) p.moveToBench(this.clockMs(now));
  }

  substitute(outId, inId, slotIndex, now) {
    const out = this.getParticipant(outId);
    const incoming = this.getParticipant(inId);
    if (!out || !incoming || incoming.isOut()) return;
    const clockMs = this.clockMs(now);
    const position = out.position;
    const slot = slotIndex ?? out.positionIndex;
    out.moveToBench(clockMs);
    incoming.assignToPosition(position, slot, clockMs);
  }

  swapFieldPlayers(aId, bId, now) {
    const a = this.getParticipant(aId);
    const b = this.getParticipant(bId);
    if (!a || !b || !a.isOnField() || !b.isOnField()) return;
    const clockMs = this.clockMs(now);
    const [pos, idx] = [a.position, a.positionIndex];
    a.assignToPosition(b.position, b.positionIndex, clockMs);
    b.assignToPosition(pos, idx, clockMs);
  }

  setAvailability(playerId, available, now) {
    const p = this.getParticipant(playerId);
    if (!p) return;
    if (available) p.markIn();
    else p.markOut(this.clockMs(now));
  }

  /** Add a rostered player who wasn't picked at setup (late arrival). */
  addParticipant(player) {
    if (this.getParticipant(player.id)) return;
    this.participants = [...this.participants, Participant.fromPlayer(player)];
  }

  // --- Pending lineup ---

  assignToPendingPosition(playerId, positionName, slotIndex) {
    const p = this.getParticipant(playerId);
    if (p && !p.isOut()) p.assignToPendingPosition(positionName, slotIndex);
  }

  clearPendingPosition(playerId) {
    this.getParticipant(playerId)?.clearPendingPosition();
  }

  clearPendingPositions() {
    this.participants.forEach(p => p.clearPendingPosition());
  }

  initializePendingFromActive() {
    this.participants.forEach(p => {
      if (p.isOnField()) p.assignToPendingPosition(p.position, p.positionIndex);
      else p.clearPendingPosition();
    });
  }

  commitPending(now) {
    const clockMs = this.clockMs(now);
    // Bench outgoing players first so a stint never spans a slot handover.
    this.participants
      .filter(p => p.pendingPosition === null)
      .forEach(p => p.applyPendingPosition(clockMs));
    this.participants
      .filter(p => p.pendingPosition !== null)
      .forEach(p => p.applyPendingPosition(clockMs));
  }

  hasPendingWork() {
    return this.participants.some(p => p.pendingPosition !== null);
  }

  /**
   * Fill status per position for the active or pending lineup.
   */
  getFormationStatus(pending = false) {
    const status = {};
    for (const [position, needed] of Object.entries(this.config.positionCounts)) {
      const current = this.participants.filter(p =>
        pending ? p.pendingPosition === position : p.isOnField() && p.position === position
      ).length;
      status[position] = { current, needed, isFull: current >= needed, hasSpace: current < needed };
    }
    return status;
  }

  // --- Summary ---

  /**
   * Minutes played per participant, total and per period.
   * @param {number} now
   * @returns {{ id, participant: Participant, totalMs: number, periodMs: number[] }[]}
   */
  getPlaytimeSummary(now) {
    const clockMs = this.clockMs(now);
    const ranges = this.clock.periods.map(p => [p.startMs, p.endMs ?? clockMs]);
    return this.participants.map(p => ({
      id: p.id,
      participant: p,
      totalMs: p.getPlayTimeMs(clockMs),
      periodMs: ranges.map(([from, to]) => p.getPlayTimeBetween(from, to, clockMs))
    }));
  }

  toJSON() {
    return {
      id: this.id,
      teamId: this.teamId,
      createdAt: this.createdAt,
      endedAt: this.endedAt,
      status: this.status,
      config: { ...this.config, positionCounts: { ...this.config.positionCounts } },
      clock: this.clock.toJSON(),
      participants: this.participants.map(p => p.toJSON())
    };
  }

  static fromJSON(data) {
    return new Game(data);
  }
}
