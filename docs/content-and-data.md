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
| [`data/events.ts`](../src/data/events.ts) | `EVENTS` |
| [`data/projects.ts`](../src/data/projects.ts) | `PROJECTS` |
| [`data/faqs.ts`](../src/data/faqs.ts) | `FAQS`, `HACKAI_FAQS` |
| [`data/index.ts`](../src/data/index.ts) | Barrel file — re-exports everything above so `import ... from '../data'` still works unchanged |

Components should keep importing from `'../data'` (or `'./data'`) as before — the barrel file resolves
that to whichever files actually define the export. Only reach into a specific file (e.g.
`'../data/officers'`) if you have a reason to avoid pulling in the rest.

### Contact & links

| Export | Value / purpose | Rendered by |
| --- | --- | --- |
| `CLUB_EMAIL` | Officer contact address | `Footer.tsx`, `Projects.tsx` |
| `CLUB_DISCORD_URL` | Discord invite | `Footer.tsx` |
| `CLUB_INSTAGRAM_URL` | Instagram profile | `Footer.tsx` |
| `CLUB_LINKEDIN_URL` | Club LinkedIn page | `Footer.tsx` |
| `NEWSLETTER_URL` | Newsletter signup (`go.osu.edu/aiclub`) | `Footer.tsx` |
| `PROJECT_APPLICATION_URL` | Google Form for project-team signups | `Projects.tsx`, default `applyUrl` for every project |
| `HACKAI_REGISTRATION_URL` | HackAI registration — currently aliased to the same Google Form | `HackAI.tsx` |

### Meeting time & place

`MEETING_LOCATION`, `MEETING_DAY`, `MEETING_TIME`, and the derived `MEETING_SCHEDULE`. Referenced on
Home, Events, Projects, and inside `HACKAI_FAQS`. **Change these four in one place and the whole site
follows** — never hardcode a room or time in a component.

### HackAI event details

`HACKAI_NAME`, `HACKAI_DATE_BADGE`, `HACKAI_DATE_FULL`, `HACKAI_DATE_SHORT`, `HACKAI_LOCATION_BADGE`,
`HACKAI_LOCATION_FULL`, and the derived `HACKAI_BANNER_BADGE`. The `_BADGE` variants are uppercase for
pill/eyebrow styling; the `_FULL` variants are title case for body copy. Bumping the year means
editing these constants — the string "HackAI 2027" should not appear literally anywhere else.

### The three collections

| Export | Type | Rendered by |
| --- | --- | --- |
| `OFFICERS` | `Officer[]` | About page — flip cards |
| `EVENTS` | `ClubEvent[]` | Events page — calendar, upcoming grid, recap strip. **Empty by design**; split by date, not a flag |
| `EVENT_CATEGORIES` | `{id, label, accent}[]` | Events page filter pills, calendar legend, all accent colors |
| `PROJECTS` | `ProjectItem[]` | Projects page — search/filter grid |
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

`EVENTS` in [`src/data/events.ts`](../src/data/events.ts) is **currently empty on purpose** — the
previous entries were placeholder content with invented descriptions and `example.com` links. The
Events page renders designed empty states until real events are added. Append one like this:

```ts
{
  id: 'pytorch-intro',        // kebab-case, unique — used as the React key
  category: 'Workshop',       // an id from EVENT_CATEGORIES (same file)
  title: 'Intro to PyTorch & Neural Networks',
  description: 'One or two sentences shown on the event card.',
  date: '2026-10-07',         // YYYY-MM-DD — the ONLY date field
  time: MEETING_TIME,         // or a literal, e.g. 'Weekend-long'
  location: MEETING_LOCATION, // or a literal, e.g. 'Ohio Union Ballroom'
  rsvpUrl: 'https://...',
  recapUrl: 'https://...',    // optional; shown once the event is past
}
```

**`date` is the single source of truth for everything time-related.** The `OCT` / `07` card badge,
the `Oct 7, 2026` recap-strip label, the weekday, the calendar cell it lands in, and whether the
event counts as past are all derived from it at render time by [`src/utils/date.ts`](../src/utils/date.ts).
There used to be separate `dateString`, `day`, and `month` fields; they drifted out of sync because
nothing checked them. **Do not add them back.**

Past-ness is derived too — an event moves itself into the "Past Events Highlights" strip once its
date passes, no edit required. The optional `isPast` field is an **override**, for pinning an event
on the wrong side of that line (e.g. holding a just-finished event out of the strip until its
`recapUrl` exists). Leave it off unless you specifically need that.

Ordering does not matter; the page sorts by date.

### Add an event category

`EVENT_CATEGORIES` at the top of [`src/data/events.ts`](../src/data/events.ts) is the one category
list. Adding a row there adds the filter pill, the calendar legend entry, and the accent color
everywhere at once:

```ts
{ id: 'Career', label: 'Career Nights', accent: 'tertiary' },
```

`accent` is a design-token name — `'primary'` (blue), `'secondary'` (green), `'tertiary'` (purple),
`'warm'` (amber), or `'gradient'` (the blue/green split HackAI uses) — not a raw Tailwind class, so
styling stays out of the content layer. `categoryAccentClass()` and `categoryDotClass()` in
[`src/utils/events.ts`](../src/utils/events.ts) map it to the utilities. The
`ClubEvent['category']` type is derived from this array, so a typo in an event's `category` is a
compile error.

**Give each category a distinct accent.** All five are currently spoken for, so a sixth category
needs a new color token in `index.css` plus a case in both mapper functions. Don't reach for grey —
the calendar's "+N more" overflow dot already uses it, and reusing it would make a category dot read
as an overflow marker. Two categories sharing an accent defeats the point of the legend.

Small round marks (calendar dots, rail bullets, legend swatches) go through `categoryDotClass`, which
renders HackAI as a blue core with a green ring rather than a gradient — a two-stop gradient has
nowhere to resolve on a 6px circle and blends into something indistinguishable from the Speaker
green. The wide card accent bar keeps the real gradient via `categoryAccentClass`.

### Add a project

Append to `PROJECTS`. `tags` populate the "Core Technology" filter pills automatically; `category`
populates "Domain Category". `stats` is a free-form headline metric string. `image` is currently a
remote Unsplash URL for every project — see [known-issues.md](known-issues.md).

Per-project roadmap milestones are **not** in `data/projects.ts`: they live in `getProjectMilestones()` in
`src/pages/Projects.tsx`, keyed by project `id`, with a generic fallback.

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

Drop the file in `assets/sponsors/`, then import it and add an entry to the `sponsors` array in
`src/components/SponsorsBar.tsx`. The array is duplicated 6× to fill the marquee — leave that alone.

## Content that is *not* in `data/`

Some copy is still inline in components. If you can't find a string in `src/data/`, grep for it:

- **Homepage stat counters** (`120+ Active Members`, `$12K HackAI Prize Pool`) — `statsList` in
  `src/components/StatsBar.tsx`
- **Mission statement** — `src/components/MissionStatement.tsx`
- **"Who We Are" blurb and category tiles** — `src/components/AboutSection.tsx`
- **HackAI prize table and weekend schedule** — `prizes` and `schedule` arrays in `src/pages/HackAI.tsx`
- **Projects page hero stat strip** (`4 Active`, `28 Total`, …) — inline JSX in `src/pages/Projects.tsx`
- **Hero headline and subheading** — inline JSX in `src/pages/Home.tsx`
- **Footer legal/contact copy** — `src/components/Footer.tsx`

Moving any of these into `src/data/` is a welcome cleanup.
