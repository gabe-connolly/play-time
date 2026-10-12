---
slug: play-time
project: ~/projects/personal/play-time
phase: climbing
progress: 18/24
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
- [x] C1: A user can create, rename and delete teams, and the team list persists across reloads. — browser: create→rename→delete Test Hawks; list persisted across reload (84476ec)
- [x] C2: Each team has a roster of players with first name, last name, jersey number and an optional nickname, supporting add, edit and delete. — browser: add Zed Zim #22, edit to #23, delete; PlayerForm tests 6/6

### F2 · Game setup
Why: every game differs (length, format, who showed up), so config belongs to the game, not the team.
- [x] C3: Game setup captures total minutes and periods (2, 3 or 4), and each period's length is the total divided by the period count. — browser: 50min quarters shows 4 × 12:30; Game.test splits period length
- [x] C4: The size choice is 7v7, 9v9 or 11v11 with a formation picker, or custom with a count per position. The field shows exactly those slots. — browser: 7v7 2-3-1 field shows 1/3/2/1 slots; custom 1/2/2/3 = 8
- [x] C5: An availability checklist (all checked by default) picks which roster players take part. Start is disabled until at least one player is available. — browser: Hal unchecked → bench 8; None → Start disabled + message

### F3 · Game management
Why: the sideline screen is the product. It has to do everything the PoC did, plus know about periods.
- [ ] C6: The PoC game features all still work: the field with position groups, the Bench and Team tabs, quick sub, Prepare Subs / Pending / Sub Now / Discard, drag-and-drop, and the 5/10/15m side timer. — browser: tap quick-sub, Prepare/Sub Now, Team tab, timer verified; touch drag on device pending unlock [DEFERRED-VERIFY]
- [x] C7: The clock counts down per period. At 0:00 it auto-pauses and offers "Start period N+1", or "End game" after the last period. — browser: 1st Half hit 0:00, auto-paused, Start 2nd Half shown; GameClock.test 8/8
- [x] C8: Playtime only accrues while the game clock runs. Restoring a game whose clock was left running can't add more than the rest of the current period. (The 290737-minute bug can't recur.) — Game.test runaway-timer case (202 days → 20 min cap); browser reload mid-run kept counting
- [x] C9: A player can be toggled in or out mid-game. Marking a player out takes them off the field and bench and keeps their minutes. Marking them back in returns them to the bench. — browser: Dee marked out froze at 0:13, Back in offered; Hal Arrived joined at halftime
- [ ] C10: The screen stays awake while the game is live on Android. [DEFERRED-VERIFY] — needs unlocked tablet

### F4 · History
Why: fair playtime is a season-long promise, so a finished game must outlive the screen.
- [x] C11: End game marks the game final and shows a summary with each player's minutes total and per period. — browser: End game early → summary 1st/2nd Half/Total, per-period sums match
- [x] C12: The team page lists past games, newest first, and opens each summary read-only. — browser: team page Past games (1) newest first, opens summary; Resume shown for live game

### F5 · Data
Why: on-device data is only trustworthy if it survives upgrades and can move between tablets.
- [x] C13: Storage is one schema-versioned document. It uses Capacitor Preferences on native and localStorage on the web. — device: Preferences doc read back (1 team, 7 players); web: localStorage play_time_doc
- [x] C14: v1 data (`field_coach_team`) migrates automatically into one team with stale timers dropped. Import also accepts the v1 format. — browser: seeded field_coach_team → U10 Comets 9 players; device: Gabriel roster migrated via schema.normalizeDoc
- [ ] C15: Export → import round-trips every team, player and game unchanged. On native the export file goes out through the share sheet. — schema.test round-trip passes; browser import merged 1 team; native share sheet [DEFERRED-VERIFY]

### F6 · Android release
Why: the goal is Google Play, and the store has its own definition of shippable.
- [x] C16: The Capacitor Android project builds with `appId games.justforyou` and `appName Play Time`, and the activity is locked to landscape. — dumpsys: versionCode 1, targetSdk 36; manifest sensorLandscape; device screen.orientation landscape
- [x] C17: The service worker isn't registered inside the native app. The web PWA still registers it. — device: serviceWorker.getRegistrations() = 0; app.html guard checks Capacitor.isNativePlatform
- [ ] C18: A debug APK installs and runs on the Fire tablet in landscape, with Gabriel's roster migrated. — installed, DOM shows 1 team/7 players; visual [DEFERRED-VERIFY] tablet locked
- [x] C19: A signed release AAB builds. The upload keystore lives outside the repo and is never committed. — jarsigner: jar verified; SHA-256 01:6F:46…13:A4; git ls-files has no jks/keystore
- [ ] C20: The Play listing kit exists: privacy policy, data-safety answers, short and full descriptions, 512 icon, feature graphic, tablet screenshots. — store/LISTING.md, privacy policy, icon-512, feature graphic done; tablet screenshots + contact email + policy URL pending
- [ ] C21: The AAB is uploaded to the internal testing track. This is outward-facing and needs Gabriel's go.

### F0 · Cross-cutting
Why: these hold across every feature.
- [x] C22: Every text node on the new screens meets AAA contrast (in-browser audit, 0 failures). — in-browser audit 0 failures: home 6, team 30, new-game 41, settings 16, summary 55, game states 66/68/85; probe at 2.31 caught
- [x] C23: `bun run build` and `bun run test` both pass, with real tests for the clock engine, stints, migration and the export round trip. — bun run build ✔; 49/49 tests (GameClock, Game, schema, PlayerForm…)
- [x] C24: Soccer is the only sport in config and UI, and the team sizes offered are 7, 9, 11 and custom. — sports.test: sizes [7,9,11]; rg field_hockey → 0

## Anti-claims
- [x] A1: No wall-clock timestamp feeds a player's playtime. (Grep: `Date.now` doesn't appear in the playtime path.)
- [x] A2: The app makes no network requests at runtime. (Grep shows no fetch or XHR outside the service worker, and the browser network log stays empty.)
- [x] A3: No secrets or keystore are committed. (`git ls-files` shows no `.jks`, `.keystore` or `keystore.properties`.)

## Decisions
- Independent review (fresh context, read-only) found 6 defects, all adopted: ghost player via substitute() with an off-field outgoing player; load error then save overwrote unreadable data (now preserved under a dated key); summary per-period cells floored separately so rows did not add up; import replaced newer team/game copies (now unions players, keeps the further game); pause at 0:00 left the period open; final games mutable at model level. Each has a regression test that failed before the fix (4 model/schema tests) or a browser probe (pending-mode ghost, corrupt-doc preservation, summary row sums).
- Touch input rewritten (`touchDrag.js`): the PoC called preventDefault on touchstart, which swallowed taps, and its bench→field touch drop fired an event nothing listened for.
- Dropping a bench player onto an occupied slot now substitutes; the PoC silently did nothing.
- Clock Reset removed: the period engine plus End game replaces it, and a reset was how the PoC created runaway timers.
- Export on web downloads a file; not exercised in the real browser to avoid writing into the principal's Downloads.
- Clock restore: a game clock found running on restore keeps running, capped at the current period's end. The plan said "restore paused", but the real game continued while the app was closed, and the cap alone is what bounds the damage.
- Hash router (`kit.router.type = 'hash'`), so routing works from Capacitor's bundled files and from any static host without server rewrites.

## Not yet specified
- Phone-size landscape layout. Play will offer the app to phones unless the device catalog is restricted.
- Where the privacy policy is hosted. It needs a public URL, and publishing it is Gabriel's call.
