import { describe, it, expect } from 'vitest';
import { SOCCER } from '$lib/config/sports.js';

describe('Sport', () => {
  it('finds positions by name and has no formations for unsupported sizes', () => {
    expect(SOCCER.getPosition('Goalkeeper').abbr).toBe('GK');
    expect(SOCCER.getFormationsForTeamSize(8)).toEqual([]);
  });
});
