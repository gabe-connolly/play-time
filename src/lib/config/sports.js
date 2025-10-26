import { Sport, Position } from '../models/Sport.js';
import { Formation } from '../models/Formation.js';

/**
 * Soccer Sport Configuration
 */
const soccerPositions = [
  new Position({ name: 'Goalkeeper', abbr: 'GK', color: 'bg-yellow-400', defaultCount: 1 }),
  new Position({ name: 'Defender', abbr: 'DEF', color: 'bg-blue-400', defaultCount: 4 }),
  new Position({ name: 'Midfielder', abbr: 'MID', color: 'bg-green-400', defaultCount: 3 }),
  new Position({ name: 'Forward', abbr: 'FWD', color: 'bg-red-400', defaultCount: 3 })
];

const soccerFormations = {
  '7v7': [
    new Formation({ name: '2-2-2', positions: { Goalkeeper: 1, Defender: 2, Midfielder: 2, Forward: 2 } }),
    new Formation({ name: '2-3-1', positions: { Goalkeeper: 1, Defender: 2, Midfielder: 3, Forward: 1 } }),
    new Formation({ name: '3-2-1', positions: { Goalkeeper: 1, Defender: 3, Midfielder: 2, Forward: 1 } })
  ],
  '9v9': [
    new Formation({ name: '3-3-2', positions: { Goalkeeper: 1, Defender: 3, Midfielder: 3, Forward: 2 } }),
    new Formation({ name: '3-2-3', positions: { Goalkeeper: 1, Defender: 3, Midfielder: 2, Forward: 3 } }),
    new Formation({ name: '3-4-1', positions: { Goalkeeper: 1, Defender: 3, Midfielder: 4, Forward: 1 } })
  ],
  '11v11': [
    new Formation({ name: '4-3-3', positions: { Goalkeeper: 1, Defender: 4, Midfielder: 3, Forward: 3 } }),
    new Formation({ name: '4-4-2', positions: { Goalkeeper: 1, Defender: 4, Midfielder: 4, Forward: 2 } }),
    new Formation({ name: '3-5-2', positions: { Goalkeeper: 1, Defender: 3, Midfielder: 5, Forward: 2 } }),
    new Formation({ name: '4-2-3-1', positions: { Goalkeeper: 1, Defender: 4, Midfielder: 5, Forward: 1 } })
  ]
};

export const SOCCER = new Sport({
  id: 'soccer',
  name: 'Soccer',
  minPlayers: 7,
  maxPlayers: 11,
  positions: soccerPositions,
  formations: soccerFormations
});

/**
 * Field Hockey Sport Configuration
 */
const fieldHockeyPositions = [
  new Position({ name: 'Goalkeeper', abbr: 'GK', color: 'bg-yellow-400', defaultCount: 1 }),
  new Position({ name: 'Defender', abbr: 'DEF', color: 'bg-blue-400', defaultCount: 3 }),
  new Position({ name: 'Midfielder', abbr: 'MID', color: 'bg-green-400', defaultCount: 3 }),
  new Position({ name: 'Forward', abbr: 'FWD', color: 'bg-red-400', defaultCount: 3 })
];

const fieldHockeyFormations = {
  '6v6': [
    new Formation({ name: '1-2-2', positions: { Goalkeeper: 1, Defender: 1, Midfielder: 2, Forward: 2 } }),
    new Formation({ name: '2-1-2', positions: { Goalkeeper: 1, Defender: 2, Midfielder: 1, Forward: 2 } })
  ],
  '7v7': [
    new Formation({ name: '2-2-2', positions: { Goalkeeper: 1, Defender: 2, Midfielder: 2, Forward: 2 } }),
    new Formation({ name: '2-3-1', positions: { Goalkeeper: 1, Defender: 2, Midfielder: 3, Forward: 1 } })
  ],
  '11v11': [
    new Formation({ name: '3-3-3', positions: { Goalkeeper: 1, Defender: 3, Midfielder: 3, Forward: 3 } }),
    new Formation({ name: '4-3-3', positions: { Goalkeeper: 1, Defender: 4, Midfielder: 3, Forward: 3 } }),
    new Formation({ name: '3-4-3', positions: { Goalkeeper: 1, Defender: 3, Midfielder: 4, Forward: 3 } })
  ]
};

export const FIELD_HOCKEY = new Sport({
  id: 'field_hockey',
  name: 'Field Hockey',
  minPlayers: 6,
  maxPlayers: 11,
  positions: fieldHockeyPositions,
  formations: fieldHockeyFormations
});

/**
 * All available sports
 */
export const SPORTS = {
  soccer: SOCCER,
  field_hockey: FIELD_HOCKEY
};

/**
 * Get sport by ID
 * @param {string} sportId
 * @returns {Sport|undefined}
 */
export function getSportById(sportId) {
  return SPORTS[sportId];
}

/**
 * Get all sports as array
 * @returns {Sport[]}
 */
export function getAllSports() {
  return Object.values(SPORTS);
}
