import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../Game.js';
import { Team } from '../Team.js';

const MIN = 60000;
const DAY = 24 * 60 * MIN;

function makeTeam() {
  return new Team({
    id: 't1',
    name: 'Tigers',
    players: [
      { id: 'a', firstName: 'Ava', lastName: 'Ames', jerseyNumber: '1' },
      { id: 'b', firstName: 'Ben', lastName: 'Bell', jerseyNumber: '2' },
      { id: 'c', firstName: 'Cy', lastName: 'Cole', jerseyNumber: '3' },
      { id: 'd', firstName: 'Dee', lastName: 'Dunn', jerseyNumber: '4' }
    ]
  });
}

const config = {
  totalMinutes: 40,
  periodCount: 2,
  size: 'custom',
  formationName: null,
  positionCounts: { Goalkeeper: 1, Defender: 1, Midfielder: 0, Forward: 0 }
};

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = Game.create({ id: 'g1', team: makeTeam(), config, availablePlayerIds: ['a', 'b', 'c'], now: 0 });
  });

  it('includes only available players and splits the period length', () => {
    expect(game.participants.map(p => p.id)).toEqual(['a', 'b', 'c']);
    expect(game.clock.periodLengthMs).toBe(20 * MIN);
    expect(game.formation.getTotalPlayers()).toBe(2);
  });

  it('accrues playtime only while the clock runs', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    expect(game.getParticipant('a').getPlayTimeMs(game.clockMs(10 * MIN))).toBe(0);
    game.startClock(10 * MIN);
    game.pauseClock(15 * MIN);
    // Long pause: nothing accrues.
    expect(game.getParticipant('a').getPlayTimeMs(game.clockMs(90 * DAY))).toBe(5 * MIN);
  });

  it('cannot reproduce the runaway-timer bug: a clock left running months adds at most the period', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    game.startClock(0);
    const restored = Game.fromJSON(JSON.parse(JSON.stringify(game.toJSON())));
    const later = 202 * DAY;
    restored.tick(later);
    expect(restored.getParticipant('a').getPlayTimeMs(restored.clockMs(later))).toBe(20 * MIN);
  });

  it('records substitutions as separate stints', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    game.startClock(0);
    game.substitute('a', 'b', null, 8 * MIN);
    const clockMs = game.clockMs(12 * MIN);
    expect(game.getParticipant('a').getPlayTimeMs(clockMs)).toBe(8 * MIN);
    expect(game.getParticipant('b').getPlayTimeMs(clockMs)).toBe(4 * MIN);
    expect(game.getParticipant('b').position).toBe('Goalkeeper');
    expect(game.getParticipant('a').isOnBench()).toBe(true);
  });

  it('subs made at halftime do not create zero-length stints', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    game.startClock(0);
    game.tick(21 * MIN);
    game.substitute('a', 'b', null, 22 * MIN);
    game.substitute('b', 'c', null, 23 * MIN);
    expect(game.getParticipant('b').stints).toEqual([]);
  });

  it('commits the pending lineup in one step', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    game.assignToPosition('b', 'Defender', 0, 0);
    game.startClock(0);
    game.initializePendingFromActive();
    game.clearPendingPosition('b');
    game.assignToPendingPosition('c', 'Defender', 0);
    game.commitPending(5 * MIN);
    expect(game.getParticipant('b').isOnBench()).toBe(true);
    expect(game.getParticipant('c').position).toBe('Defender');
    expect(game.getParticipant('a').stints).toHaveLength(1);
    expect(game.hasPendingWork()).toBe(false);
  });

  it('marking a player out benches them, keeps minutes, and blocks assignment', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    game.startClock(0);
    game.setAvailability('a', false, 6 * MIN);
    const a = game.getParticipant('a');
    expect(a.isOut()).toBe(true);
    expect(a.getPlayTimeMs(game.clockMs(10 * MIN))).toBe(6 * MIN);
    game.assignToPosition('a', 'Defender', 0, 10 * MIN);
    expect(a.isOut()).toBe(true);
    game.setAvailability('a', true, 11 * MIN);
    expect(game.getParticipant('a').isOnBench()).toBe(true);
  });

  it('adds a late-arriving rostered player', () => {
    game.addParticipant(makeTeam().getPlayer('d'));
    expect(game.getParticipant('d').isOnBench()).toBe(true);
  });

  it('summarises minutes per period and freezes at the end', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    game.startClock(0);
    game.tick(20 * MIN); // end of 1st half
    game.nextPeriod();
    game.startClock(30 * MIN);
    game.substitute('a', 'b', null, 40 * MIN); // 10 min into 2nd half
    game.end(45 * MIN);
    const summary = Object.fromEntries(game.getPlaytimeSummary(999 * DAY).map(r => [r.id, r]));
    expect(summary.a.periodMs).toEqual([20 * MIN, 10 * MIN]);
    expect(summary.a.totalMs).toBe(30 * MIN);
    expect(summary.b.periodMs).toEqual([0, 5 * MIN]);
    expect(game.isFinal).toBe(true);
    expect(game.startClock(1000 * DAY)).toBe(false);
  });

  it('reports formation fill for active and pending lineups', () => {
    game.assignToPosition('a', 'Goalkeeper', 0, 0);
    game.assignToPendingPosition('b', 'Defender', 0);
    expect(game.getFormationStatus().Goalkeeper).toMatchObject({ current: 1, needed: 1, isFull: true });
    expect(game.getFormationStatus(true).Defender).toMatchObject({ current: 1, hasSpace: false });
  });
});
