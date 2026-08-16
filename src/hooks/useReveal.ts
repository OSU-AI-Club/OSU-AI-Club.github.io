import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Scroll-triggered reveal.
 *
 * One IntersectionObserver is shared by every reveal target on the page (~80 of
 * them); per-element observers would be wasteful. Targets unobserve themselves on
 * first intersection, which is what makes reveals once-only and keeps the
 * callback map from growing.
 *
 * This works inside `SmoothScrollProvider`'s transformed container because
 * IntersectionObserver maps an element's box through ancestor transforms into
 * viewport space — the same reason the existing StatsBar counter fires.
 */

/**
 * How far the viewport must be *through* an element before it reveals.
 * 0.5 = half the element has entered the screen. Lower it (0.25) for earlier
 * reveals, raise it (0.75) for later ones.
 */
const REVEAL_RATIO = 0.5;

const REVEAL_OPTIONS: IntersectionObserverInit = {
  // No negative margin: the ratio below is what decides when to commit.
  rootMargin: '0px',
  // The observer only calls back when a listed threshold is crossed, so include
  // low ones — an element taller than the viewport can never reach REVEAL_RATIO
  // and is resolved by the midpoint check in `hasPassedHalfway` instead.
  threshold: [0, 0.1, 0.25, REVEAL_RATIO],
};

/**
 * True once the viewport is halfway through the element.
 *
 * Two cases, because ratio alone doesn't cover both:
 *  - Element shorter than the viewport: it can reach REVEAL_RATIO visibility.
 *  - Element taller than the viewport: max ratio is viewportHeight/elementHeight,
 *    which may be under REVEAL_RATIO forever, so fall back to asking whether the
 *    element's top has crossed the vertical middle of the screen.
 */
function hasPassedHalfway(entry: IntersectionObserverEntry): boolean {
  if (entry.intersectionRatio >= REVEAL_RATIO) return true;
  const root = entry.rootBounds;
  if (!root) return false;
  return entry.boundingClientRect.top <= root.top + root.height * REVEAL_RATIO;
}

/** Elements start at opacity 0, so any failure to observe must fail *open*. */
const supportsObserver =
  typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const callbacks = new Map<Element, () => void>();

let observer: IntersectionObserver | null = null;

/**
 * Hold reveals while the boot splash is up.
 *
 * Everything above the fold is already intersecting when the app mounts, so
 * without this the hero's whole staggered sequence plays out behind an opaque
 * overlay and is finished by the time the splash lifts — the visitor's first
 * sight of the page is a static one. `data-booting` is set by the inline script
 * in index.html and cleared as the exit band clears the middle of the screen.
 *
 * Fails open in both directions: absent attribute means observe immediately,
 * and the splash's 8s safety net dispatches `aic:boot-complete` even when the
 * bundle it was waiting on never arrives, so nothing can strand at opacity 0.
 */
let bootHold =
  typeof document !== 'undefined' && document.documentElement.hasAttribute('data-booting');
const held = new Set<Element>();

if (bootHold) {
  window.addEventListener(
    'aic:boot-complete',
    () => {
      bootHold = false;
      const io = getObserver();
      held.forEach((node) => (io ? io.observe(node) : callbacks.get(node)?.()));
      held.clear();
    },
    { once: true },
  );
}

function getObserver(): IntersectionObserver | null {
  if (!supportsObserver) return null;
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !hasPassedHalfway(entry)) return;
        const fire = callbacks.get(entry.target);
        // Unobserve before firing: reveals are once-only, and dropping the entry
        // here keeps the shared map bounded as pages mount and unmount.
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
        fire?.();
      });
    }, REVEAL_OPTIONS);
  }
  return observer;
}

/**
 * Returns a ref to attach to the element that should reveal, plus whether it has
 * revealed yet. Consumers that only need the animation can ignore `isRevealed`
 * and let the `data-revealed` attribute drive CSS; consumers that need to kick
 * off their own work on entry (StatsBar's count-up) can read it.
 */
export function useReveal() {
  // Reduced motion and missing-API cases start revealed: no animation, no risk
  // of content stranded at opacity 0.
  const [isRevealed, setIsRevealed] = useState(
    () => !supportsObserver || prefersReducedMotion(),
  );

  const elementRef = useRef<Element | null>(null);
  const revealedRef = useRef(isRevealed);
  revealedRef.current = isRevealed;

  const cleanup = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    callbacks.delete(el);
    held.delete(el);
    getObserver()?.unobserve(el);
    elementRef.current = null;
  }, []);

  const ref = useCallback(
    (node: Element | null) => {
      if (elementRef.current && elementRef.current !== node) cleanup();
      if (!node || revealedRef.current) return;

      const io = getObserver();
      if (!io) {
        setIsRevealed(true);
        return;
      }

      elementRef.current = node;
      callbacks.set(node, () => setIsRevealed(true));
      // Queued rather than observed while the splash is up; the boot-complete
      // listener above hands the whole batch to the observer at once.
      if (bootHold) held.add(node);
      else io.observe(node);
    },
    [cleanup],
  );

  useEffect(() => cleanup, [cleanup]);

  return { ref, isRevealed };
}

/**
 * Props to spread onto an element that should reveal in place, for cases where
 * an extra wrapper would break layout — `divide-*` borders and `col-span-*`
 * both depend on the element staying a direct grid child. See `Reveal` for the
 * wrapper form used by plain card grids.
 */
export function useRevealProps(delay = 0) {
  const { ref, isRevealed } = useReveal();
  return {
    ref,
    'data-reveal': '',
    ...(isRevealed ? { 'data-revealed': '' } : {}),
    ...(delay ? { style: { transitionDelay: `${delay}ms` } } : {}),
  } as const;
}

/** Stagger helper: caps the delay so long grids don't trail badly. */
export function staggerDelay(index: number, step = 60, max = 8) {
  return Math.min(index, max) * step;
}

/**
 * Gap between consecutive children of a sequenced container, in ms. Mirrors
 * `--reveal-step` in index.css, which is what actually drives the CSS — this
 * copy exists so JS-timed animations inside a slot (the `TextScramble` glitch)
 * can be told to start when their slot arrives. Keep the two in sync.
 */
export const REVEAL_STEP = 130;

/** Delay of the nth slot of a sequenced container (0-indexed), in ms. */
export function sequenceDelay(slot: number) {
  return Math.min(slot, 7) * REVEAL_STEP;
}

/**
 * Props for a container whose DIRECT children should fade in one after another
 * rather than all at once — page heroes, mainly, where the eyebrow, heading,
 * body copy and buttons otherwise land simultaneously.
 *
 * The container itself does not animate; it only carries the observed ref and
 * the revealed flag. Ordering is positional (`nth-child` in index.css), so
 * reordering the JSX reorders the sequence, and every child must be an element
 * — a bare text node gets no slot.
 *
 * @param offset ms to hold the whole sequence back before its first slot.
 */
export function useRevealSequenceProps(offset = 0) {
  const { ref, isRevealed } = useReveal();
  return {
    ref,
    'data-reveal-sequence': '',
    ...(isRevealed ? { 'data-revealed': '' } : {}),
    ...(offset
      ? { style: { '--reveal-offset': `${offset}ms` } as React.CSSProperties }
      : {}),
  } as const;
}
