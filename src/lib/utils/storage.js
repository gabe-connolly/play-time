/**
 * Storage utility for persisting team data
 */

const STORAGE_KEY = 'field_coach_team';

/**
 * Save team to localStorage
 * @param {Team} team
 */
export function saveTeam(team) {
  try {
    const data = team.toJSON();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving team:', error);
    return false;
  }
}

/**
 * Load team from localStorage
 * @returns {Object|null}
 */
export function loadTeam() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading team:', error);
    return null;
  }
}

/**
 * Clear team data from localStorage
 */
export function clearTeam() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing team:', error);
    return false;
  }
}

/**
 * Check if storage is available
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
