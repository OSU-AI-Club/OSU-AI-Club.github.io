import React from 'react';

/**
 * The site-wide ambient background: one fixed, full-viewport mesh gradient that
 * every page floats over. Page roots and section bands are transparent or
 * translucent so this reads through them.
 *
 * It must be rendered OUTSIDE `SmoothScrollProvider`. That component transforms
 * `#smooth-scroll-content` every rAF, and a transformed ancestor makes
 * descendant `position: fixed` resolve against the transformed box instead of
 * the viewport — the mesh would scroll away with the content. Mounting it as a
 * sibling of the provider in App.tsx is what keeps it locked to the viewport.
 *
 * `-z-10` is safe here: nothing in the chain above (`body`, `#root`,
 * `#application-container-viewport`) creates a stacking context, so this
 * resolves against the root one and paints above body's background but below
 * all in-flow content.
 */
export const BackgroundMesh: React.FC = () => (
  <div
    id="page-background-mesh"
    aria-hidden="true"
    className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-bg-primary bg-[image:var(--ui-page-mesh)]"
  >
    {/* Two slow-drifting lobes so the background is never quite the same twice.
        They reuse the existing `-dim` tokens rather than introducing a third
        alpha system to keep in sync across themes.

        `hidden md:block`: two extra full-viewport composited layers cost real
        GPU fill rate on low-end phones, and the drift is barely legible at that
        width. `motion-safe:` means nothing is ever set in motion under
        `prefers-reduced-motion: reduce` — matching the reveal system's approach
        of never starting something that then needs JS to rescue it. */}
    <div
      className="hidden md:block absolute -top-[25%] -left-[20%] w-[80vw] h-[80vh] will-change-transform
                 bg-[radial-gradient(closest-side,var(--ui-accent-primary-dim),rgba(0,0,0,0))]
                 motion-safe:animate-mesh-drift-a"
    />
    <div
      className="hidden md:block absolute -bottom-[25%] -right-[20%] w-[75vw] h-[75vh] will-change-transform
                 bg-[radial-gradient(closest-side,var(--ui-accent-tertiary-dim),rgba(0,0,0,0))]
                 motion-safe:animate-mesh-drift-b"
    />
  </div>
);
