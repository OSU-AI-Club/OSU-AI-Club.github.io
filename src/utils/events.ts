import type { ClubEvent } from '../types';
import { EVENT_CATEGORIES, type CategoryAccent, type EventCategory } from '../data/events';
import { type ISODate, type YearMonth, monthKey, parseISODate } from './date';

/**
 * ClubEvent-aware derivations — the domain layer over utils/date.
 *
 * Everything the Events page and the calendar need to know *about events* lives
 * here, so the calendar dots, the card accent bar and the rail bullets can't
 * drift apart.
 */

/**
 * Whether an event is chronologically over.
 *
 * `isPast` on the event wins when present, so an editor can pin an event on
 * either side of the line; otherwise it's derived, which self-heals as time
 * passes instead of going stale the way a hand-maintained flag does.
 *
 * `today` is passed in rather than read here so a whole render agrees on "now"
 * — see the single `todayISO()` call in Events.tsx.
 */
export function isEventPast(event: ClubEvent, today: ISODate): boolean {
  if (typeof event.isPast === 'boolean') return event.isPast;
  return event.date < today;
}

/**
 * Chronological comparator.
 *
 * ISO dates are fixed-width and zero-padded, so lexicographic order is
 * chronological order — no Date allocation, no timezone involved.
 */
export function byDateAsc(a: ClubEvent, b: ClubEvent): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.id.localeCompare(b.id); // stable tiebreak for same-day events
}

/** Most recent first. Used for the recap strip if that ordering is ever wanted. */
export function byDateDesc(a: ClubEvent, b: ClubEvent): number {
  return -byDateAsc(a, b);
}

/**
 * Index events by their date so a calendar cell is an O(1) lookup rather than a
 * scan of the whole array per cell (42 cells x N events every render).
 */
export function indexEventsByDate(events: ClubEvent[]): Map<ISODate, ClubEvent[]> {
  const index = new Map<ISODate, ClubEvent[]>();
  for (const event of events) {
    const existing = index.get(event.date);
    if (existing) existing.push(event);
    else index.set(event.date, [event]);
  }
  for (const list of index.values()) list.sort(byDateAsc);
  return index;
}

/**
 * The months containing at least one event, ascending and de-duplicated.
 *
 * Drives BOTH the month-navigation clamp and the jump pills, which is why
 * callers must pass the *unfiltered* event list: a filter-dependent clamp would
 * strand the user outside the navigable range when they change filters, and
 * pills appearing and vanishing on a filter toggle is disorienting.
 *
 * Empty in, empty out — the calendar reads that as "no clamp, navigate freely".
 */
export function monthsWithEvents(events: ClubEvent[]): YearMonth[] {
  const seen = new Set<number>();
  const months: YearMonth[] = [];
  for (const event of events) {
    const { year, month } = parseISODate(event.date);
    const key = monthKey(year, month);
    if (seen.has(key)) continue;
    seen.add(key);
    months.push({ year, month });
  }
  return months.sort((a, b) => monthKey(a.year, a.month) - monthKey(b.year, b.month));
}

/** The soonest event on or after `today`, or undefined if they're all past. */
export function nextUpcomingEvent(events: ClubEvent[], today: ISODate): ClubEvent | undefined {
  let soonest: ClubEvent | undefined;
  for (const event of events) {
    if (event.date < today) continue;
    if (!soonest || byDateAsc(event, soonest) < 0) soonest = event;
  }
  return soonest;
}

const ACCENT_BY_CATEGORY = new Map<string, CategoryAccent>(
  EVENT_CATEGORIES.map((c) => [c.id, c.accent]),
);

const LABEL_BY_CATEGORY = new Map<string, string>(
  EVENT_CATEGORIES.map((c) => [c.id, c.label]),
);

/**
 * Background class for a category's accent on a LARGE surface — currently the
 * bar across the top of an event card.
 *
 * The `gradient` accent renders as an actual gradient here because the card bar
 * is `h-1.5 w-full`: hundreds of pixels wide, so both stops get real estate.
 * For anything small and round use `categoryDotClass` instead.
 */
export function categoryAccentClass(category: EventCategory): string {
  switch (ACCENT_BY_CATEGORY.get(category)) {
    case 'primary': return 'bg-accent-primary';
    case 'secondary': return 'bg-accent-secondary';
    case 'tertiary': return 'bg-accent-tertiary';
    case 'warm': return 'bg-status-warning';
    case 'gradient': return 'bg-gradient-to-r from-accent-primary to-accent-secondary';
    default: return 'bg-text-muted';
  }
}

/**
 * Background class for a category's accent on a SMALL round mark — calendar
 * cell dots, rail bullets, legend swatches.
 *
 * Why this isn't just `categoryAccentClass`: a two-stop blue-to-green gradient
 * has nowhere to resolve on a 6px circle. Soft stops blend to a single teal and
 * hard stops still antialias to one — either way HackAI ends up a near-match for
 * the Speaker green, which is exactly the confusion a legend exists to prevent.
 * A solid core with a contrasting ring stays unambiguous at any size and still
 * reads as "both brand colors".
 */
export function categoryDotClass(category: EventCategory): string {
  switch (ACCENT_BY_CATEGORY.get(category)) {
    case 'primary': return 'bg-accent-primary';
    case 'secondary': return 'bg-accent-secondary';
    case 'tertiary': return 'bg-accent-tertiary';
    case 'warm': return 'bg-status-warning';
    case 'gradient': return 'bg-accent-primary ring-[1.5px] ring-accent-secondary';
    default: return 'bg-text-muted';
  }
}

/** Plural display label for a category ('Workshop' -> 'Workshops'). */
export function categoryLabel(category: string): string {
  return LABEL_BY_CATEGORY.get(category) ?? category;
}

/** The sentinel the filter pills use for "no category filter". */
export const ALL_FILTER = 'All';

/** True when an event passes the active category filter. */
export function matchesFilter(event: ClubEvent, activeFilter: string): boolean {
  return activeFilter === ALL_FILTER || event.category === activeFilter;
}
