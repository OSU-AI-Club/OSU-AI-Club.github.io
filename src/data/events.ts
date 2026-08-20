/**
 * Club events — synced from Google Calendar, not hand-written.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ ADDING AN EVENT? Don't edit this file. Add it to "AIC Public Calendar"    │
 * │ and set the event's COLOR to pick its category. NOT the club account's    │
 * │ own calendar — that one is private. See docs/calendar-sync.md.           │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * HOW THE DATA GETS HERE
 * ----------------------
 * scripts/sync-calendar.ts runs during the GitHub Actions build, fetches the
 * calendar, and writes events.generated.json next to this file. Vite inlines
 * that JSON into the bundle, so the visitor's browser never talks to Google —
 * no API key ships to the client and there is no loading state to design.
 *
 * The committed copy of events.generated.json is EMPTY on purpose — every event
 * on the site comes from the calendar, and nothing is hardcoded as a stand-in.
 * A clone without an API key therefore builds a site with an empty Events page
 * rather than fake ones. CI overwrites the file before every build and never
 * commits it back, so whatever is in git does not affect what is deployed.
 *
 * WHY THIS FILE VALIDATES
 * -----------------------
 * The snapshot is untrusted input. It can be stale, hand-edited by someone who
 * ignored the banner above, or written by an older version of the script. So
 * every row goes through toClubEvent() before it reaches a component.
 *
 * parseGeneratedEvents() deliberately NEVER throws. This runs at module scope
 * in a file imported by the app shell — a throw here is a blank page for the
 * whole site, not just the Events page. Bad rows are dropped and warned about.
 */

import type { ClubEvent } from '../types';
import { DEFAULT_CATEGORY, isEventCategory } from './event-categories';
import snapshot from './events.generated.json';

// Re-exported so every existing `from '../data/events'` import still resolves.
// See the header of event-categories.ts for why they live in a separate file.
export {
  EVENT_CATEGORIES,
  DEFAULT_CATEGORY,
  categoryFromGoogleColorId,
  isEventCategory,
} from './event-categories';
export type { EventCategory, CategoryAccent } from './event-categories';

/**
 * The shape scripts/sync-calendar.ts writes.
 *
 * `events` is `unknown[]` on purpose: this type describes a file on disk, not
 * the app's model. Narrowing to ClubEvent is toClubEvent's job. The sync script
 * imports this same interface, so writer and reader can't drift.
 */
export interface GeneratedEventsFile {
  /** Bumped when the shape changes incompatibly. Currently 1. */
  schema: number;
  /** ISO timestamp of the sync run that produced this file. */
  generatedAt: string;
  calendarId: string;
  /** The civil-date range the sync asked Google for. Events outside it are absent, not deleted. */
  window: { from: string; to: string };
  events: unknown[];
}

/** The schema version this loader understands. */
const SUPPORTED_SCHEMA = 1;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function warn(message: string): void {
  // Silent in production: a visitor can do nothing about a malformed snapshot,
  // and the designed empty states already communicate "nothing here".
  if (import.meta.env.DEV) console.warn(`[events] ${message}`);
}

/** Accept only strings that are actually usable as an href. */
function optionalUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  return /^https?:\/\//i.test(value) ? value : undefined;
}

/**
 * Narrow one raw row to a ClubEvent, or null if it's unusable.
 *
 * Only `id` and `date` are load-bearing enough to reject a row: without an id
 * React has no key and the calendar can't address the card, and without a valid
 * date every date-derived string in the UI throws. Everything else degrades to
 * a sensible default, because a partial event on the calendar beats no event.
 */
function toClubEvent(raw: unknown): ClubEvent | null {
  if (typeof raw !== 'object' || raw === null) {
    warn('dropped a row that was not an object');
    return null;
  }
  const row = raw as Record<string, unknown>;

  if (typeof row.id !== 'string' || row.id.length === 0) {
    warn('dropped a row with no id');
    return null;
  }
  if (typeof row.date !== 'string' || !ISO_DATE.test(row.date)) {
    warn(`dropped '${row.id}': date must be 'YYYY-MM-DD', got ${JSON.stringify(row.date)}`);
    return null;
  }

  // An unrecognised category is corrected, not fatal — see DEFAULT_CATEGORY.
  let category = DEFAULT_CATEGORY;
  if (isEventCategory(row.category)) {
    category = row.category;
  } else if (row.category !== undefined) {
    warn(`'${row.id}' has unknown category ${JSON.stringify(row.category)}; using ${DEFAULT_CATEGORY}`);
  }

  return {
    id: row.id,
    category,
    title: typeof row.title === 'string' && row.title ? row.title : 'Untitled event',
    description: typeof row.description === 'string' ? row.description : '',
    date: row.date,
    time: typeof row.time === 'string' && row.time ? row.time : 'Time TBA',
    location: typeof row.location === 'string' && row.location ? row.location : 'Location TBA',
    calendarUrl: optionalUrl(row.calendarUrl),
    recapUrl: optionalUrl(row.recapUrl),
    ...(typeof row.isPast === 'boolean' ? { isPast: row.isPast } : {}),
  };
}

/**
 * Validate a whole snapshot. Returns an empty array rather than throwing on
 * anything it can't read — see the header.
 */
export function parseGeneratedEvents(file: GeneratedEventsFile): ClubEvent[] {
  if (file.schema !== SUPPORTED_SCHEMA) {
    warn(`snapshot schema ${file.schema} != ${SUPPORTED_SCHEMA}; ignoring it. Re-run \`npm run sync:calendar\`.`);
    return [];
  }
  if (!Array.isArray(file.events)) {
    warn('snapshot has no events array');
    return [];
  }
  return file.events
    .map(toClubEvent)
    .filter((event): event is ClubEvent => event !== null);
}

/**
 * Every club event, unsorted and unfiltered.
 *
 * Consumers do their own ordering — see byDateAsc/byDateDesc in utils/events.
 * Empty is a legitimate state: it means the calendar is genuinely bare, or a
 * sync has never run. Both render the designed empty states on the Events page.
 */
export const EVENTS: ClubEvent[] = parseGeneratedEvents(snapshot);

/**
 * When the snapshot was built, as an ISO timestamp.
 *
 * Surfaced on the Events page so an officer can tell "the site is stale"
 * (sync is broken — see docs/calendar-sync.md) from "I forgot to save the
 * event". Worth keeping visible; it's the cheapest diagnostic here.
 */
export const EVENTS_SYNCED_AT: string = snapshot.generatedAt;
