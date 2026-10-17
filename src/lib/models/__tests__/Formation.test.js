import { describe, it, expect } from 'vitest';
import { Formation } from '../Formation.js';

describe('Formation', () => {
  const f = new Formation({ name: '2-3-1', positions: { Goalkeeper: 1, Defender: 2, Midfielder: 3, Forward: 1 } });

  it('totals players and reads counts', () => {
    expect(f.getTotalPlayers()).toBe(7);
    expect(f.getPositionCount('Midfielder')).toBe(3);
    expect(f.getPositionCount('Sweeper')).toBe(0);
  });
});
