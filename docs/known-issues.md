# Known issues & deliberate gaps

Things that look like bugs but are known. Read before "fixing" them.

## Content placeholders awaiting real data

- **Officer bios** are neutral role descriptions, not real bios. The originals were placeholder text
  that attributed invented internships and research interests to real named people. Replace them only
  with copy each officer has written and approved.
- **Most officers have no photo** and render an initials tile. Add headshots per
  [content-and-data.md](content-and-data.md#officer-headshots).
- **Most officers have empty `socials: {}`.** The previous values pointed at accounts belonging to
  other people or to accounts that don't exist.
- The **Vice President** entry is a real vacancy (`name: 'TBD'`), not a data error.
- **`EVENTS` is intentionally empty.** The eight previous entries were placeholder events with
  invented descriptions and `example.com` links, so they were removed rather than shipped as if real.
  The Events page renders designed empty states — the calendar still paginates, and the empty rail
  and both section fallbacks point at Discord and the newsletter. Add real events per
  [content-and-data.md](content-and-data.md#add-an-event); nothing else needs touching.
- Homepage stat counters, HackAI prize amounts, and the Projects hero stat strip are **illustrative
  numbers**, not audited figures.

## Functional gaps

- **RSVP buttons do nothing but set local state.** `handleRsvp` in `src/pages/Events.tsx` flips a
  React flag to show "RSVP SECURED"; it never opens `rsvpUrl`, never persists, and resets on reload.
  The `rsvpUrl` field is currently dead data. Wire it to the real form before the site is relied on
  for attendance.
- **"Sandbox Code" on the project modal fires an `alert()`** instead of linking to a repo
  (`src/pages/Projects.tsx`). `ProjectItem` has no `repoUrl` field yet.
- **Project card images are remote Unsplash URLs** (`ProjectItem.image`). Officer photos were moved to
  bundled assets for exactly this reason — remote images break, cost a round trip, and leak referrers.
  Project images should follow, into `assets/projects/`.
- **No deep linking.** See [architecture.md](architecture.md#navigation-state-not-a-router). A host
  serving anything other than `index.html` for unknown paths will 404.

## Build & tooling

- **`@types/react` and `@types/react-dom` are not installed.** React ships no type
  definitions of its own, and with `allowJs: true` TypeScript infers React from its
  JavaScript source. The practical effect is that `React.FC<Props>` annotations across
  the codebase resolve to something loose rather than being checked, and class
  components cannot see inherited `props` / `state` (see the `declare props` workaround
  in `CanvasErrorBoundary.tsx`). `npm run lint` passes largely because it is not
  actually checking React usage. Installing them is the right fix but will surface
  pre-existing errors that need working through.

- The JS bundle is **~1 MB (≈300 kB gzipped)**, over Vite's warning threshold. three.js and GSAP
  dominate it and are only needed by the Home hero; a `React.lazy` split of `NeuralNetworkCanvas`
  would cut most of it.
- `@google/genai`, `express`, and `dotenv` are dependencies that **nothing imports**. Likewise
  `.env.example` and `metadata.json` describe an AI Studio runtime this app doesn't use. Safe to
  remove, but verify your deploy target doesn't read `metadata.json` first.
- There is **no test suite and no ESLint config**. `npm run lint` is `tsc --noEmit`.
- `assets/` was previously covered by an `assets/.gitignore` containing `*`, so no image was ever
  committed and a fresh clone could not build. That file has been removed — **do not reintroduce it**,
  and make sure new images under `assets/` are actually committed.
- Git still has stale index entries under `assets/.aistudio/`. The real files now live in
  `assets/images/` and `assets/sponsors/`; the deletions just need to be staged.

## Theming

- Every color now resolves through a token in `src/index.css`; see [styling.md](styling.md). Two
  deliberate raw-color exceptions remain, both commented in place: the white sponsor plate in
  `SponsorsBar.tsx` and the favicon fallback hex in `main.tsx`.
- `text-muted` in light mode is 3.4:1 — below AA for body text. It is used only for metadata,
  captions, and small caps. Don't promote it to body copy without darkening it.
- `accent-tertiary` (purple) is the weakest brand color on charcoal. The dark token is already
  lightened to `#A87BE8`; the raw `#8B4FDB` is for fills, borders, and large display type only.
- The three.js hero repaints its materials on theme change but does **not** re-tint in-flight beam
  meshes — a cascade fired at the exact moment of a toggle finishes in white, which is the intended
  highlight color anyway.

## Accessibility

- Officer and project cards are clickable `<div>`s with no `role`, `tabIndex`, or keyboard handler —
  the flip-card modals are mouse-only to open. `Escape` does close them.
- Under `prefers-reduced-motion: reduce`, the custom scroll, the scroll reveals, and the hero's
  ambient rotation all back off. `PageTransition`'s slide and the hero's node pulse still run
  regardless of that preference.
- Filter and RSVP buttons lack `aria-pressed` / `aria-live` state. The theme toggle does carry
  `aria-label` and `aria-pressed`.
