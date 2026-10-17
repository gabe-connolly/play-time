/**
 * Participant Model
 * A rostered player taking part in one game: lineup state plus playtime.
 * Playtime is a list of stints measured in game-clock ms, so it only grows
 * while the game clock runs.
 */

export class Participant {
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
    pendingPositionIndex = null,
    stints = []
  }) {
    this.id = id; // Same as the rostered Player's id
    this.firstName = firstName;
    this.lastName = lastName;
    this.nickname = nickname;
    this.jerseyNumber = jerseyNumber;
    this.status = status; // 'on_field' | 'on_bench' | 'out'
    this.position = position;
    this.positionIndex = positionIndex;
    this.pendingPosition = pendingPosition;
    this.pendingPositionIndex = pendingPositionIndex;
    this.stints = stints.map(s => ({ ...s })); // [{ startMs, endMs|null }] in game ms
  }

  static fromPlayer(player) {
    return new Participant({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      nickname: player.nickname,
      jerseyNumber: player.jerseyNumber
    });
  }

  isOnField() {
    return this.status === 'on_field' && this.position !== null;
  }

  isOnBench() {
    return this.status === 'on_bench';
  }

  isOut() {
    return this.status === 'out';
  }

  get openStint() {
    const last = this.stints[this.stints.length - 1];
    return last && last.endMs === null ? last : null;
  }

  /** Begin a stint at the given game time unless one is already open. */
  openStintAt(clockMs) {
    if (!this.openStint) this.stints.push({ startMs: clockMs, endMs: null });
  }

  /** Close the open stint; a zero-length stint is dropped. */
  closeStintAt(clockMs) {
    const stint = this.openStint;
    if (!stint) return;
    if (clockMs <= stint.startMs) {
      this.stints.pop();
    } else {
      stint.endMs = clockMs;
    }
  }

  /**
   * Put the participant on the field. Opens a stint if they were off it.
   */
  assignToPosition(positionName, slotIndex, clockMs) {
    this.position = positionName;
    this.positionIndex = slotIndex;
    this.status = 'on_field';
    this.openStintAt(clockMs);
  }

  moveToBench(clockMs) {
    this.closeStintAt(clockMs);
    this.position = null;
    this.positionIndex = null;
    this.status = 'on_bench';
  }

  /** Mark unavailable: off the field, out of the pending lineup, minutes kept. */
  markOut(clockMs) {
    this.moveToBench(clockMs);
    this.clearPendingPosition();
    this.status = 'out';
  }

  markIn() {
    if (this.status === 'out') this.status = 'on_bench';
  }

  assignToPendingPosition(positionName, slotIndex = null) {
    this.pendingPosition = positionName;
    this.pendingPositionIndex = slotIndex;
  }

  clearPendingPosition() {
    this.pendingPosition = null;
    this.pendingPositionIndex = null;
  }

  /** Move the pending lineup slot to active; no pending slot means bench. */
  applyPendingPosition(clockMs) {
    if (this.pendingPosition !== null) {
      this.assignToPosition(this.pendingPosition, this.pendingPositionIndex, clockMs);
      this.clearPendingPosition();
    } else if (!this.isOut()) {
      this.moveToBench(clockMs);
    }
  }

  /**
   * Total game ms played as of the given game time.
   * @param {number} clockMs
   */
  getPlayTimeMs(clockMs) {
    return this.stints.reduce(
      (sum, s) => sum + Math.max(0, (s.endMs ?? clockMs) - s.startMs),
      0
    );
  }

  /**
   * Game ms played inside [fromMs, toMs).
   */
  getPlayTimeBetween(fromMs, toMs, clockMs) {
    return this.stints.reduce((sum, s) => {
      const start = Math.max(s.startMs, fromMs);
      const end = Math.min(s.endMs ?? clockMs, toMs);
      return sum + Math.max(0, end - start);
    }, 0);
  }

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
      pendingPositionIndex: this.pendingPositionIndex,
      stints: this.stints.map(s => ({ ...s }))
    };
  }

  static fromJSON(data) {
    return new Participant(data);
  }
}
