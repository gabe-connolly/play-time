# CLAUDE.md

## Quick Reference

- **Dev**: `npm run dev` (requires Node >= 22, use `nvm use 22`)
- **Build**: `npm run build` (outputs to `dist/`)
- **Test**: `npm run test -- --run`
- **Preview**: `npm run preview`

## Process

After completing any build or code change:
1. Run `npm run build` — must complete with zero errors
2. Run `npm run test -- --run` — all tests must pass (ignore empty test suite warnings for placeholder files)
3. Open the app in a browser and verify there are no runtime errors in the console (check DevTools → Console for unhandled exceptions, failed network requests, etc.)

## Architecture

- SvelteKit 2.x + Svelte 5 (runes API: `$state`, `$derived`, `$props`)
- Static adapter → `dist/`, SPA with `index.html` fallback
- Tailwind CSS 4, lucide-svelte for icons
- Stores use `.svelte.js` extension for rune support
- Data persists to `localStorage` (no backend, offline-first PWA)
- Tests: Vitest + @testing-library/svelte, files in `__tests__/` dirs
