import { describe, it, expect } from 'vitest';
import { formatPlayTime } from '../formatTime.js';

describe('formatPlayTime', () => {
  it('formats as M:SS by default', () => {
    expect(formatPlayTime(0)).toBe('0:00');
    expect(formatPlayTime(65_000)).toBe('1:05');
    expect(formatPlayTime(25 * 60_000)).toBe('25:00');
  });

  it('pads minutes to two digits when padMinutes is set', () => {
    expect(formatPlayTime(0, { padMinutes: true })).toBe('00:00');
    expect(formatPlayTime(65_999, { padMinutes: true })).toBe('01:05');
    expect(formatPlayTime(12 * 60_000 + 3_000, { padMinutes: true })).toBe('12:03');
  });
});
