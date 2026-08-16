# Styling

## Tailwind v4 — no config file

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin. There is deliberately
**no `tailwind.config.js`**; all theming happens in [`src/index.css`](../src/index.css). Adding a
`tailwind.config.js` will not do what you expect.

## The one rule

**Never write a raw color in a component.** No `#0E1B2E`, no `rgba(…)`, no `text-green-500`,
no `bg-white`. Every color resolves through a token defined in `src/index.css`. This is enforced by
review, and checkable:

```bash
grep -rn "#[0-9A-Fa-f]\{6\}" src/ --include='*.tsx'   # expect zero hits
```

Two documented exceptions, both commented in place: the white sponsor plate in `SponsorsBar.tsx`
(vendor logos are dark-on-transparent and need a light plate in both themes) and the fallback hex in
`main.tsx`'s favicon painter.

## Two-layer token architecture

`src/index.css` has two layers, and the split is load-bearing:

```css
/* LAYER 1 — raw values, redeclared per theme. Invisible to Tailwind. */
:root { color-scheme: light; --ui-bg-primary: #F4F7FA; --ui-accent-primary: #2A75B3; … }
.dark { color-scheme: dark;  --ui-bg-primary: #16191D; --ui-accent-primary: #4F9DDB; … }

/* LAYER 2 — the Tailwind utility surface. */
@theme inline {
  --color-bg-primary: var(--ui-bg-primary);
  --color-accent-primary: var(--ui-accent-primary);
}
```

**`inline` is not optional.** A plain `@theme` copies the literal value into every utility
(`.bg-bg-primary{background-color:#F4F7FA}`), which makes the `.dark` overrides inert. `@theme inline`
emits `background-color: var(--ui-bg-primary)` instead, so the cascade does the theming. `:root` and
`.dark` have equal specificity, so `.dark` wins only because it comes second — keep that order.

`color-scheme` on each selector is what makes native scrollbars and form controls follow the theme.

To change a color, edit the `--ui-*` value in Layer 1. You should almost never need to touch Layer 2.

## Tokens

Every Layer 2 token becomes a full family of utilities: `--color-accent-primary` gives you
`bg-accent-primary`, `text-accent-primary`, `border-accent-primary`, `bg-accent-primary/40`, etc.

### Surfaces and type

| Token | Light | Dark |
| --- | --- | --- |
| `bg-primary` | `#F4F7FA` | `#16191D` charcoal |
| `bg-secondary` | `#E8EEF5` | `#1C2027` |
| `bg-elevated` | `#FFFFFF` | `#22272F` |
| `bg-sunken` | `#E2E9F2` | `#101317` |
| `text-primary` | `#16191D` | `#F2F4F7` |
| `text-secondary` | `#4A5563` | `#B4BCC7` |
| `text-muted` | `#8792A3` | `#7C8695` |
| `text-nav` | `#2C333D` | `#C9D1DC` |
| `veil-band` | `rgba(206,220,237,.55)` | `rgba(9,12,16,.50)` |
| `veil-band-strong` | `rgba(206,220,237,.78)` | `rgba(9,12,16,.72)` |
| `border-subtle` / `border-medium` / `border-strong` | blue-tinted hairlines | same, brighter |

`veil-band` is for **alternating section bands**, and it replaced opaque `bg-bg-secondary` there.
Bands are translucent now because the page mesh (below) has to read through them: a band is no
longer "slightly darker grey" but "less of the mesh", which is a bigger perceived step than the 3%
gap between `#F4F7FA` and `#E8EEF5` ever gave. `veil-band-strong` is the denser variant, used only
by the sponsors bar. Both recede — darker than the page — in *both* themes.

Don't use `veil-band` on a card. Cards stay opaque `bg-bg-elevated`; they need to read as objects
sitting on the background, not as holes in it.

### Brand

| Token | Light | Dark |
| --- | --- | --- |
| `accent-primary` | `#2A75B3` | `#4F9DDB` |
| `accent-primary-hover` | `#1F5B8E` | `#6FB0E4` |
| `accent-secondary` (green) | `#1A7A4A` | `#4FDB8B` |
| `accent-tertiary` (purple) | `#6B33B8` | `#A87BE8` |
| `on-accent` | `#FFFFFF` | `#10141A` |
| `*-dim` variants | 10–18% tint of the parent | same |

**Why light mode isn't literally `#4F9DDB`:** that blue is only **2.9:1 against white**, so it fails
as link text and fails as a button fill carrying a white label. Light mode uses the same hue darkened
to 4.9:1. Symmetrically, in dark mode `#4F9DDB` carries **dark** text (`on-accent`, 6.0:1), not white
— so an accent button's label is always `text-on-accent`, never `text-white`.

Purple at `#8B4FDB` clears 3:1 but not 4.5:1 on charcoal, which is why the dark token lifts to
`#A87BE8`. Use the raw `#8B4FDB` only for fills, borders, and large display type. For the same
reason `accent-tertiary-on-inverse` is `#A87BE8` in *both* themes — 5.8:1 on the light-mode inverse
panel (`#16191D`) and 4.6:1 on the dark-mode one (`#252A32`), where `#8B4FDB` would fall under 3:1
against the lighter of the two.

### Inverse surfaces

Four elements are deliberately dark islands: the navbar/footer logo chip, the HackAI grand-prize
card, the HackAI teaser panel, and image scrims. In light mode they are charcoal with white text; in
dark mode `surface-inverse` resolves **lighter** than the page (`#252A32` on `#16191D`) so they still
read as panels instead of vanishing.

| Token | Use |
| --- | --- |
| `surface-inverse` / `surface-inverse-deep` | panel background and its gradient end |
| `text-on-inverse` / `text-on-inverse-muted` | type on those panels |
| `border-inverse` | hairlines on those panels |
| `accent-primary-on-inverse` / `accent-secondary-on-inverse` / `accent-tertiary-on-inverse` | **identical in both themes** — the panel is dark either way, so accents inside stay at the saturated end of the ramp |
| `overlay` | scrim over imagery (replaces `bg-black/60`) |
| `nav-scrim` | the navbar's translucent scrolled background |

If you put an accent color inside an inverse panel, reach for the `-on-inverse` variant. Using plain
`accent-primary` there gives you the *light-mode* dark blue on a dark panel — only 3.6:1.

### Status and effects

`status-success` / `status-warning` / `status-danger` replace the old `green-500` / `orange-500` /
`#dc2626`. `badge-accent` backs the metric pill on the Projects modal.

Effects are variables rather than tokens because they go inside arbitrary values:

- `var(--ui-accent-glow)` — the tint under accent button shadows
- `var(--ui-shadow-color)` — neutral drop shadow; deepens to near-black in dark mode
- `shadow-card` / `shadow-card-hover` — full card shadow utilities
- `var(--ui-page-mesh)` / `var(--ui-page-mesh-column)` — the ambient background gradients

Written as `shadow-[0_4px_14px_var(--ui-accent-glow)]`.

The two mesh variables are **stacks of five and four radial-gradients**, not colors. They are
deliberately absent from `@theme inline` — putting them in the color namespace would emit nonsense
like `text-page-mesh`. Consume them as `bg-[image:var(--ui-page-mesh)]`.

## The ambient background

[`src/components/BackgroundMesh.tsx`](../src/components/BackgroundMesh.tsx) paints one fixed,
full-viewport mesh gradient that every page floats over. Page roots carry no background at all;
section bands are `veil-band`. Two soft lobes inside it drift on 48s and 64s translate-only loops
(`animate-mesh-drift-a` / `-b`), hidden below `md` and gated behind `motion-safe:`.

Three things about it are load-bearing:

- **It must stay a sibling of `SmoothScrollProvider` in `App.tsx`, never inside it.** That provider
  transforms `#smooth-scroll-content` every rAF, and a transformed ancestor makes descendant
  `position: fixed` *and* `background-attachment: fixed` resolve against the transformed box rather
  than the viewport. Anything anchored to the viewport has to live outside that subtree. For the
  same reason, **never use `background-attachment: fixed` inside a page** — it would render one way
  under `prefers-reduced-motion: reduce` (where the provider returns bare children) and another way
  otherwise.
- **`-z-10` is safe.** Nothing above it creates a stacking context — `body`'s `overflow-x: hidden`
  propagates to the viewport so body doesn't clip, `#root` has no CSS, and
  `#application-container-viewport` is a plain static flex container. It paints above body's
  background color and below all in-flow content.
- **`body` keeps only `background-color`.** Don't re-add a `background-image` there; it would stack a
  second full-viewport gradient underneath the mesh and tint it. The flat fill still shows during
  macOS rubber-band overscroll and backs `::-webkit-scrollbar-track`.

### The mesh owns blue

Pages still carry their own localized radial glow blobs, but since the mesh is blue-dominant and
washes blue across the top of every page, **a section blob should carry green or purple, not blue** —
otherwise it doubles up and goes muddy. Current assignment: About green, Events green, Get Involved
purple. HackAI's hero blob and the footer's corner glow were removed outright because the mesh
already covers exactly where they sat.

### The Home exception

[`Home.tsx`](../src/pages/Home.tsx)'s content wrapper is the one element that keeps an opaque
`bg-bg-primary` — it slides up over the sticky three.js hero and has to occlude it. Instead of the
shared mesh it paints its own opaque copy via `bg-[image:var(--ui-page-mesh-column)]`;
`background-color` and `background-image` are different properties, so both classes apply without
conflict. The column variant uses px radii tuned to that wrapper's real height rather than the
viewport-relative percentages of the main mesh.

## Typography

The site is single-typeface: **Roboto**, pulled from Google Fonts by the `@import` on line 1 of
`index.css` at weights 400/500/600/700/800/900. That weight list is driven by what the JSX actually
uses (`font-medium` through `font-black`) — check before trimming it.

All three font tokens deliberately resolve to the same family:

```css
@theme inline {
  --font-sans:    "Roboto", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Roboto", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "Roboto", ui-sans-serif, system-ui, sans-serif;
}
```

This is not leftover from an unfinished edit. The tokens stay separate so the ~80 existing
`font-display` and `font-mono` classes keep working as live hooks — reintroducing a second face is a
one-line change here and touches no component. `@layer base` applies `--font-sans` to `body` and
`--font-display` to `h1`–`h6`.

One consequence to know: `font-mono` is decorative in this codebase, not for code. `TextScramble`
renders its whole animation in it and `StatsBar` uses it for the large counters — both relied on
fixed character width to stay put. Under proportional Roboto they reflow slightly as characters
change. If that ever needs undoing, point `--font-mono` at `"Roboto Mono", ui-monospace, monospace`
and append `&family=Roboto+Mono:wght@400;500;700` to the import URL.

## When to use `dark:` instead of a token

Almost never. A token swap covers ~95% of cases and is the reason this refactor was cheap. Reach for
`dark:` only when the *relationship* between two colors inverts rather than their values — currently
just the sponsor plate border. `@custom-variant dark (&:where(.dark, .dark *))` at the top of
`index.css` binds `dark:` to the class on `<html>`, not to `prefers-color-scheme`.

## Theme switching

[`src/theme.ts`](../src/theme.ts) is a small external store (not React context) exposing
`useTheme()`, `subscribe()`, `toggleTheme()`, and `setPreference()`. It tracks a *preference*
(`light` / `dark` / `system`) separately from the *resolved theme*, persists to `localStorage` under
`osu-aic-theme`, and follows `prefers-color-scheme` while the preference is `system`.

It is a plain store rather than context because the three.js hero is imperative and subscribes from
inside a `useEffect` that must not re-run — see `docs/architecture.md`.

An **inline, blocking** `<script>` in `index.html` applies the stored class before first paint. It
must stay inline; the module bundle loads too late and every dark-mode visitor would see a white
flash. Its storage key must stay in sync with `THEME_STORAGE_KEY`.

`ThemeToggle.tsx` renders the control — `variant="inline"` in the navbar, `variant="full"` in the
mobile drawer.

## Boot splash tokens

The boot splash (`index.html`, see `docs/architecture.md`) is the **one place in the codebase that
hardcodes brand colours**, and it is not a violation of [the one rule](#the-one-rule) — it is forced.
The splash paints before `src/index.css` exists, because that stylesheet is render-blocking behind
its Google Fonts `@import`, so no `--ui-*` token is resolvable yet.

Its `<style>` block declares a parallel `--sp-*` set keyed off `html` / `html.dark`:

| `--sp-*` | Copies | Light | Dark |
|---|---|---|---|
| `--sp-bg` | `--ui-bg-primary` | `#F4F7FA` | `#16191D` |
| `--sp-accent` | `--ui-accent-primary` | `#2A75B3` | `#4F9DDB` |
| `--sp-accent-hi` | `--ui-accent-primary-hover` | `#6FB0E4` | `#A8D2F2` |
| `--sp-dim` | — (silhouette wash) | `rgba(22,25,29,.12)` | `rgba(242,244,247,.1)` |
| `--sp-text` | — (meter label) | `rgba(22,25,29,.55)` | `rgba(242,244,247,.55)` |

**If you change `--ui-bg-primary` or `--ui-accent-primary`, change these too.** `--sp-bg` matching
`--ui-bg-primary` is load-bearing rather than cosmetic: the exit swaps the splash for the real page
mid-sweep, and that swap is only invisible because the two backgrounds are the same colour.

The splash uses `ui-monospace` for the same reason — waiting on Roboto would defeat the point.

## Scroll reveal animations

Section blocks and cards fade and rise into view as you scroll to them: 16px, 500ms, once per page
visit. Since pages fully unmount on navigation, a reveal replays the next time you visit that page.

[`src/hooks/useReveal.ts`](../src/hooks/useReveal.ts) owns **one** `IntersectionObserver` shared by
every target (~80 of them), and unobserves each on first intersection. It works inside
`SmoothScrollProvider`'s transformed container because IntersectionObserver maps an element's box
through ancestor transforms into viewport space.

### Two entry points — picking the wrong one breaks layout

| Use | When |
| --- | --- |
| `<Reveal delay={staggerDelay(idx)}>` | Cards in a plain grid, and **anything with a transform-based hover** |
| `{...useRevealProps(delay)}` spread on the existing element | Section headers and any element that must stay a *direct* child of its container |

**The wrapper is mandatory for elements with `hover:-translate-y-*` / `hover:scale-*`.** The reveal's
`transform` rules are unlayered, so they beat Tailwind's layered utilities — an in-place reveal on
such an element silently kills its hover. The wrapper keeps the two transforms on separate elements.

**In-place is mandatory where a wrapper would become the grid child:**

- `StatsBar` — `divide-y`/`divide-x` draws separators between *direct* children; wrapping each stat
  cell removes them. The whole band reveals as one unit instead.
- `Footer`, `AboutSection`, `Projects` — children carry `lg:col-span-*`. A wrapper without the span
  collapses the 12-col layout.

Where a wrapper *is* used inside a stretch grid (`GetInvolved`'s three boxes), **both** the wrapper
and the card need `h-full`, or the boxes stop matching heights.

### Details worth preserving

- The revealed state is `transform: none`, not `translateY(0)`. A lingering transform makes the
  element a containing block, which offsets `getBoundingClientRect()` for the officer/project
  flip-card measurement and re-anchors `position: fixed` descendants.
- The hidden state lives **inside** `@media (prefers-reduced-motion: no-preference)`, so under
  `reduce` nothing is ever hidden and the accessible path needs no JS to rescue it. The hook also
  starts revealed if `IntersectionObserver` is missing — content at `opacity: 0` must never strand.
- In `About` and `Projects`, the `<Reveal>` wraps *both* branches of the card/placeholder swap. If it
  unmounted with the card, closing the modal would replay that card's reveal.
- `staggerDelay(idx)` caps at 8 steps so a 9-card grid doesn't trail by half a second.

## Conventions in the JSX

- **Arbitrary values everywhere.** Font sizes are written as `text-[13.5px]`, shadows as
  `shadow-[0_4px_14px_var(--ui-accent-glow)]`. Match the surrounding style rather than rounding to
  Tailwind's default scale.
- **Stable `id` attributes** on most sections and interactive elements (`hero-primary-cta`,
  `officer-card-shell-${id}`, `footer-contact`). Nothing scrolls to `#footer-contact` any more since
  the "Contact Us" tab was replaced by the Get Involved page, but it is kept as a deep-link target.
  Don't rename these casually.
- **Fixed card dimensions.** Officer cards are `300×380`, project cards `h-[420px]`. The flip-to-modal
  animation measures the card with `getBoundingClientRect()` and animates from those exact numbers,
  so changing a card's size means checking the expanded state too.
- Pages start with `pt-[72px]` to clear the fixed navbar.
- Tailwind v4's dynamic spacing scale means `w-5.5`, `h-4.5`, and `duration-350` are valid. Utilities
  it does *not* generate (`leading-zero`, `animate-duration-200`) silently do nothing — verify a class
  exists in the built CSS if a style mysteriously has no effect.
