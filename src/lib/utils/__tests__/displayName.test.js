import { describe, it, expect } from 'vitest';
import { getDisplayName } from '../displayName.js';

describe('getDisplayName Utility', () => {
  const player = {
    firstName: 'John',
    lastName: 'Doe',
    nickname: 'Johnny'
  };

  it('should return full name by default', () => {
    expect(getDisplayName(player)).toBe('John Doe');
  });

  it('should return full name when format is "full"', () => {
    expect(getDisplayName(player, 'full')).toBe('John Doe');
  });

  it('should return nickname when format is "nickname"', () => {
    expect(getDisplayName(player, 'nickname')).toBe('Johnny');
  });

  it('should return full name when format is "nickname" but no nickname exists', () => {
    const playerNoNickname = {
      firstName: 'Jane',
      lastName: 'Smith',
      nickname: ''
    };
    expect(getDisplayName(playerNoNickname, 'nickname')).toBe('Jane Smith');
  });

  it('should return last name format', () => {
    expect(getDisplayName(player, 'last')).toBe('Doe, J.');
  });

  it('should return empty string for null player', () => {
    expect(getDisplayName(null)).toBe('');
  });

  it('should return empty string for undefined player', () => {
    expect(getDisplayName(undefined)).toBe('');
  });
});
