# Architecture

## Navigation: state, not a router

There is **no react-router and no URL routing**. `src/App.tsx` holds a single
`useState<string>('home')` and a `switch` that returns the matching page component.

```
App.tsx
├── Navbar          (fixed, 72px tall, above everything)
└── SmoothScrollProvider
    └── PageTransition        (the animated container)
        ├── <main> → Home | About | Events | HackAI | Projects | GetInvolved
        └── Footer            (passed in as the `footer` prop)
```

The Footer is handed to `PageTransition` as a prop rather than rendered as a
sibling. It has to live **inside** the animated container: as a sibling it stayed
frozen on screen through the fade-out, and then a user who had scrolled to the
bottom would watch the page jump to the top in full view.

Consequences to keep in mind:

- **Deep links don't work.** `/about` is not a real URL; every path serves the same page at `home`.
  Any static host must be configured to serve `index.html` for all routes.
- The browser back button does not move between pages.
- Navigation is a prop: `onNavigate('about')`. Every page and the Navbar/Footer receive it.
- Page IDs are the bare strings `home`, `about`, `events`, `hackai`, `projects`, `getinvolved`.
  Adding a page means touching three places: the `switch` in `App.tsx`, `PAGE_ORDER` in
  `PageTransition.tsx` (drives slide direction), and the nav/footer link lists.
- Every page root adds `pt-[72px]` to clear the fixed navbar. Home is the exception — its hero sits
  *behind* the navbar deliberately.

## Custom scrolling

`src/components/SmoothScrollProvider.tsx` replaces native scrolling with an interpolated one:

- The content is wrapped in a `position: fixed` viewport, and scrolling is faked by writing
  `transform: translate3d(0, -currentY, 0)` on the inner div each frame.
- Real page height is mirrored onto `document.body.style.height` by a `ResizeObserver`, so the
  browser scrollbar still works and `window.scrollY` remains the source of truth.
- Each frame it dispatches a **`smoothscroll` CustomEvent** carrying `{ scrollY }`. Components that
  need scroll position listen for *both* `scroll` and `smoothscroll` — see `Navbar.tsx` and
  `NeuralNetworkCanvas.tsx`. **If you add scroll-reactive code, listen for both.**
- A **`smoothscroll-snap` CustomEvent** tells the provider to jump instantly instead of easing.
  `PageTransition` fires it after switching pages so the new page doesn't visibly scroll up.
- If the user has `prefers-reduced-motion: reduce`, the provider renders children directly and none
  of the above applies.

## Page transitions

`src/components/PageTransition.tsx` runs a fixed ~1030 ms sequence on every page change:
fade/slide out (500 ms) → swap the mounted page + scroll to top → repaint tick (30 ms) → fade/slide
in (500 ms). Slide direction comes from each page's index in `PAGE_ORDER`
(`home, about, hackai, projects, events, getinvolved`); later index slides "forward".

The scroll reset is deliberately timed to land in the middle of that sequence, while the container
is at opacity 0, so the jump is never seen. Anything that should hide during navigation must
therefore sit inside the animated container — that is the whole reason the Footer is passed in.

**The outgoing page fully unmounts.** Any component-level state, and any WebGL/GSAP resource, is
destroyed and rebuilt each time. That is why `NeuralNetworkCanvas` disposes its geometries and
materials in cleanup — see below.

Note that the container is transformed and carries `will-change`, so it is a containing block:
`position: fixed` inside a page resolves against it, not the viewport. The officer and project
modals avoid this by portalling to `document.body`.

## The 3D hero

`src/components/NeuralNetworkCanvas.tsx` (~600 lines, the largest component) renders a 4-layer
fully-connected network of 36 glass spheres in three.js, on the Home page only.

- **Interaction:** drag to rotate with momentum; click a node to fire a recursive cascade of glowing
  "signal" beams down the layers; hover raycasts and highlights individual nodes.
- **Scroll coupling:** scrolling scales the group up and pushes the camera through it.
- **Throttling:** an `IntersectionObserver` sets `scrollRatioRef`, and the rAF loop early-returns when
  the section is <5% visible. Because that skips `clock.getDelta()`, the delta on resume is clamped.
- **Cleanup matters.** Because Home unmounts on every navigation, the effect's return function kills
  all GSAP tweens and disposes every geometry, material, and the renderer (`forceContextLoss()`).
  Without it, browsers hit their WebGL context cap after ~16 visits and the canvas dies.

## Component map

| File | Used by | Notes |
| --- | --- | --- |
| `components/Navbar.tsx` | App | Fixed header; transparent on Home until scrolled 60px |
| `components/Footer.tsx` | App, via `PageTransition`'s `footer` prop | Contact links; still carries the `#footer-contact` anchor |
| `components/SmoothScrollProvider.tsx` | App | See above |
| `components/PageTransition.tsx` | App | See above |
| `components/NeuralNetworkCanvas.tsx` | Home | three.js + GSAP hero |
| `components/StatsBar.tsx` | Home | Count-up numbers; **targets are hardcoded in the file**, not `data/` |
| `components/MissionStatement.tsx` | Home | Mission copy hardcoded in the file |
| `components/SponsorsBar.tsx` | Home | Sponsor logo marquee; logos imported from `assets/sponsors/` |
| `components/HackAITeaser.tsx` | Home | Pulls `HACKAI_*` constants from `data/general.ts` |
| `components/AboutSection.tsx` | About | "Who We Are" block; copy hardcoded in the file |
| `components/FAQ.tsx` | About | Renders `FAQS` from `data/faqs.ts` |
| `components/EventCalendar.tsx` | Events | Interactive month grid; owns view/selection/focus state, roving-tabindex keyboard nav, month clamp and jump pills |
| `components/EventCalendarRail.tsx` | Events | Detail panel beside the calendar; presentational, three states (no events at all / nothing on this day / event list) |
| `components/TextScramble.tsx` | All page titles | Glitch-in text effect, once on mount |
| `components/ThemeToggle.tsx` | Navbar (desktop + mobile drawer) | Light/dark switch; see below |
| `components/Reveal.tsx` | Card grids everywhere | Scroll-reveal wrapper; see [styling.md](styling.md) |
| `components/CanvasErrorBoundary.tsx` | Home | Keeps a WebGL failure from blanking the site |

## Theming

`src/theme.ts` is a ~40-line external store, not React context. It owns a *preference*
(`light` / `dark` / `system`) and a *resolved theme*, writes a `dark` class onto `<html>`, persists to
`localStorage`, and follows the OS setting while the preference is `system`. React components read it
through `useTheme()`; `NeuralNetworkCanvas` calls `subscribe()` directly.

**That split is the reason it isn't context.** The hero's three.js scene lives inside a `useEffect`
with an empty dependency array. If the theme were a React value the effect would have to list it as a
dependency, which would tear down and rebuild the entire WebGL scene on every toggle. Instead the
effect subscribes once and repaints existing materials in place — including each node's stored
`baseColor`, which the hover-reset and beam-cascade paths restore from.

An inline blocking script in `index.html` applies the class before first paint. Full details and the
token tables are in [styling.md](styling.md).

## Boot sequence

First paint is a splash: the club mark as a dim silhouette with the accent colour sweeping across it,
a `LOADING` / `NN%` meter, and then an accent band that sweeps bottom-to-top and uncovers the site.
It runs once per browser session (`sessionStorage['aic-splash-seen']`).

**It is static markup and an inline script in `index.html`, not a component, and that is the entire
point.** The bundle is ~1MB / ~300kB gzipped; a React splash could not render until that had already
downloaded and mounted, which is precisely the wait it exists to cover. Living in the HTML means it
paints off the initial response while the bundle is still in flight. For the same reason it cannot
depend on `src/index.css` — that stylesheet is render-blocking behind a Google Fonts `@import` — so
it carries its own inline `<style>`, its own literal copies of the colour tokens, and a system
monospace stack. See [styling.md](styling.md#boot-splash-tokens).

The mark is `public/aic-mark.png`, a 256px downscale of the logo. It is in `public/` rather than
`assets/` because Vite content-hashes anything imported from `assets/`, and static HTML has no way to
learn the hashed filename.

### The `data-booting` contract

Other entrance animations would otherwise run and finish *behind* the opaque splash, so that the
visitor's first sight of the page is a static one. All three are held:

| Consumer | What is held |
|---|---|
| `src/hooks/useReveal.ts` | Targets are queued instead of observed, then handed to the observer in one batch |
| `src/components/NeuralNetworkCanvas.tsx` | The GSAP scale-emergence tween is created `paused` and played later |
| `src/components/Navbar.tsx` | The fixed header fades/drops in, `NAV_ENTRANCE_DELAY` ms *after* the event, so it settles behind the hero rather than alongside it |

The protocol is: the inline script sets `data-booting` on `<html>`, and dispatches a
`aic:boot-complete` event on `window` as the band clears the middle of the screen. Consumers read the
attribute once at module/effect setup and listen for the event.

Both halves fail open. `data-booting` absent means run immediately (the session-skip path), and the
inline script's **8-second safety timeout** dispatches `aic:boot-complete` even when the bundle it was
waiting on never arrives — so a failed deploy degrades to an un-animated page, never to a page
stranded at `opacity: 0` behind a splash that will not lift.

`src/splash.ts` is the React-side half: it reports the mount milestone, preloads the above-the-fold
images (deliberately *not* the About gallery), and calls `finish()`. It no-ops when
`window.__aicSplash` is undefined, which is how the session-skip path stays branch-free.

## Scroll reveals

`src/hooks/useReveal.ts` runs a single shared `IntersectionObserver` for every reveal target on the
site, replacing the per-component observers `StatsBar` and `MissionStatement` used to each own.
`StatsBar` now drives its count-up from the same `isRevealed` flag that fades the band in.

Reveals are held while the boot splash is up — see the `data-booting` contract above.

It has **two entry points and they are not interchangeable** — a wrapper breaks `divide-*` and
`col-span-*` layouts, while an in-place reveal silently overrides a hover transform. The rules, and
the specific files each applies to, are in [styling.md](styling.md#scroll-reveal-animations).

## Favicon

`index.html` (repo root) ships **no** `<link rel="icon">`. Instead `src/main.tsx` draws the club logo
onto a 128px canvas over a rounded background read from `--ui-surface-inverse`, then injects a
`data:` URL icon at runtime and redraws it whenever the theme changes. The tab is briefly iconless on
first paint.
