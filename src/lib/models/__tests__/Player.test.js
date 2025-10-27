import { describe, it, expect } from 'vitest';
import { Player } from '../Player.js';

describe('Player Model', () => {
  const playerData = {
    id: 'player1',
    firstName: 'John',
    lastName: 'Doe',
    nickname: 'Johnny',
    jerseyNumber: '10',
    status: 'on_bench',
    position: null,
  };

  it('should create a player with correct properties', () => {
    const player = new Player(playerData);

    expect(player.id).toBe('player1');
    expect(player.firstName).toBe('John');
    expect(player.lastName).toBe('Doe');
    expect(player.nickname).toBe('Johnny');
    expect(player.jerseyNumber).toBe('10');
    expect(player.status).toBe('on_bench');
    expect(player.position).toBe(null);
  });

  it('should get display name in full format', () => {
    const player = new Player(playerData);
    expect(player.getDisplayName('full')).toBe('John Doe');
  });

  it('should get display name in nickname format', () => {
    const player = new Player(playerData);
    expect(player.getDisplayName('nickname')).toBe('Johnny');
  });

  it('should get display name in last format', () => {
    const player = new Player(playerData);
    expect(player.getDisplayName('last')).toBe('Doe, J.');
  });

  it('should check if player is on field', () => {
    const player = new Player(playerData);
    expect(player.isOnField()).toBe(false);

    player.assignToPosition('Forward');
    expect(player.isOnField()).toBe(true);
  });

  it('should check if player is on bench', () => {
    const player = new Player(playerData);
    expect(player.isOnBench()).toBe(true);

    player.assignToPosition('Forward');
    expect(player.isOnBench()).toBe(false);
  });

  it('should assign player to position', () => {
    const player = new Player(playerData);
    player.assignToPosition('Forward');

    expect(player.position).toBe('Forward');
    expect(player.status).toBe('on_field');
  });

  it('should move player to bench', () => {
    const player = new Player(playerData);
    player.assignToPosition('Forward');
    player.moveToBench();

    expect(player.position).toBe(null);
    expect(player.status).toBe('on_bench');
  });

  it('should serialize to JSON', () => {
    const player = new Player(playerData);
    const json = player.toJSON();

    expect(json).toEqual({
      ...playerData,
      positionIndex: null,
      pendingPosition: null,
      pendingPositionIndex: null
    });
  });

  it('should deserialize from JSON', () => {
    const player = Player.fromJSON(playerData);

    expect(player).toBeInstanceOf(Player);
    expect(player.id).toBe('player1');
    expect(player.firstName).toBe('John');
  });

  it('should assign player to pending position', () => {
    const player = new Player(playerData);
    player.assignToPendingPosition('Forward');

    expect(player.pendingPosition).toBe('Forward');
    expect(player.status).toBe('on_bench'); // Should still be on bench
  });

  it('should clear pending position', () => {
    const player = new Player(playerData);
    player.assignToPendingPosition('Forward');
    player.clearPendingPosition();

    expect(player.pendingPosition).toBe(null);
  });

  it('should apply pending position', () => {
    const player = new Player(playerData);
    player.assignToPendingPosition('Forward');
    player.applyPendingPosition();

    expect(player.position).toBe('Forward');
    expect(player.status).toBe('on_field');
    expect(player.pendingPosition).toBe(null);
  });

  it('should move to bench when applying null pending position', () => {
    const player = new Player({...playerData, status: 'on_field', position: 'Forward'});
    player.clearPendingPosition();
    player.applyPendingPosition();

    expect(player.position).toBe(null);
    expect(player.status).toBe('on_bench');
  });
});
