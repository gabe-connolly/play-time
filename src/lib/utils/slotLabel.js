const LABELS_BY_COUNT = {
  1: ['Center'],
  2: ['Left', 'Right'],
  3: ['Left', 'Center', 'Right'],
  4: ['Left', 'Center Left', 'Center Right', 'Right'],
  5: ['Left', 'Center Left', 'Center', 'Center Right', 'Right']
};

/**
 * Directional name for a slot within a position line, e.g. "Left", "Center Right"
 * @param {number} index
 * @param {number} total
 */
export function getDirectionalLabel(index, total) {
  return LABELS_BY_COUNT[total]?.[index] ?? `Position ${index + 1}`;
}

/**
 * Short form of the directional name, e.g. "L", "CR"; a slot number past five slots
 * @param {number} index
 * @param {number} total
 */
export function getDirectionalAbbr(index, total) {
  const label = LABELS_BY_COUNT[total]?.[index];
  return label ? label.split(' ').map(word => word[0]).join('') : `${index + 1}`;
}
