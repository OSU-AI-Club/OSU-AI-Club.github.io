import React from 'react';
import { SPONSORS } from '../data';

// Editing the roster is a one-line change in src/data/sponsors.ts — there are
// deliberately no logo imports in this file. Everything below derives from
// SPONSORS, so the marquee stays seamless and scrolls at one steady speed
// whether the club has three sponsors or thirty.

/** One tile's footprint: `w-48` (192px) plus the `space-x-8` gap (32px). */
const TILE_PITCH_PX = 192 + 32;

/**
 * How fast logos travel, in px/sec — the one number to turn if the band feels
 * rushed or sleepy. Duration is derived from it below rather than fixed,
 * because a fixed duration means "cross the whole row in 25s": adding sponsors
 * would silently speed the band up.
 */
const MARQUEE_SPEED_PX_PER_SEC = 80;

/**
 * Minimum tiles per half. The `marquee` keyframe (index.css) translates -50%,
 * so the row must be exactly TWO identical halves or it jumps at the loop
 * point — and each half must be wider than the viewport or a gap scrolls
 * through. 8 tiles is ~1792px, past the widest the ticker ever gets (max-w-7xl
 * minus the label). Short rosters repeat to reach it; long ones already exceed
 * it and repeat once.
 */
const MIN_TILES_PER_HALF = 8;

export const SponsorsBar: React.FC = () => {
  // An empty roster renders nothing rather than an empty band — a bare veiled
  // strip between Mission and the HackAI teaser reads as a broken section.
  if (SPONSORS.length === 0) return null;

  const repeats = Math.ceil(MIN_TILES_PER_HALF / SPONSORS.length);
  const half = Array.from({ length: repeats }, () => SPONSORS).flat();
  const marqueeRow = [...half, ...half];

  // Inline, so it overrides the 25s in `.animate-marquee`: a style-attribute
  // declaration outranks a normal author rule.
  const marqueeStyle: React.CSSProperties = {
    animationDuration: `${(half.length * TILE_PITCH_PX) / MARQUEE_SPEED_PX_PER_SEC}s`,
  };

  return (
    <div
      id="sponsors-scrolling-band"
      className="h-[120px] bg-veil-band-strong border-y border-border-subtle relative flex items-center overflow-hidden z-10"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">
        
        {/* Left fixed label. No background of its own: it is a flex sibling of the
            ticker, not an overlay — the marquee is already clipped by the ticker's
            own overflow-hidden and edge mask — so a fill here would only double
            the band's veil and stamp a visible rectangle on it. */}
        <div className="flex items-center space-x-6 h-full flex-shrink-0 z-20 pr-6 md:pr-10 border-r border-border-subtle">
          <span className="font-sans text-[11px] md:text-[12px] font-bold text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">
            Presenting Partners
          </span>
        </div>

        {/* Right scrolling ticker wrapper */}
        <div
          id="sponsors-ticker-viewport"
          className="flex-1 overflow-hidden relative"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
          }}
        >
          <div
            id="sponsors-infinite-row"
            className="flex items-center space-x-8 animate-marquee cursor-pointer py-1"
            style={marqueeStyle}
          >
            {marqueeRow.map((sponsor, idx) => (
              // The plate stays white in BOTH themes on purpose: sponsor logos are
              // dark-on-transparent PNGs and would disappear on a charcoal tile.
              // Only the border follows the theme.
              <div
                key={`${sponsor.id}-${idx}`}
                id={`sponsor-logo-box-${idx}`}
                className="w-48 h-[60px] px-5 bg-white border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_var(--ui-shadow-color)] hover:border-accent-primary/30 hover:scale-[1.04] hover:shadow-[0_4px_12px_var(--ui-shadow-color)] transition-all duration-300"
              >
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    className="max-w-full max-h-[38px] object-contain filter brightness-95 hover:brightness-100 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  // No assets/sponsors/<id> file yet. A name wordmark on the same
                  // white plate is a deliberate, styled state — not a broken image
                  // icon — so a roster entry can land before its logo does.
                  <span className="font-sans text-[13px] font-bold text-neutral-700 text-center leading-tight">
                    {sponsor.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
