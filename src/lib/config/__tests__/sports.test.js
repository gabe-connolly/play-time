import { describe, it, expect } from 'vitest';
import { SOCCER, periodLabel } from '../sports.js';

describe('sports config', () => {
  it('offers 7v7, 9v9 and 11v11 presets', () => {
    expect(SOCCER.getAvailableTeamSizes()).toEqual([7, 9, 11]);
  });

  it('every preset formation fills exactly its team size', () => {
    for (const size of SOCCER.getAvailableTeamSizes()) {
      const formations = SOCCER.getFormationsForTeamSize(size);
      expect(formations.length).toBeGreaterThan(0);
      formations.forEach(f => expect(f.getTotalPlayers()).toBe(size));
    }
  });

  it('labels periods by count', () => {
    expect(periodLabel(1, 2)).toBe('2nd Half');
    expect(periodLabel(2, 4)).toBe('Q3');
    expect(periodLabel(0, 3)).toBe('Period 1');
  });
});
