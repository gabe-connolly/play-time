import { describe, it, expect } from 'vitest';
import { getDirectionalLabel, getDirectionalAbbr } from '../slotLabel.js';

describe('slot labels', () => {
  it('names slots by direction across the line', () => {
    expect(getDirectionalLabel(0, 1)).toBe('Center');
    expect(getDirectionalLabel(1, 2)).toBe('Right');
    expect(getDirectionalLabel(2, 4)).toBe('Center Right');
    expect(getDirectionalLabel(6, 7)).toBe('Position 7');
  });

  it('abbreviates each word of the direction', () => {
    expect(getDirectionalAbbr(0, 2)).toBe('L');
    expect(getDirectionalAbbr(1, 2)).toBe('R');
    expect(getDirectionalAbbr(0, 1)).toBe('C');
    expect(getDirectionalAbbr(1, 4)).toBe('CL');
    expect(getDirectionalAbbr(6, 7)).toBe('7');
  });
});
