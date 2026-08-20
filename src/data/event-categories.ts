/**
 * The one category list, plus the Google Calendar color map that feeds it.
 *
 * WHY THIS IS ITS OWN FILE
 * ------------------------
 * This used to live in data/events.ts. It was split out because
 * scripts/sync-calendar.ts needs the category list and the color map, while
 * data/events.ts now imports events.generated.json — the file the sync script
 * writes. Importing data/events.ts from the script would mean the generator
 * crashes when its own output is missing or malformed, which is exactly when
 * you need it to run. This module imports nothing, so both sides can use it.
 *
 * data/events.ts re-exports everything here, so `import { EVENT_CATEGORIES }
 * from '../data/events'` still works and no component had to change.
 */

/**
 * Drives the filter pills on the Events page, the calendar legend, the color of
 * every event dot and card accent bar, and which Google Calendar colors map to
 * which category. Add a category by adding a row here — nothing else to touch.
 *
 * `accent` is a design-token name, not a Tailwind class, so raw styling stays
 * out of the content layer. `categoryAccentClass()`, `categoryDotClass()` and
 * `categoryBadgeClass()` in src/utils/events.ts map it to actual utilities.
 * Valid values:
 *
 *   'primary'   blue      'secondary' green     'tertiary' purple
 *   'warm'      amber     'gradient'  blue/green split (HackAI's two-brand mark)
 *
 * Give each category its own accent. Two categories sharing one defeats the
 * legend, and grey is reserved — the calendar's "+N more" dot already uses it.
 * A sixth category needs a new token in index.css and a case in all three mappers.
 *
 * `googleColorIds` is how an officer picks the category: they set the event's
 * color in Google Calendar and the sync script reads it back. The FIRST id in
 * each list is the canonical one taught in docs/calendar-sync.md; the rest are
 * forgiving aliases so a near-miss still lands in the right bucket. Every id
 * must appear at most once across the whole table — COLOR_ID_TO_CATEGORY below
 * would otherwise silently resolve by declaration order.
 *
 * Google's palette is a fixed set of 11 (see docs/calendar-sync.md for the
 * names as they appear in the Calendar UI). Ids not listed here, and events
 * with no color at all, fall back to DEFAULT_CATEGORY.
 */
export const EVENT_CATEGORIES = [
  // General sits first because it's the baseline event type — the weekly
  // meeting most visitors are looking for. Reorder freely; the filter pills,
  // legend and calendar all follow this array's order.
  { id: 'General',  label: 'General Meetings', accent: 'warm',      googleColorIds: ['5', '6', '8'] },
  { id: 'Workshop', label: 'Workshops',        accent: 'primary',   googleColorIds: ['7', '9'] },
  { id: 'Speaker',  label: 'Speakers',         accent: 'secondary', googleColorIds: ['10', '2'] },
  { id: 'HackAI',   label: 'HackAI',           accent: 'gradient',  googleColorIds: ['11', '4'] },
  { id: 'Social',   label: 'Socials',          accent: 'tertiary',  googleColorIds: ['3', '1'] },
] as const;

/** Union of the category ids above. `ClubEvent.category` is typed as this. */
export type EventCategory = (typeof EVENT_CATEGORIES)[number]['id'];

/** Accent token names used above, for the class maps in utils/events.ts. */
export type CategoryAccent = (typeof EVENT_CATEGORIES)[number]['accent'];

/**
 * Where uncategorizable events land.
 *
 * Two paths reach it: an event whose color is Google's calendar default (the
 * API omits `colorId` entirely in that case, which is the common case for an
 * officer who just typed a title and hit save), and an event whose color isn't
 * in the table above. Mislabelled beats missing — never drop an event for this.
 */
export const DEFAULT_CATEGORY: EventCategory = 'General';

/** Flattened from EVENT_CATEGORIES so the table above stays the single source. */
const COLOR_ID_TO_CATEGORY = new Map<string, EventCategory>(
  EVENT_CATEGORIES.flatMap((category) =>
    category.googleColorIds.map((colorId) => [colorId, category.id] as [string, EventCategory]),
  ),
);

/**
 * Google Calendar `colorId` -> category.
 *
 * Build-time only in practice, but it lives beside the table it reads so the
 * color, the label and the accent stay one row per category.
 */
export function categoryFromGoogleColorId(colorId?: string | null): EventCategory {
  if (!colorId) return DEFAULT_CATEGORY;
  return COLOR_ID_TO_CATEGORY.get(String(colorId).trim()) ?? DEFAULT_CATEGORY;
}

/**
 * Runtime guard for untrusted input.
 *
 * Needed in two places that can't trust each other: the sync script validating
 * a `Category:` directive an officer typed by hand, and data/events.ts
 * validating the generated snapshot, which can be stale, hand-edited, or from
 * an older schema version.
 */
export function isEventCategory(value: unknown): value is EventCategory {
  return EVENT_CATEGORIES.some((category) => category.id === value);
}
