import { goto } from '$app/navigation';

/**
 * Href for an in-app path under the hash router, e.g. href('/teams/abc').
 * @param {string} path
 */
export function href(path) {
  return `#${path}`;
}

/**
 * Navigate to an in-app path.
 * @param {string} path
 * @param {{ replaceState?: boolean }} [options]
 */
export function go(path, options = {}) {
  return goto(href(path), options);
}
