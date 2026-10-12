/**
 * GameClock
 * Period-based game clock. "Game ms" is time the clock has actually run;
 * it never advances while paused, between periods, or past a period's end.
 * Wall time enters only through the `now` arguments, and a running clock
 * can never advance further than the end of its current period.
 */

export class GameClock {
  constructor({
    periodCount,
    periodLengthMs,
    periods = [{ startMs: 0, endMs: null }],
    elapsedMs = 0,
    runningSince = null
  }) {
    this.periodCount = periodCount;
    this.periodLengthMs = periodLengthMs;
    this.periods = periods.map(p => ({ ...p })); // [{ startMs, endMs|null }] in game ms
    this.elapsedMs = elapsedMs; // Game ms banked as of the last pause
    this.runningSince = runningSince; // Wall ms when the clock last started, or null
  }

  get periodIndex() {
    return this.periods.length - 1;
  }

  get currentPeriod() {
    return this.periods[this.periodIndex];
  }

  get isRunning() {
    return this.runningSince !== null;
  }

  /** True once the current period has reached its end. */
  get isPeriodOver() {
    return this.currentPeriod.endMs !== null;
  }

  get isLastPeriod() {
    return this.periodIndex >= this.periodCount - 1;
  }

  /** Game ms at which the current period ends. */
  get periodEndMs() {
    return this.currentPeriod.startMs + this.periodLengthMs;
  }

  /**
   * Current game time in ms, capped at the end of the current period.
   * @param {number} now - wall ms
   */
  clockMs(now) {
    if (!this.isRunning) return this.elapsedMs;
    const run = Math.max(0, now - this.runningSince);
    return Math.min(this.elapsedMs + run, this.periodEndMs);
  }

  /** Time left in the current period. */
  remainingMs(now) {
    return Math.max(0, this.periodEndMs - this.clockMs(now));
  }

  /** Time elapsed in the current period. */
  periodElapsedMs(now) {
    return this.clockMs(now) - this.currentPeriod.startMs;
  }

  /** Start or resume the clock. No-op if running or the period is over. */
  start(now) {
    if (this.isRunning || this.isPeriodOver) return false;
    this.runningSince = now;
    return true;
  }

  /** Pause the clock, banking elapsed game time. */
  pause(now) {
    if (!this.isRunning) return false;
    this.elapsedMs = this.clockMs(now);
    this.runningSince = null;
    return true;
  }

  /**
   * Advance bookkeeping: when a running clock has reached the period's end,
   * pause it and close the period.
   * @returns {boolean} true if the period just ended
   */
  tick(now) {
    if (this.isRunning && this.clockMs(now) >= this.periodEndMs) {
      this.pause(now);
      this.currentPeriod.endMs = this.elapsedMs;
      return true;
    }
    return false;
  }

  /** Close the current period early (e.g. the referee blew the whistle). */
  endPeriod(now) {
    if (this.isPeriodOver) return false;
    this.pause(now);
    this.currentPeriod.endMs = this.elapsedMs;
    return true;
  }

  /** Open the next period, paused. Only valid once the current one is over. */
  nextPeriod() {
    if (!this.isPeriodOver || this.isLastPeriod) return false;
    this.periods.push({ startMs: this.elapsedMs, endMs: null });
    return true;
  }

  toJSON() {
    return {
      periodCount: this.periodCount,
      periodLengthMs: this.periodLengthMs,
      periods: this.periods.map(p => ({ ...p })),
      elapsedMs: this.elapsedMs,
      runningSince: this.runningSince
    };
  }

  static fromJSON(data) {
    return new GameClock(data);
  }
}
