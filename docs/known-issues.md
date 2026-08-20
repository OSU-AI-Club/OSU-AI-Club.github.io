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
- **`EVENTS` now comes from Google Calendar**, not from a hand-edited array — see
  [calendar-sync.md](calendar-sync.md). The Events page still has designed empty states, but they are
  no longer what ships: they are what a visitor sees if the calendar is bare or a sync has failed.
  Keep them wired up; they are the degraded-state UI, not dead code.
- Homepage stat counters, HackAI prize amounts, and the Projects hero stat strip are **illustrative
  numbers**, not audited figures.

## Functional gaps

- **There is no RSVP.** The old buttons only flipped a local React flag ("RSVP SECURED") — they never
  opened a URL, never persisted, and reset on reload — so they were replaced with an **Add to
  Calendar** link to the event's Google Calendar page. If real attendance tracking is ever needed it
  has to be a form, not a client-side flag.
- **"Add to Calendar" opens Google's event page, not a one-click add.** It uses the API's `htmlLink`,
  so a signed-out visitor meets a sign-in wall. A `calendar/render?action=TEMPLATE&…` URL would be a
  true one-click add that works signed out; the sync script already has every input it needs.
- **Multi-day events only appear on their start date** in the calendar grid. `indexEventsByDate()`
  maps one event to exactly one date, so a span would mean either duplicating the event (breaking id
  uniqueness) or teaching the calendar about ranges. The card text still shows the full span. HackAI
  is a two-day event, so this is visible today.
- **Links inside a calendar event's description are stripped** to plain text by the sync script's
  HTML flattening. Officers are told to use a `Recap:` directive instead.
- **The sync window is a rolling ±12 months**, so events silently stop being published a year after
  they happen, recaps included. A permanent archive would mean merging into the snapshot rather than
  replacing it.
- **Scheduled workflows are disabled after 60 days of repository inactivity.** A club repo goes quiet
  every summer, so expect the 6-hourly rebuild to switch itself off; the Actions tab shows an
  "Enable workflow" banner. The Apps Script trigger keeps working meanwhile.
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
