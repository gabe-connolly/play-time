# CLAUDE.md

## Quick Reference

Node >= 22.12 is required by Vite 7 (`nvm use 22`). The package manager is **bun**.

- **Dev**: `bun run dev`
- **Build**: `bun run build` (outputs to `dist/`)
- **Test**: `bun run test --run`
- **Preview**: `bun run preview`
- **Android**: `bun run cap:sync` (build + `cap sync android`), `bun run android:debug`, `bun run android:release` (signed AAB; needs `~/.config/play-time/keystore.properties`)

## Process

After completing any build or code change:
1. Run `bun run build`. It must complete with zero errors.
2. Run `bun run test --run`. All tests must pass.
3. Open the app in a browser and verify there are no runtime errors in the console.

## Architecture

- SvelteKit 2 + Svelte 5 runes, client-only with the **hash router** (`#/teams/:id`). Link with `href()` / `go()` from `$lib/utils/nav.js`.
- Static adapter → `dist/`, wrapped by **Capacitor 8** for Android (`android/`, app id `games.justforyou.playtime`, landscape-locked).
- All data is one schema-versioned document (`$lib/data/schema.js`), persisted by `$lib/utils/storage.js`: Capacitor Preferences on native, localStorage on the web. v1 data (`field_coach_team`) migrates on first load.
- `appStore.svelte.js` owns teams, games and settings. Models are replaced, never mutated in place, so runes see the change (`mutateGame(id, (copy, now) => ...)`).
- **Playtime is measured on the game clock, never the wall clock.** `GameClock` caps at the current period's end, and `Participant.stints` hold game-clock ms. Don't put `Date.now()` in the models.
- `gameStore.svelte.js` is transient game-screen UI state plus the side countdown timer.
- Touch drag-and-drop goes through `$lib/utils/touchDrag.js` (taps still click; drops target `[data-drop-zone]`).
- Tailwind CSS 4 and lucide-svelte. Text colors meet WCAG AAA (7:1).
- Tests: Vitest + @testing-library/svelte, in `__tests__/` dirs. Component tests are named `*.svelte.test.js`.
- Store listing kit, privacy policy and graphics live in `store/`.
