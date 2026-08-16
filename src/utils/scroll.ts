import type { ClubEvent } from '../types';
import type { ISODate } from './date';
import { isEventPast } from './events';

/**
 * Scrolling that works with SmoothScrollProvider.
 *
 * The provider replaces native scrolling: everything renders inside
 * `#smooth-scroll-viewport` (`fixed inset-0 overflow-hidden`) wrapping
 * `#smooth-scroll-content`, which it moves with `translate3d(0, -currentY, 0)`
 * on a rAF lerp. `document.body.height` is mirrored to the content height, so
 * `window.scrollY` remains the real source of truth and the transform merely
 * chases it.
 *
 * Two things follow, and this module exists because of them:
 *
 *  - `element.scrollIntoView()` MUST NOT be used. The nearest scroll container
 *    is the fixed, overflow-hidden viewport — still a scrollable box as far as
 *    the browser is concerned, so it writes `scrollTop` there. `window.scrollY`
 *    never changes, the lerp keeps applying the old transform, and the page is
 *    left permanently offset by that scrollTop.
 *  - `element.focus()` MUST pass `{ preventScroll: true }` for the same reason:
 *    native focus performs an implicit scroll-into-view and hits the same trap.
 *
 * The provider exposes no scroll API of its own (`smoothscroll-snap` forces an
 * instant jump, which is the opposite of what a "jump to this card" affordance
 * wants), so the correct move is to compute the document offset by hand and let
 * the lerp ease to it.
 */

/** The fixed navbar is 72px — every page root clears it with `pt-[72px]` — plus air. */
const NAV_OFFSET = 96;

/**
 * Scroll the page so the element with this id sits below the navbar.
 *
 * No-ops when the id isn't in the document, which is the normal case for an
 * event whose card is filtered out of view.
 */
export function scrollToElementId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;

  // Past events live in a horizontally-scrolling track, so scrolling the page
  // vertically alone can land on the strip with the target card off-screen to
  // the right. That track is an ordinary scroll container — unaffected by the
  // provider — so assigning scrollLeft directly is correct here.
  const track = el.closest<HTMLElement>('#past-events-strip-track');
  if (track) track.scrollLeft = el.offsetLeft - track.offsetLeft;

  const content = document.getElementById('smooth-scroll-content');
  const top = content
    // Both rects are measured inside the same translated subtree, so the
    // provider's transform cancels exactly and we never need to know currentY.
    // Using getBoundingClientRect rather than offsetTop also sidesteps the
    // transformed/positioned ancestors between here and the page root.
    ? el.getBoundingClientRect().top - content.getBoundingClientRect().top
    // Under `prefers-reduced-motion` the provider renders bare children, so
    // there is no wrapper and window.scrollY is the plain page offset.
    : el.getBoundingClientRect().top + window.scrollY;

  // Always 'auto', never 'smooth'. The provider sets scrollBehavior='auto' so
  // its lerp owns the easing; asking the browser to ramp window.scrollY too
  // would have the lerp chasing a moving target — roughly two seconds of mushy
  // double easing.
  window.scrollTo({ top: Math.max(0, top - NAV_OFFSET), behavior: 'auto' });
}

/**
 * Scroll to an event's card, whichever of the two lists it renders in.
 *
 * NOTE: 'stip' below is a pre-existing typo in the past-card id
 * (`Events.tsx`). It's matched verbatim on purpose — docs/styling.md asks that
 * stable ids not be renamed casually.
 */
export function scrollToEventCard(event: ClubEvent, today: ISODate): void {
  scrollToElementId(
    isEventPast(event, today)
      ? `past-event-stip-card-${event.id}`
      : `event-card-item-${event.id}`,
  );
}
