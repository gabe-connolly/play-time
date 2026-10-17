import { Sport, Position } from '../models/Sport.js';
import { Formation } from '../models/Formation.js';

/**
 * Soccer Sport Configuration
 */
const soccerPositions = [
  new Position({ name: 'Goalkeeper', abbr: 'GK', color: 'bg-yellow-200', defaultCount: 1 }),
  new Position({ name: 'Defender', abbr: 'DEF', color: 'bg-blue-200', defaultCount: 4 }),
  new Position({ name: 'Midfielder', abbr: 'MID', color: 'bg-green-200', defaultCount: 3 }),
  new Position({ name: 'Forward', abbr: 'FWD', color: 'bg-red-200', defaultCount: 3 })
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
  teamSizes: [7, 9, 11],
  positions: soccerPositions,
  formations: soccerFormations
});

/** Upper bound for any single position in a custom lineup. */
export const MAX_CUSTOM_POSITION_COUNT = 6;

/** Period counts a game can be split into, with the label for one period. */
export const PERIOD_OPTIONS = [
  { count: 2, label: 'Halves', short: 'H' },
  { count: 3, label: 'Thirds', short: 'P' },
  { count: 4, label: 'Quarters', short: 'Q' }
];

/**
 * Human label for a period, e.g. "1st Half", "Q3", "Period 2".
 * @param {number} index - zero-based period index
 * @param {number} count - total periods in the game
 */
export function periodLabel(index, count) {
  const n = index + 1;
  if (count === 2) return n === 1 ? '1st Half' : '2nd Half';
  if (count === 4) return `Q${n}`;
  return `Period ${n}`;
}
