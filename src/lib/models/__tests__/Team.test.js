import { describe, it, expect } from 'vitest';
import { Team } from '../Team.js';
import { Player } from '../Player.js';

describe('Team Model', () => {
  const make = () => new Team({ id: 't1', name: 'Tigers', players: [{ id: 'a', firstName: 'A', lastName: 'One' }] });

  it('adds, updates and removes players', () => {
    const team = make();
    team.addPlayer(new Player({ id: 'b', firstName: 'B', lastName: 'Two' }));
    expect(team.players).toHaveLength(2);
    expect(team.updatePlayer('a', { jerseyNumber: '9' })).toBe(true);
    expect(team.getPlayer('a').jerseyNumber).toBe('9');
    expect(team.removePlayer('b')).toBe(true);
    expect(team.removePlayer('zzz')).toBe(false);
  });

  it('round-trips through JSON', () => {
    const team = make();
    expect(Team.fromJSON(JSON.parse(JSON.stringify(team.toJSON())))).toEqual(team);
  });
});
