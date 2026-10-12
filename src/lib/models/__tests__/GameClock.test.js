import { describe, it, expect } from 'vitest';
import { GameClock } from '../GameClock.js';

const MIN = 60000;
const DAY = 24 * 60 * MIN;

function halves25() {
  return new GameClock({ periodCount: 2, periodLengthMs: 25 * MIN });
}

describe('GameClock', () => {
  it('does not advance until started', () => {
    const clock = halves25();
    expect(clock.clockMs(10 * MIN)).toBe(0);
    expect(clock.remainingMs(10 * MIN)).toBe(25 * MIN);
  });

  it('counts down while running and holds while paused', () => {
    const clock = halves25();
    clock.start(1000);
    expect(clock.remainingMs(1000 + 5 * MIN)).toBe(20 * MIN);
    clock.pause(1000 + 5 * MIN);
    expect(clock.clockMs(1000 + 60 * MIN)).toBe(5 * MIN);
    clock.start(2 * DAY);
    expect(clock.clockMs(2 * DAY + MIN)).toBe(6 * MIN);
  });

  it('caps at the end of the period even if left running for months', () => {
    const clock = halves25();
    clock.start(0);
    expect(clock.clockMs(200 * DAY)).toBe(25 * MIN);
    expect(clock.remainingMs(200 * DAY)).toBe(0);
  });

  it('auto-pauses and closes the period on tick at 0:00', () => {
    const clock = halves25();
    clock.start(0);
    expect(clock.tick(10 * MIN)).toBe(false);
    expect(clock.tick(26 * MIN)).toBe(true);
    expect(clock.isRunning).toBe(false);
    expect(clock.isPeriodOver).toBe(true);
    expect(clock.currentPeriod.endMs).toBe(25 * MIN);
    expect(clock.start(27 * MIN)).toBe(false);
  });

  it('rolls into the next period paused, with a fresh countdown', () => {
    const clock = halves25();
    clock.start(0);
    clock.tick(25 * MIN);
    expect(clock.nextPeriod()).toBe(true);
    expect(clock.periodIndex).toBe(1);
    expect(clock.isRunning).toBe(false);
    expect(clock.remainingMs(99 * MIN)).toBe(25 * MIN);
    clock.start(100 * MIN);
    expect(clock.clockMs(110 * MIN)).toBe(35 * MIN);
  });

  it('refuses a period beyond the configured count', () => {
    const clock = halves25();
    clock.start(0);
    clock.tick(25 * MIN);
    clock.nextPeriod();
    clock.start(30 * MIN);
    clock.tick(60 * MIN);
    expect(clock.isLastPeriod).toBe(true);
    expect(clock.nextPeriod()).toBe(false);
  });

  it('can end a period early', () => {
    const clock = halves25();
    clock.start(0);
    expect(clock.endPeriod(20 * MIN)).toBe(true);
    expect(clock.currentPeriod.endMs).toBe(20 * MIN);
    clock.nextPeriod();
    expect(clock.periodEndMs).toBe(45 * MIN);
  });

  it('round-trips through JSON mid-run', () => {
    const clock = halves25();
    clock.start(1000);
    const restored = GameClock.fromJSON(JSON.parse(JSON.stringify(clock.toJSON())));
    expect(restored.isRunning).toBe(true);
    expect(restored.clockMs(1000 + 3 * MIN)).toBe(3 * MIN);
  });
});
