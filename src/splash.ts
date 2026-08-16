/**
 * React-side driver for the boot splash defined in index.html.
 *
 * The splash itself is static markup and an inline script, because a component
 * cannot render until the bundle it lives in has already downloaded — which is
 * precisely the wait it exists to cover. This module is the other half: once the
 * bundle *has* executed, it reports real progress and decides when to dismiss.
 *
 * `window.__aicSplash` is left undefined when the splash was skipped (already
 * seen this session), so every export here degrades to a no-op and no caller
 * needs to check.
 */

import aiLogo from '../assets/images/AI_Logo_Final.png';
import lab99Logo from '../assets/sponsors/99PLabs_Logo_Final.png';
import ciscoLogo from '../assets/sponsors/Cisco_logo_blue_2016.svg.png';
import janeStreetLogo from '../assets/sponsors/Jane_Street_Logo.png';

interface SplashApi {
  setProgress: (n: number) => void;
  finish: () => void;
}

declare global {
  interface Window {
    __aicSplash?: SplashApi;
  }
}

/**
 * Above-the-fold images only — roughly 210 kB.
 *
 * `assets/about_gallery/*` is deliberately absent even now that it is WebP and
 * down to ~308 kB: it belongs to the About page, nobody looking at the hero is
 * waiting on it, and holding the splash open for off-screen assets is the one
 * way a loading screen can make a slow connection feel worse rather than better.
 */
const CRITICAL_IMAGES = [aiLogo, lab99Logo, ciscoLogo, janeStreetLogo];

/** Progress is handed over from the inline script's creep at this point. */
const MOUNT_PROGRESS = 70;
/** Reserve the last point so the jump to 100 always coincides with dismissal. */
const PRELOAD_CEILING = 99;

/** Resolves whether the image loads or errors — a broken asset must not hang. */
function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
    if (img.complete) resolve();
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<unknown> {
  return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
}

/**
 * Call once, as early in the bundle as possible. Reports the mount milestone,
 * then tracks the critical images to completion and dismisses the splash.
 */
export function startSplashHandoff() {
  const splash = typeof window !== 'undefined' ? window.__aicSplash : undefined;
  if (!splash) return;

  splash.setProgress(MOUNT_PROGRESS);

  const span = PRELOAD_CEILING - MOUNT_PROGRESS;
  let loaded = 0;

  const images = CRITICAL_IMAGES.map((src) =>
    loadImage(src).then(() => {
      loaded += 1;
      splash.setProgress(MOUNT_PROGRESS + (span * loaded) / CRITICAL_IMAGES.length);
    }),
  );

  // Same wait NeuralNetworkCanvas uses before it re-measures its safe band: the
  // hero text reflows when Roboto swaps in, and that reflow should happen under
  // the splash rather than a beat after it lifts.
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();

  // The 5s cap is a second line of defence in front of the inline script's 8s
  // safety net — it dismisses cleanly instead of waiting to be timed out.
  withTimeout(Promise.all([...images, fonts]), 5000).then(() => splash.finish());
}
