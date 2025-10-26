import { describe, it, expect } from 'vitest';
import { getAllSports } from '../sports';

describe('sports config', () => {
  it('exports an array', () => {
    expect(Array.isArray(getAllSports())).toBe(true);
  });
});

