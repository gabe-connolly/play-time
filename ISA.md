---
slug: play-time
project: ~/projects/personal/play-time
phase: climbing
progress: 0/24
principal_stated_goal: "I want to take the app as it as as just a proof of concept, and take it to the next level by building it as an app that can be fully shipped on the Google play store."
---

# Play Time: youth soccer playtime manager for Google Play

## Problem
Field Coach is a single-team PWA proof of concept. It has no game entity, no game length or periods, and its playtime math is based on wall-clock time. That math has already produced 290737-minute timers. It also can't be installed from Google Play.

## Vision
A coach installs Play Time from Google Play onto a sideline tablet, enters a roster in two minutes, and configures Saturday's game: 50 minutes in halves, 7v7, three kids out sick. They run the game from one landscape screen. The clock tells them when the half is over. At the final whistle they see exactly how many minutes each kid played, half by half, and the season's games sit in a history they can trust.

## Out of Scope
- Sports other than soccer. Field hockey is removed.
- Accounts, cloud sync, or any network traffic.
- Ads, in-app purchases, analytics.
- iOS.

## Principles
- Playtime is measured on the game clock, never on the wall clock.
- All data stays on the device. Export and import are the only way data moves.
- Keep the game screen that already works. Extend it rather than rewrite it.

## Constraints
- SvelteKit 2 + Svelte 5 runes, Tailwind 4, Capacitor 8, bun.
- Android package `games.justforyou`, app name "Play Time", locked to landscape.
- WCAG 2.2 AAA text contrast (7:1, 4.5:1 for large text).

## Features

### F1 · Teams and rosters
Why: a coach often runs more than one team, and the roster is the durable thing a season is built on.
- [ ] C1: A user can create, rename and delete teams, and the team list persists across reloads.
- [ ] C2: Each team has a roster of players with first name, last name, jersey number and an optional nickname, supporting add, edit and delete.

### F2 · Game setup
Why: every game differs (length, format, who showed up), so config belongs to the game, not the team.
- [ ] C3: Game setup captures total minutes and periods (2, 3 or 4), and each period's length is the total divided by the period count.
- [ ] C4: The size choice is 7v7, 9v9 or 11v11 with a formation picker, or custom with a count per position. The field shows exactly those slots.
- [ ] C5: An availability checklist (all checked by default) picks which roster players take part. Start is disabled until at least one player is available.

### F3 · Game management
Why: the sideline screen is the product. It has to do everything the PoC did, plus know about periods.
- [ ] C6: The PoC game features all still work: the field with position groups, the Bench and Team tabs, quick sub, Prepare Subs / Pending / Sub Now / Discard, drag-and-drop, and the 5/10/15m side timer.
- [ ] C7: The clock counts down per period. At 0:00 it auto-pauses and offers "Start period N+1", or "End game" after the last period.
- [ ] C8: Playtime only accrues while the game clock runs. Restoring a game whose clock was left running can't add more than the rest of the current period. (The 290737-minute bug can't recur.)
- [ ] C9: A player can be toggled in or out mid-game. Marking a player out takes them off the field and bench and keeps their minutes. Marking them back in returns them to the bench.
- [ ] C10: The screen stays awake while the game is live on Android.

### F4 · History
Why: fair playtime is a season-long promise, so a finished game must outlive the screen.
- [ ] C11: End game marks the game final and shows a summary with each player's minutes total and per period.
- [ ] C12: The team page lists past games, newest first, and opens each summary read-only.

### F5 · Data
Why: on-device data is only trustworthy if it survives upgrades and can move between tablets.
- [ ] C13: Storage is one schema-versioned document. It uses Capacitor Preferences on native and localStorage on the web.
- [ ] C14: v1 data (`field_coach_team`) migrates automatically into one team with stale timers dropped. Import also accepts the v1 format.
- [ ] C15: Export → import round-trips every team, player and game unchanged. On native the export file goes out through the share sheet.

### F6 · Android release
Why: the goal is Google Play, and the store has its own definition of shippable.
- [ ] C16: The Capacitor Android project builds with `appId games.justforyou` and `appName Play Time`, and the activity is locked to landscape.
- [ ] C17: The service worker isn't registered inside the native app. The web PWA still registers it.
- [ ] C18: A debug APK installs and runs on the Fire tablet in landscape, with Gabriel's roster migrated.
- [ ] C19: A signed release AAB builds. The upload keystore lives outside the repo and is never committed.
- [ ] C20: The Play listing kit exists: privacy policy, data-safety answers, short and full descriptions, 512 icon, feature graphic, tablet screenshots.
- [ ] C21: The AAB is uploaded to the internal testing track. This is outward-facing and needs Gabriel's go.

### F0 · Cross-cutting
Why: these hold across every feature.
- [ ] C22: Every text node on the new screens meets AAA contrast (in-browser audit, 0 failures).
- [ ] C23: `bun run build` and `bun run test` both pass, with real tests for the clock engine, stints, migration and the export round trip.
- [ ] C24: Soccer is the only sport in config and UI, and the team sizes offered are 7, 9, 11 and custom.

## Anti-claims
- [ ] A1: No wall-clock timestamp feeds a player's playtime. (Grep: `Date.now` doesn't appear in the playtime path.)
- [ ] A2: The app makes no network requests at runtime. (Grep shows no fetch or XHR outside the service worker, and the browser network log stays empty.)
- [ ] A3: No secrets or keystore are committed. (`git ls-files` shows no `.jks`, `.keystore` or `keystore.properties`.)

## Decisions
- Clock restore: a game clock found running on restore keeps running, capped at the current period's end. The plan said "restore paused", but the real game continued while the app was closed, and the cap alone is what bounds the damage.
- Hash router (`kit.router.type = 'hash'`), so routing works from Capacitor's bundled files and from any static host without server rewrites.

## Not yet specified
- Phone-size landscape layout. Play will offer the app to phones unless the device catalog is restricted.
- Where the privacy policy is hosted. It needs a public URL, and publishing it is Gabriel's call.
