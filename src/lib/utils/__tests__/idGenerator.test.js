import { describe, it, expect } from 'vitest';
import { generateId } from '../idGenerator.js';

describe('generateId Utility', () => {
  it('should generate a string ID', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs with reasonable length', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(10);
    expect(id.length).toBeLessThan(30);
  });

  it('should generate multiple unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});
