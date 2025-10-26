import { describe, it, expect, beforeEach } from 'vitest';
import { Team } from '../Team.js';
import { Player } from '../Player.js';
import { Formation } from '../Formation.js';

describe('Team Model', () => {
  let team;
  let player1, player2, player3;

  beforeEach(() => {
    team = new Team({
      id: 'team1',
      name: 'Test Team',
      sportId: 'soccer',
      teamSize: 7
    });

    player1 = new Player({
      id: 'p1',
      firstName: 'John',
      lastName: 'Doe'
    });

    player2 = new Player({
      id: 'p2',
      firstName: 'Jane',
      lastName: 'Smith'
    });

    player3 = new Player({
      id: 'p3',
      firstName: 'Bob',
      lastName: 'Johnson'
    });
  });

  it('should create a team with correct properties', () => {
    expect(team.id).toBe('team1');
    expect(team.name).toBe('Test Team');
    expect(team.sportId).toBe('soccer');
    expect(team.teamSize).toBe(7);
    expect(team.players).toEqual([]);
  });

  it('should add a player to the team', () => {
    team.addPlayer(player1);
    expect(team.players.length).toBe(1);
    expect(team.players[0]).toBe(player1);
  });

  it('should remove a player from the team', () => {
    team.addPlayer(player1);
    team.addPlayer(player2);

    const removed = team.removePlayer('p1');
    expect(removed).toBe(true);
    expect(team.players.length).toBe(1);
    expect(team.players[0].id).toBe('p2');
  });

  it('should get a player by ID', () => {
    team.addPlayer(player1);
    team.addPlayer(player2);

    const found = team.getPlayer('p1');
    expect(found).toBe(player1);
  });

  it('should update a player', () => {
    team.addPlayer(player1);

    const updated = team.updatePlayer('p1', {
      nickname: 'Johnny',
      jerseyNumber: '10'
    });

    expect(updated).toBe(true);
    expect(team.players[0].nickname).toBe('Johnny');
    expect(team.players[0].jerseyNumber).toBe('10');
  });

  it('should get field players', () => {
    player1.assignToPosition('Forward');
    player2.assignToPosition('Midfielder');

    team.addPlayer(player1);
    team.addPlayer(player2);
    team.addPlayer(player3);

    const fieldPlayers = team.getFieldPlayers();
    expect(fieldPlayers.length).toBe(2);
  });

  it('should get bench players', () => {
    player1.assignToPosition('Forward');

    team.addPlayer(player1);
    team.addPlayer(player2);
    team.addPlayer(player3);

    const benchPlayers = team.getBenchPlayers();
    expect(benchPlayers.length).toBe(2);
  });

  it('should get players by position', () => {
    player1.assignToPosition('Forward');
    player2.assignToPosition('Forward');
    player3.assignToPosition('Midfielder');

    team.addPlayer(player1);
    team.addPlayer(player2);
    team.addPlayer(player3);

    const forwards = team.getPlayersByPosition('Forward');
    expect(forwards.length).toBe(2);
  });

  it('should check if formation requirements are met', () => {
    const formation = new Formation({
      name: '2-2-2',
      positions: {
        Goalkeeper: 1,
        Defender: 2,
        Midfielder: 2,
        Forward: 2
      }
    });

    player1.assignToPosition('Goalkeeper');
    team.addPlayer(player1);

    expect(team.meetsFormationRequirements(formation)).toBe(false);

    // Add more players to meet requirements would continue...
  });

  it('should get formation status', () => {
    const formation = new Formation({
      name: '2-2-2',
      positions: {
        Goalkeeper: 1,
        Defender: 2
      }
    });

    player1.assignToPosition('Goalkeeper');
    team.addPlayer(player1);

    const status = team.getFormationStatus(formation);

    expect(status.Goalkeeper).toEqual({
      current: 1,
      needed: 1,
      isFull: true,
      hasSpace: false
    });

    expect(status.Defender).toEqual({
      current: 0,
      needed: 2,
      isFull: false,
      hasSpace: true
    });
  });
});
