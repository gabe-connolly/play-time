# Google Play listing kit: Play Time

Everything Play Console asks for, ready to paste. Items marked **[YOU]** are attestations or account details only the developer can supply.

## App details

| Field | Value |
|---|---|
| App name (30 max) | Play Time |
| Package | `games.justforyou` |
| Default language | English (United States), en-US |
| App or game | App |
| Free or paid | Free |
| Category | Sports |
| Contact email | **[YOU]** |
| Privacy policy URL | **[YOU]** Host `store/privacy-policy.md` (or `static/privacy.html`, which ships at `/privacy.html` in the web build) at a public URL |

## Short description (80 max)

> Run your youth soccer lineup and subs, and see every kid's minutes at a glance.

## Full description (4000 max)

> Play Time keeps the sideline fair. Set up your team once, then run each game from a single landscape screen built for a tablet.
>
> **Set up in minutes**
> • Create as many teams as you coach
> • Roster with first name, last name, jersey number and an optional nickname
> • Each game gets its own length, halves, thirds or quarters, and 7v7, 9v9, 11v11 or a custom lineup
> • Pick who's available today; late arrivals can join mid-game
>
> **Run the game**
> • Period countdown clock that stops on its own at the end of each half or quarter
> • Tap or drag players between the bench and the field
> • Plan the next rotation with Prepare Subs, then make every change at once with Sub Now
> • Mark an injured or departing player out without losing their minutes
> • A side timer (5, 10 or 15 minutes) for rotation reminders
> • The screen stays on during a live game
>
> **Know who played**
> • Every player's minutes, live during the game
> • A final summary broken down by period
> • Game history for the whole season
>
> **Private by design**
> Play Time has no accounts, ads or analytics. Your rosters stay on your device. Export a backup file whenever you want a copy or need to move to a new tablet.

## Graphics

| Asset | File | Spec |
|---|---|---|
| App icon | `store/icon-512.png` | 512×512 PNG, full square (Play applies the mask) |
| Feature graphic | `store/feature-graphic.png` | 1024×500 PNG |
| Tablet screenshots (7" and 10") | `store/screenshots/` | Captured on the Fire tablet at 1280×800 |
| Phone screenshots | **[YOU]** decide: phones are offered by default (see Device catalog) | Play requires at least 2 if phones aren't excluded |

## Data safety form

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | Not applicable (no data collected) |
| Do you provide a way for users to request that their data is deleted? | In-app deletion and Clear all data; nothing is held off-device |

Why "No" is accurate: the app makes no network requests (verified by grep of the source and by the browser's resource log). Play's definition of "collect" covers data transmitted off the device. Data that stays on-device and data a user exports through the share sheet don't count as collection.

## Content rating (IARC questionnaire)

- Category: **Utility, Productivity, Communication or Other**
- Violence, sexuality, language, controlled substances, gambling: **No**
- Users can interact or exchange content: **No**
- Shares location: **No**
- Digital purchases: **No**
- Expected rating: Everyone / PEGI 3

## Target audience and content

- Target age groups: **18 and over**. The app is for coaches; selecting under-13 ages pulls the app into the Families policy.
- Appeals to children: **No**. It has no characters, games or child-directed design.
- Ads: **No ads**
- Government app, financial features, health: **No**
- News app: **No**

## Release

1. `bun run cap:sync && bun run android:release` writes `android/app/build/outputs/bundle/release/app-release.aab`, signed with the upload key.
2. Play Console → Testing → Internal testing → Create release → upload the AAB.
3. Enroll in **Play App Signing** (the default). Google holds the app signing key, and our upload key's SHA-256 is:
   `01:6F:46:BF:F5:7C:33:4C:08:F2:9B:A6:78:8C:18:AC:43:31:16:5F:F5:62:C0:9F:91:F2:D9:EB:CA:FC:13:A4`
4. Before every later release, bump `versionCode` (and `versionName`) in `android/app/build.gradle`.

**Back up the upload keystore** (`~/.config/play-time/upload-keystore.jks` and `keystore.properties`) somewhere safe, such as a password manager. If it's lost, Play can reset the upload key, but that takes a support request and waiting time.

Production access for a personal developer account created after Nov 2023 first needs a closed test with at least 12 testers for 14 days.
