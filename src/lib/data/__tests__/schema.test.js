import { describe, it, expect } from 'vitest';
import {
  migrateLegacyTeam,
  normalizeDoc,
  parseImport,
  exportDoc,
  mergeDocs,
  emptyDoc,
  SCHEMA_VERSION
} from '../schema.js';
import { Game } from '$lib/models/Game.js';
import { Team } from '$lib/models/Team.js';

// Shape of the v1 `field_coach_team` record, including stale lineup and timer state.
const legacyTeam = {
  id: 'legacy-team',
  name: 'U10 Blue',
  description: 'Fall season',
  sportId: 'soccer',
  teamSize: 7,
  activeFormation: { name: '2-3-1', positions: { Goalkeeper: 1 } },
  players: [
    {
      id: 'p1',
      firstName: 'Matthew',
      lastName: 'Bee',
      nickname: 'Matty',
      jerseyNumber: '7',
      status: 'on_field',
      position: 'Forward',
      positionIndex: 0,
      pendingPosition: null,
      pendingPositionIndex: null,
      playTimeMs: 17444000000,
      fieldEntryTime: 1774137600000
    },
    { id: 'p2', firstName: 'Anthony', lastName: 'Bay', jerseyNumber: 12, status: 'on_bench' }
  ]
};

describe('schema', () => {
  it('migrates a v1 team into one team with roster fields only', () => {
    const doc = migrateLegacyTeam(legacyTeam, 123);
    expect(doc.schemaVersion).toBe(SCHEMA_VERSION);
    expect(doc.games).toEqual([]);
    expect(doc.teams).toHaveLength(1);
    expect(doc.teams[0]).toMatchObject({ id: 'legacy-team', name: 'U10 Blue', createdAt: 123 });
    expect(doc.teams[0].players[0]).toEqual({
      id: 'p1',
      firstName: 'Matthew',
      lastName: 'Bee',
      nickname: 'Matty',
      jerseyNumber: '7'
    });
    expect(doc.teams[0].players[1].jerseyNumber).toBe('12');
  });

  it('accepts a raw v1 team as an import', () => {
    const doc = parseImport(JSON.stringify(legacyTeam), 0);
    expect(doc.teams[0].players).toHaveLength(2);
  });

  it('rejects files that are not app data', () => {
    expect(() => parseImport('not json', 0)).toThrow('valid JSON');
    expect(() => parseImport('{"hello":1}', 0)).toThrow('Not a Play Time');
    expect(() => parseImport(JSON.stringify({ schemaVersion: 99, teams: [], games: [] }), 0)).toThrow('newer');
  });

  it('round-trips teams, players and games through export and import', () => {
    const team = new Team({ id: 't', name: 'Tigers', createdAt: 5, players: [{ id: 'a', firstName: 'A', lastName: 'B', jerseyNumber: '9' }] });
    const game = Game.create({
      id: 'g',
      team,
      config: { totalMinutes: 50, periodCount: 2, size: 7, formationName: '2-3-1', positionCounts: { Goalkeeper: 1, Defender: 2, Midfielder: 3, Forward: 1 } },
      availablePlayerIds: ['a'],
      now: 10
    });
    game.assignToPosition('a', 'Goalkeeper', 0, 10);
    game.startClock(10);
    game.end(10 + 60000);

    const doc = { ...emptyDoc(), teams: [team.toJSON()], games: [game.toJSON()] };
    const back = parseImport(exportDoc(doc, 0), 0);
    expect(back.teams).toEqual(doc.teams);
    expect(back.games).toEqual(doc.games);
    expect(Game.fromJSON(back.games[0]).getPlaytimeSummary(0)[0].totalMs).toBe(60000);
  });

  it('merges imports by id without dropping existing records', () => {
    const current = { ...emptyDoc(), teams: [{ id: 'x', name: 'Old' }, { id: 'y', name: 'Keep' }] };
    const incoming = normalizeDoc({ schemaVersion: 2, teams: [{ id: 'x', name: 'New' }], games: [] }, 0);
    const merged = mergeDocs(current, incoming);
    expect(merged.teams.map(t => t.name).sort()).toEqual(['Keep', 'New']);
  });

  it('importing an older backup keeps players and game progress added since', () => {
    const current = {
      ...emptyDoc(),
      teams: [{ id: 't', name: 'Tigers', players: [{ id: 'a', firstName: 'A' }, { id: 'new', firstName: 'N' }] }],
      games: [{ id: 'g', status: 'final', clock: { elapsedMs: 3000000 } }, { id: 'h', status: 'live', clock: { elapsedMs: 900 } }]
    };
    const older = normalizeDoc({
      schemaVersion: 2,
      teams: [{ id: 't', name: 'Tigers FC', players: [{ id: 'a', firstName: 'Ann' }] }],
      games: [{ id: 'g', status: 'live', clock: { elapsedMs: 600000 } }, { id: 'h', status: 'live', clock: { elapsedMs: 100 } }]
    }, 0);
    const merged = mergeDocs(current, older);
    expect(merged.teams[0].name).toBe('Tigers FC');
    expect(merged.teams[0].players.map(p => p.firstName).sort()).toEqual(['Ann', 'N']);
    expect(merged.games.find(g => g.id === 'g').status).toBe('final');
    expect(merged.games.find(g => g.id === 'h').clock.elapsedMs).toBe(900);
  });
});
