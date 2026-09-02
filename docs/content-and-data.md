# Content & data

## Start here: `src/data/`

**Almost every editable string, date, link, and list on the site is a named export somewhere under
[`src/data/`](../src/data/).** If someone asks you to change site content, look there first. The
shapes are defined in [`src/types.ts`](../src/types.ts).

Everything is split by concern so each file stays small and easy to edit:

| File | Contents |
| --- | --- |
| [`data/general.ts`](../src/data/general.ts) | Contact links, meeting time/place, HackAI event details |
| [`data/officers.ts`](../src/data/officers.ts) | `OFFICERS` and the headshot-matching helper |
| [`data/sponsors.ts`](../src/data/sponsors.ts) | `SPONSORS` and the logo-matching helper |
| [`data/projects.ts`](../src/data/projects.ts) | `PROJECTS` — currently empty and unrendered, see below |
| [`data/faqs.ts`](../src/data/faqs.ts) | `FAQS`, `HACKAI_FAQS` |
| [`data/index.ts`](../src/data/index.ts) | Barrel file — re-exports everything above so `import ... from '../data'` still works unchanged |

Components should keep importing from `'../data'` (or `'./data'`) as before — the barrel file resolves
that to whichever files actually define the export. Only reach into a specific file (e.g.
`'../data/officers'`) if you have a reason to avoid pulling in the rest.

### Contact & links

| Export | Value / purpose | Rendered by |
| --- | --- | --- |
| `CLUB_EMAIL` | Officer contact address | `Footer.tsx`, `Projects.tsx`, `GetInvolved.tsx` |
| `CLUB_DISCORD_URL` | Discord invite | `Footer.tsx` |
| `CLUB_INSTAGRAM_URL` | Instagram profile | `Footer.tsx` |
| `CLUB_LINKEDIN_URL` | Club LinkedIn page | `Footer.tsx` |
| `NEWSLETTER_URL` | Newsletter signup (`go.osu.edu/aiclub`) | `Footer.tsx` |
| `PROJECT_APPLICATION_URL` | Google Form for project-team signups | `GetInvolved.tsx`, default `applyUrl` for every project |
| `HACKAI_REGISTRATION_URL` | HackAI registration — currently aliased to the same Google Form | `HackAI.tsx` |

### Meeting time & place

`MEETING_LOCATION`, `MEETING_DAY`, `MEETING_TIME`, and the derived `MEETING_SCHEDULE`. Referenced on
Home, Events, and inside `HACKAI_FAQS`. **Change these four in one place and the whole site
follows** — never hardcode a room or time in a component.

### HackAI event details

`HACKAI_NAME`, `HACKAI_DATE_BADGE`, `HACKAI_DATE_FULL`, `HACKAI_DATE_SHORT`, `HACKAI_LOCATION_BADGE`,
`HACKAI_LOCATION_FULL`, and the derived `HACKAI_BANNER_BADGE`. The `_BADGE` variants are uppercase for
pill/eyebrow styling; the `_FULL` variants are title case for body copy. Bumping the year means
editing these constants — the string "HackAI 2027" should not appear literally anywhere else.

### The collections

| Export | Type | Rendered by |
| --- | --- | --- |
| `OFFICERS` | `Officer[]` | About page — flip cards |
| `SPONSORS` | `Sponsor[]` | `SponsorsBar.tsx` — homepage logo marquee |
| `PROJECTS` | `ProjectItem[]` | Nothing — the Projects page is a placeholder (see below) |
| `FAQS` | `{q, a}[]` | `FAQ.tsx`, on the About page |
| `HACKAI_FAQS` | `{q, a}[]` | HackAI page accordion |

## How to make common changes

### Add or update an officer

Append to `OFFICERS` in `src/data/officers.ts`:

```ts
{
  id: 'first-last',            // kebab-case, must be unique — used as the React key
  name: 'First Last',
  role: 'Marketing Officer',
  major: 'Computer Science & Engineering',
  minor: 'Optional — omit the key entirely if none',
  year: '3rd Year',
  initials: 'FL',              // UPPERCASE — shown when there is no photo
  bio: 'One or two sentences.',
  photo: firstLastPhoto,       // optional; see "Officer headshots" below
  socials: { linkedin: '…', github: '…' },  // every key optional; `{}` is fine
}
```

The About page renders three cards per row on desktop, so multiples of three look tidiest.

> **Do not invent biography details.** Bios must be copy the officer actually wrote. The current bios
> are neutral role descriptions precisely because the originals were placeholder text attributing
> fake internships and research to real named people.

### Add an event

**Not in code, and not in this repo at all.** Add it to the **AIC Public Calendar** (the club Google
Calendar). The Events page iframes that calendar directly from Google, so the event appears on the
site immediately — there is no sync, no snapshot and no rebuild.

Two things to know:

- The calendar must stay **public** with *See all event details*, or the embed renders blank.
- The embed is Google's own UI. Event colors, categories, recap links and card styling are no longer
  interpreted by the site — what Google shows is what visitors see.

The calendar the page embeds is set by `GOOGLE_CALENDAR_ID` in
[`src/data/general.ts`](../src/data/general.ts); `GOOGLE_CALENDAR_EMBED_URL` derives from it.

Small round marks (calendar dots, rail bullets, legend swatches) go through `categoryDotClass`, which
renders HackAI as a blue core with a green ring rather than a gradient — a two-stop gradient has
nowhere to resolve on a 6px circle and blends into something indistinguishable from the Speaker
green. The wide card accent bar keeps the real gradient via `categoryAccentClass`.

### Add a project

**Not currently possible without rebuilding the page.** `PROJECTS` is empty and nothing reads it:
`src/pages/Projects.tsx` renders its hero plus an "under construction" notice, and the grid, filter
sidebar and detail modal that consumed the data were removed. `data/projects.ts` and the
`ProjectItem` type are deliberately kept in place for the rebuild.

To restore the showcase, recover the previous `Projects.tsx` from git history and repopulate
`PROJECTS` — the entries are still there, commented out, as a shape reference. Note that per-project
roadmap milestones were never in `data/projects.ts`; they lived in a `getProjectMilestones()` helper
inside the page, keyed by project `id`, with a generic fallback. Folding them into `ProjectItem` is
the better design.

## Images and assets

`assets/` is **not** a static `public/` folder. Nothing in it is copied verbatim. Every image is
imported from TypeScript, hashed, and emitted into `dist/assets/` by Vite:

```ts
import evanMengesPhoto from '../assets/profiles/evan-menges.png';
```

`src/vite-env.d.ts` is what makes those imports typecheck. An image that nothing imports is not
shipped at all.

| Directory | Contents | Imported by |
| --- | --- | --- |
| `assets/images/` | `AI_Logo_Final.png` | `main.tsx` (favicon), `Navbar.tsx`, `Footer.tsx` |
| `assets/profiles/` | Officer headshots | `data/officers.ts` |
| `assets/sponsors/` | Sponsor logos | `SponsorsBar.tsx` |

### Officer headshots

1. Crop to a **square** — the cards use `object-cover`, so a non-square source gets its edges cut off
   unpredictably. On macOS: `sips -c 271 271 input.png --out assets/profiles/first-last.png`
   (`-c` takes *height* then *width* and crops from the center).
2. Aim for roughly **400×400 px**; the largest display slot is 300×280. Bigger just bloats the bundle.
3. Name it kebab-case matching the officer `id`, lowercase `.png` (or `.webp`/`.jpg`/`.jpeg`).
4. That's it — no import or `photo:` field to wire up by hand. `src/data/officers.ts` globs
   `assets/profiles/*` at build time and matches files to officers by `id` automatically.

Officers with no matching file render an initials tile instead — that fallback is intentional and
styled, so leaving the photo off is a valid state, not a bug.

**Never point `photo` at a LinkedIn or other CDN URL.** Those URLs carry signed expiry parameters
(`?e=…`) and silently break after a few months; that is exactly why the field is a bundled asset now.

### Sponsor logos

Same glob-by-`id` mechanism as headshots — `SponsorsBar.tsx` contains **no logo imports** and no
per-sponsor code at all. Everything comes from `SPONSORS` in
[`src/data/sponsors.ts`](../src/data/sponsors.ts):

- **Swap a logo:** replace `assets/sponsors/<id>.<ext>` with the new file. The extension may change
  (`.png` → `.webp` is fine); nothing in code needs editing.
- **Add a sponsor:** add `{ id: 'acme-corp', name: 'Acme Corp' }` to `SPONSOR_RECORDS` and drop
  `assets/sponsors/acme-corp.png` beside the others. Array order is display order.
- **Remove one:** delete its row. The image file can stay — an image nothing imports is never
  shipped.

An entry with no matching file renders its `name` as a text wordmark on the same white plate. That
fallback is intentional and styled, so a roster entry can land before its artwork does.

Two things the component derives, so that adding logos can't break the band:

- The marquee keyframe translates `-50%`, so the row is built as **exactly two identical halves**,
  each padded by repetition to at least `MIN_TILES_PER_HALF`. Any other multiple visibly jumps at
  the loop point.
- Scroll duration is computed from `MARQUEE_SPEED_PX_PER_SEC`, not fixed — a hardcoded duration
  means "cross the row in 25s", so every sponsor added would silently speed the band up. Turn that
  constant, not the CSS.

`src/splash.ts` preloads the first `PRELOADED_SPONSOR_COUNT` logos off the same list, so a rename or
reorder can't leave a dead import behind it.

Logos sit on a **white plate in both themes** because they are dark-on-transparent artwork that
would disappear on a charcoal tile. A white-on-transparent logo will vanish on it — recolor the
source or ask the sponsor for a dark variant. Alternate crops that shouldn't render live in
`assets/sponsors/unused/`, which the glob skips because it does not recurse.

> Every name in `SPONSORS` is a public claim about a real company, under a band labelled
> **"Presenting Partners"**. Only list an organization the club actually has a sponsorship or
> partnership with, and change that label in `SponsorsBar.tsx` if the relationship is weaker.

## Content that is *not* in `data/`

Some copy is still inline in components. If you can't find a string in `src/data/`, grep for it:

- **Homepage stat counters** (`120+ Active Members`, `$12K HackAI Prize Pool`) — `statsList` in
  `src/components/StatsBar.tsx`
- **Mission statement** — `src/components/MissionStatement.tsx`
- **"Who We Are" blurb and category tiles** — `src/components/AboutSection.tsx`
- **HackAI prize table and weekend schedule** — `prizes` and `schedule` arrays in `src/pages/HackAI.tsx`
- **Hero headline and subheading** — inline JSX in `src/pages/Home.tsx`
- **Footer legal/contact copy** — `src/components/Footer.tsx`

Moving any of these into `src/data/` is a welcome cleanup.
