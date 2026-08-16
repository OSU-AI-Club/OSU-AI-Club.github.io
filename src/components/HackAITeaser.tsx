import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { useRevealProps } from '../hooks/useReveal';
import {
  HACKAI_NAME,
  HACKAI_DATE_FULL,
  HACKAI_LOCATION_FULL
} from '../data';

/**
 * Circuit-board brain for the teaser's visualizer panel, drawn in a 200x180
 * viewBox: a silhouette built from overlapping circular lobes, a straight
 * midline, and orthogonal PCB-style traces that each terminate on a node.
 *
 * The geometry is hand-authored because there is no vector art anywhere in this
 * repo to reuse — every asset is a raster PNG (including
 * `assets/sponsors/Cisco_logo_blue_2016.svg.png`, which is a PNG despite the
 * name) — and lucide's `Brain` is a cartoon glyph rather than the top-down
 * silhouette this card wants. A raster of the reference would not work either:
 * the dots below ride these paths, so an image would mean authoring the
 * geometry a second time anyway.
 *
 * Every stroke here is one uniform weight, set once on the group in the JSX
 * rather than per path — hence plain `d` strings rather than `{ w, d }` pairs.
 *
 * MIRRORING. Left paths are exact mirrors about x = 100, i.e. x -> 200 - x.
 * For the H/V/Q traces that is the whole story. For the `A` arcs of the
 * silhouette it is NOT: a reflection reverses orientation, so each arc's SWEEP
 * FLAG must also flip (0 <-> 1). Leave a sweep flag alone and that lobe bulges
 * inward — the left hemisphere comes out visibly concave. Radii and the
 * large-arc flag are unaffected.
 *
 * Bounds, measured off the curves rather than the endpoints — the arcs bulge
 * past their own endpoints, so reading the coordinates alone understates it:
 * x 29.1..170.9, y 15.6..156. The widest stroke is the 13-unit signal halo,
 * 6.5 units either side, so the worst case is x 22.6..177.4 and y 9.1..162.5 —
 * comfortably inside the viewBox.
 */
const BRAIN_LINES = {
  /* Silhouette, one hemisphere per path, as a chain of circular arcs — which is
     literally what the reference is, the boundary of a union of circles. Arcs
     rather than cubics also mean constant curvature per lobe, so the dot riding
     this path has no tangent surprises anywhere along it.

     The first and last arcs invert their sweep on purpose. Those two concave
     nips are what open the small notch where the hemispheres meet the midline
     at top and bottom, instead of the two halves running flush into it. */
  outlineR:
    'M 100 26 A 10 10 0 0 0 109 20 A 12 12 0 0 1 124 17 A 13 13 0 0 1 142 25 A 13 13 0 0 1 155 38 A 14 14 0 0 1 164 55 A 15 15 0 0 1 168 74 A 15 15 0 0 1 166 94 A 16 16 0 0 1 158 114 A 16 16 0 0 1 146 132 A 16 16 0 0 1 130 146 A 15 15 0 0 1 112 154 A 10 10 0 0 0 100 156',
  outlineL:
    'M 100 26 A 10 10 0 0 1 91 20 A 12 12 0 0 0 76 17 A 13 13 0 0 0 58 25 A 13 13 0 0 0 45 38 A 14 14 0 0 0 36 55 A 15 15 0 0 0 32 74 A 15 15 0 0 0 34 94 A 16 16 0 0 0 42 114 A 16 16 0 0 0 54 132 A 16 16 0 0 0 70 146 A 15 15 0 0 0 88 154 A 10 10 0 0 1 100 156',

  /* Midline. Straight, and spanning exactly the two outline endpoints so it
     closes both notches. */
  midline: 'M 100 26 L 100 156',

  /* Circuit traces, six per hemisphere: axis-aligned runs joined by 4-unit
     quadratic corners. The corners are `Q`, not `stroke-linejoin: round` — a
     linejoin rounds the stroke RENDERING but leaves an instantaneous tangent
     change in the path itself, which makes the traveling dot snap through the
     turn instead of arcing round it.

     Four of the six start on the midline; the other two float, and every free
     end has a node under it (see BRAIN_NODES). Columns and rows are staggered
     so no two traces run collinear or cross. */
  tR1: 'M 100 44 H 122 Q 126 44 126 48 V 64',
  tL1: 'M 100 44 H 78 Q 74 44 74 48 V 64',
  tR2: 'M 100 60 H 110 Q 114 60 114 64 V 78 Q 114 82 118 82 H 138',
  tL2: 'M 100 60 H 90 Q 86 60 86 64 V 78 Q 86 82 82 82 H 62',
  tR3: 'M 100 100 H 116 Q 120 100 120 104 V 118',
  tL3: 'M 100 100 H 84 Q 80 100 80 104 V 118',
  tR4: 'M 134 32 V 52 Q 134 56 138 56 H 154',
  tL4: 'M 66 32 V 52 Q 66 56 62 56 H 46',
  tR5: 'M 130 96 H 148 Q 152 96 152 92 V 74',
  tL5: 'M 70 96 H 52 Q 48 96 48 92 V 74',
  tR6: 'M 100 124 H 112 Q 116 124 116 128 V 142',
  tL6: 'M 100 124 H 88 Q 84 124 84 128 V 142',
} as const;

/* The two hollow ring "ports", straddling the silhouette at mid-height. Drawn
   unfilled so the outline reads through them, as in the reference. */
const BRAIN_PORTS = [
  [166, 80],
  [34, 80],
] as const;

type BrainLineId = keyof typeof BRAIN_LINES;

/**
 * One row per traveling dot. See `--animate-neural-signal` in index.css for how
 * a dot is actually rendered and moved.
 *
 * `dur` is proportional to the path's real length — every row works out to
 * ~18 user-units/sec. This is not decoration: `pathLength="1"` normalizes the
 * dash pattern but NOT the rendering, so equal durations would whip the dot
 * around the ~240-unit hemisphere six times faster than along a ~40-unit trace,
 * and the whole thing would read as random rather than as a circuit firing.
 * Lengths are arithmetic, not guesses: a trace is the sum of its axis-aligned
 * runs plus ~6.2 per rounded corner, and a hemisphere is the sum of r*theta
 * over its twelve arcs. Re-derive both if the geometry above ever moves.
 *
 * `delay` is negative so every dot is already mid-flight on first paint, with
 * mutually awkward values so the set never visibly resynchronizes.
 *
 * `park` is where the dot rests under `prefers-reduced-motion: reduce`, when
 * `motion-safe:` withholds the animation entirely. It is applied as an inline
 * stroke-dashoffset; CSS animations outrank normal author declarations in the
 * cascade — including the style attribute — so the running animation overrides
 * it and only the reduced-motion path ever sees it. The values are spread along
 * each path so that state reads as a scattered constellation of neural nodes
 * rather than every dot piling up on the midline.
 *
 * Every dot is purple, which is what makes the animation legible at a glance:
 * the wiring is blue and the resting nodes are green, so a third hue is the
 * only thing a moving dot can be without briefly camouflaging itself each time
 * it crosses one of them. There is therefore no per-row tone — don't reintroduce
 * one without also re-checking that read.
 *
 * The two hemisphere sweeps are the slow, calm layer; the traces are the fast
 * circuit layer on top of it, drawn from both sides so neither hemisphere ever
 * goes quiet.
 */
const BRAIN_SIGNALS: ReadonlyArray<{
  on: BrainLineId;
  dur: number;
  delay: number;
  park: number;
  halo?: boolean;
}> = [
  { on: 'outlineR', dur: 13.4, delay: -1.7, park: 0.12, halo: true },
  { on: 'outlineL', dur: 13.4, delay: -8.3, park: 0.63, halo: true },
  { on: 'tR2', dur: 3.1, delay: -0.9, park: 0.34, halo: true },
  { on: 'tL2', dur: 3.1, delay: -2.3, park: 0.81 },
  { on: 'tR1', dur: 2.5, delay: -1.1, park: 0.47 },
  { on: 'tL4', dur: 2.3, delay: -0.4, park: 0.19 },
  { on: 'tR5', dur: 2.3, delay: -1.9, park: 0.72 },
  { on: 'tL3', dur: 2.0, delay: -0.7, park: 0.28 },
  { on: 'tR6', dur: 1.8, delay: -1.3, park: 0.55 },
];

/* Nodes: one on EVERY free trace end, plus the four points where a trace meets
   the midline. That completeness is the point rather than decoration — a dot
   reaching the end of its trace vanishes and restarts at the other end, and
   landing that moment on a node makes it read as "this node fired" instead of
   as a glitch. Keep this list in sync with the trace endpoints in BRAIN_LINES;
   a trace whose end has no node under it looks unfinished.

   Static by design: `animate-ping` on an SVG child scales about the *viewBox*
   centre rather than the element's own unless `transform-box: fill-box` is also
   set — the concentric hexagons this replaced only got away with it because
   they happened to be centred on their viewBox — and the reference shows solid
   dots anyway. Not worth a second per-frame repaint. */
const BRAIN_NODES = [
  /* midline junctions */
  [100, 44],
  [100, 60],
  [100, 100],
  [100, 124],
  /* right hemisphere free ends */
  [126, 64],
  [138, 82],
  [120, 118],
  [134, 32],
  [154, 56],
  [130, 96],
  [152, 74],
  [116, 142],
  /* left hemisphere free ends, mirrored */
  [74, 64],
  [62, 82],
  [80, 118],
  [66, 32],
  [46, 56],
  [70, 96],
  [48, 74],
  [84, 142],
] as const;

interface HackAITeaserProps {
  onNavigate: (page: string) => void;
}

export const HackAITeaser: React.FC<HackAITeaserProps> = ({ onNavigate }) => {
  const headingReveal = useRevealProps();

  return (
    <section
      id="hackai-teaser-section"
      className="py-24 bg-veil-band relative border-b border-border-subtle"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-start w-full">
        
        {/* Section Heading */}
        <div id="hackai-promo-headers" className="mb-10 text-left" {...headingReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
            Flagship Event
          </span>
          <h2 className="font-display text-[32px] md:text-[48px] font-extrabold text-text-primary tracking-tight">
            Ohio State's Premier AI Hackathon
          </h2>
        </div>

        {/* Major Promo Event Card. Wrapped rather than revealed in place: the
            card has a `transform hover:scale`, which an in-place reveal would clobber. */}
        <Reveal delay={120} className="w-full">
        <div
          id="hackai-card-wrapper"
          className="w-full relative min-h-[460px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row bg-[linear-gradient(135deg,var(--ui-surface-inverse)_0%,var(--ui-surface-inverse-deep)_100%)] border border-border-inverse transform hover:scale-[1.005] transition-all duration-300"
        >
          {/* Decorative glowing backdrops */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(circle_at_70%_20%,var(--ui-accent-glow)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[70%] bg-[radial-gradient(circle_at_20%_80%,var(--ui-accent-secondary-dim)_0%,transparent_50%)] pointer-events-none" />

          {/* Left Block (60%) */}
          <div className="flex-1 p-8 md:p-14 flex flex-col justify-between items-start z-10 relative">
            <div className="w-full">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-secondary/15 text-accent-secondary mb-5 border border-accent-secondary/20">
                Registration Now Open
              </span>
              
              {/* `text-text-on-inverse`, not `text-on-inverse`. The token is
                  registered as `--color-text-on-inverse`, so the utility carries
                  the `text-` prefix twice — once for the property, once as part
                  of the token name. The shorter spelling matches no token, emits
                  no rule, and silently leaves these inheriting `text-primary`,
                  which flips with the theme and goes near-black on this
                  permanently dark card. */}
              <h3 className="font-display text-[44px] md:text-[68px] font-extrabold text-text-on-inverse leading-none tracking-tighter mb-4">
                {HACKAI_NAME}
              </h3>

              <p className="font-sans text-[15px] md:text-[17px] text-text-on-inverse-muted leading-relaxed max-w-lg mb-8">
                36 Hours. 100+ Builders. $5,000+ in prizes. Combine prompt compilers, image diffusion, reinforcement learning, and LLM fine-tunes to build systems that reshape computing.
              </p>
            </div>

            {/* Date/Location Details row and CTA button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 w-full mt-auto">
              <button
                id="teaser-hack-cta-btn"
                onClick={() => {
                  onNavigate('hackai');
                }}
                className="px-8 py-3.5 bg-accent-primary hover:bg-accent-primary-hover text-on-accent text-[14px] font-bold rounded-full shadow-[0_4px_20px_var(--ui-accent-glow)] hover:shadow-[0_6px_28px_var(--ui-accent-glow)] transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2 w-fit cursor-pointer"
              >
                <span>Explore & Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-5 text-[13px] md:text-[14px] text-text-on-inverse/70 font-mono">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-accent-secondary" />
                  <span>{HACKAI_DATE_FULL}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-accent-secondary" />
                  <span>{HACKAI_LOCATION_FULL}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visualizer Block (40%) */}
          <div className="md:w-[38%] h-[200px] md:h-full relative flex items-center justify-center border-t md:border-t-0 md:border-l border-border-inverse overflow-hidden bg-overlay/30 z-10 self-stretch">
            {/* Circuit-board brain with dots traveling its traces as neural
                signals. Geometry is in BRAIN_LINES above; how a dot is rendered
                and moved is in `--animate-neural-signal` in index.css.

                Sized by percentage in both axes rather than the old fixed
                `w-64 h-64`: 256px overflowed the 200px mobile strip, and any
                fixed md height overflows *horizontally* at the md breakpoint
                itself, where this panel is only ~243px wide. The replaced
                element min/max algorithm clamps whichever axis binds first.

                `will-change-transform` is not cargo cult here. The card's two
                decorative radial-gradient divs sit directly behind this panel,
                and animating SVG geometry is a repaint; without promotion every
                frame would dirty a rect overlapping those gradients and
                re-raster gradient pixels along with the dots. */}
            <svg
              aria-hidden="true"
              className="w-[78%] max-w-[300px] h-auto max-h-[82%] relative z-10 will-change-transform"
              viewBox="0 0 200 180"
              fill="none"
            >
              {/* Base wiring. The dimming lives on this group, deliberately not
                  on the svg root the way the concentric hexagons did it — the
                  signal dots below have to stay at full strength, since "dim
                  wiring, bright signal" is the entire read. */}
              <g
                className="text-accent-primary-on-inverse opacity-25"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {Object.entries(BRAIN_LINES).map(([id, d]) => (
                  <path key={id} d={d} />
                ))}
              </g>

              {/* Nodes. Green against the blue wiring is standing in for the
                  reference's coral-on-navy — there is no warm token on an
                  inverse surface — so they sit near full opacity; at the old
                  50% the contrast that makes them the drawing's signature
                  simply isn't there. */}
              <g className="text-accent-secondary-on-inverse opacity-90" fill="currentColor">
                {BRAIN_NODES.map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.0} />
                ))}
              </g>

              {/* Traveling signals: a second copy of a base path carrying one
                  round dot. `pathLength={1}` plus a dasharray summing to 1
                  guarantees exactly one dot, and the round cap on a
                  zero-length dash makes that dot a true circle whose diameter
                  is strokeWidth — so it is the same size on the 248-unit
                  hemisphere as on a 32-unit trace.

                  The halo uses strokeOpacity rather than an `opacity-*` class:
                  the keyframe animates `opacity`, which would override the
                  class outright, whereas stroke-opacity and opacity multiply
                  and it lands at the intended 0.18. */}
              {BRAIN_SIGNALS.map((sig, i) => {
                const style: React.CSSProperties = {
                  animationDuration: `${sig.dur}s`,
                  animationDelay: `${sig.delay}s`,
                  strokeDashoffset: sig.park,
                };
                const shared = {
                  d: BRAIN_LINES[sig.on],
                  pathLength: 1,
                  stroke: 'currentColor',
                  strokeLinecap: 'round' as const,
                  strokeDasharray: '0 1',
                  className:
                    'text-accent-tertiary-on-inverse motion-safe:animate-neural-signal',
                  style,
                };
                return (
                  <React.Fragment key={`${sig.on}-${i}`}>
                    {sig.halo && <path {...shared} strokeWidth={13} strokeOpacity={0.18} />}
                    <path {...shared} strokeWidth={4.8} />
                  </React.Fragment>
                );
              })}
            </svg>
          </div>

        </div>
        </Reveal>

      </div>
    </section>
  );
};
