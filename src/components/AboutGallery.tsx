import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Every image in assets/about_gallery, discovered at build time. `assets/` is
 * not a static public folder — Vite hashes and emits each match like any other
 * import — so dropping a file into that folder is all it takes to add it here.
 *
 * The sort is load-bearing: glob key order is not guaranteed, so without it the
 * strip could reshuffle between builds. Filename order is also the control for
 * sequencing (`01-…`, `02-…`).
 */
const modules = import.meta.glob(
  '../../assets/about_gallery/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

const IMAGES = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src as string);

/** Idle drift, px/sec. */
const BASE_SPEED = 40;
/** Scroll px/sec -> extra drift px/sec. */
const SCROLL_GAIN = 0.55;
/** Ceiling on the scroll boost, px/sec. */
const MAX_BOOST = 900;
/** Per-frame approach rate for the boost, at 60fps. */
const BOOST_EASE = 0.08;
/**
 * The rAF loop is starved while the tab is backgrounded, so the first frame
 * back can report a delta of many seconds. NeuralNetworkCanvas hit this same
 * bug (see its `relativeTimeSpeed` cap) — uncapped, the strip teleports.
 */
const MAX_FRAME_DT = 1 / 20;

export const AboutGallery: React.FC = () => {
  const bandRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  // How many times the base list is repeated inside ONE group. Measured rather
  // than hardcoded: with a single source image a group would otherwise be
  // narrower than the viewport and the wrap seam would be visible.
  const [repeat, setRepeat] = useState(2);

  const wrapWidthRef = useRef(0);
  const latestScrollY = useRef(0);

  // Measure one group; that width is the distance the row travels before it can
  // wrap invisibly. Also decides whether we need more repetitions.
  useLayoutEffect(() => {
    if (IMAGES.length === 0) return;

    const measure = () => {
      const group = groupRef.current;
      const tilt = tiltRef.current;
      if (!group || !tilt) return;

      const groupWidth = group.getBoundingClientRect().width;
      if (groupWidth <= 0) return;

      wrapWidthRef.current = groupWidth;

      // One group must out-span the (over-wide) tilt wrapper, or the row runs
      // out of tiles before it reaches the wrap point.
      const needed = tilt.getBoundingClientRect().width;
      if (groupWidth < needed) {
        const perList = groupWidth / repeat;
        if (perList > 0) {
          setRepeat(Math.max(repeat, Math.ceil(needed / perList)));
        }
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (bandRef.current) observer.observe(bandRef.current);
    if (groupRef.current) observer.observe(groupRef.current);

    // Images shift the layout as they decode, so the first measurement can land
    // before the row has its real width.
    const imgs = Array.from(
      groupRef.current?.querySelectorAll('img') ?? []
    ) as HTMLImageElement[];
    const pending = imgs.filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener('load', measure, { once: true }));

    return () => {
      observer.disconnect();
      pending.forEach((img) => img.removeEventListener('load', measure));
    };
  }, [repeat]);

  useEffect(() => {
    if (IMAGES.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const row = rowRef.current;
    if (!row) return;

    latestScrollY.current = window.scrollY;

    /**
     * SmoothScrollProvider publishes an eased scroll position every frame, but
     * it bails out entirely under reduced motion and then never dispatches. So
     * take whichever source is live — the rule documented in docs/architecture.md.
     */
    const onScroll = (e?: Event) => {
      const detail = (e as CustomEvent | undefined)?.detail;
      latestScrollY.current =
        typeof detail?.scrollY === 'number' ? detail.scrollY : window.scrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('smoothscroll', onScroll, { passive: true });

    let rafId = 0;
    let lastTime = performance.now();
    let lastScrollY = latestScrollY.current;
    let offset = 0;
    let boost = 0;

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);

      const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_DT);
      lastTime = now;
      if (dt <= 0) return;

      // Velocity is derived here rather than in the scroll handler: `scroll` and
      // `smoothscroll` fire at different rates, and doing the diff per frame
      // keeps the maths the same whichever one is feeding us.
      const y = latestScrollY.current;
      const dy = Math.abs(y - lastScrollY);
      lastScrollY = y;

      // Absolute delta, so scrolling either way accelerates the same direction.
      const targetBoost = Math.min((dy / dt) * SCROLL_GAIN, MAX_BOOST);
      // Frame-rate-independent approach to the target.
      boost += (targetBoost - boost) * (1 - Math.pow(1 - BOOST_EASE, dt * 60));

      const wrap = wrapWidthRef.current;
      if (wrap > 0) {
        offset = (offset + (BASE_SPEED + boost) * dt) % wrap;
        row.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('smoothscroll', onScroll);
    };
  }, []);

  // Degrade to the plain text hero rather than rendering an empty band.
  if (IMAGES.length === 0) return null;

  const tiles = Array.from({ length: repeat }, () => IMAGES).flat();

  const renderGroup = (groupIdx: number) => (
    <div
      ref={groupIdx === 0 ? groupRef : undefined}
      className="flex shrink-0 gap-4 pr-4"
    >
      {/* Fixed portrait tiles, cropped by object-cover. The source photos are
          landscape, so sizing by height alone would yield wide landscape tiles
          — not the reference look, and it roughly doubles the row width (which
          matters: the row becomes one compositor layer). */}
      {tiles.map((src, i) => (
        <div
          key={`${groupIdx}-${i}`}
          className="h-[260px] w-[210px] md:h-[340px] md:w-[275px] shrink-0 rounded-xl overflow-hidden bg-bg-secondary"
        >
          <img
            src={src}
            alt=""
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );

  return (
    // Clips the tilt. The band is decorative, so it is hidden from assistive
    // tech entirely — the hero copy above and below carries the meaning.
    <div
      ref={bandRef}
      id="about-gallery-band"
      className="relative w-full overflow-hidden h-[300px] md:h-[390px] flex items-center"
      aria-hidden="true"
    >
      {/* Tilt lives on its own element: the row's transform is rewritten every
          frame and would clobber a rotation sharing that element. The extra
          width plus negative margin (not a translate, same reason) keep the
          rotated corners from exposing the page background. */}
      <div ref={tiltRef} className="w-[120%] -ml-[10%] rotate-[-2.5deg]">
        <div ref={rowRef} className="flex will-change-transform">
          {renderGroup(0)}
          {renderGroup(1)}
        </div>
      </div>
    </div>
  );
};
