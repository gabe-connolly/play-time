import { describe, it, expect } from 'vitest';
import { Player } from '../Player.js';

describe('Player Model', () => {
  const data = { id: 'p1', firstName: 'John', lastName: 'Doe', nickname: 'Johnny', jerseyNumber: '10' };

  it('formats display names', () => {
    const p = new Player(data);
    expect(p.getDisplayName('full')).toBe('John Doe');
    expect(p.getDisplayName('nickname')).toBe('Johnny');
    expect(p.getDisplayName('last')).toBe('Doe, J.');
    expect(new Player({ ...data, nickname: '' }).getDisplayName('nickname')).toBe('John Doe');
  });

  it('serializes only roster fields', () => {
    expect(new Player({ ...data, status: 'on_field', playTimeMs: 5 }).toJSON()).toEqual(data);
  });
});
