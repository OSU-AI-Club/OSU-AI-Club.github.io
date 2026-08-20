/**
 * Sync club events from Google Calendar into src/data/events.generated.json.
 *
 *   npm run sync:calendar              # write the snapshot
 *   npm run sync:calendar -- --dry-run # print what it would write, touch nothing
 *
 * Runs on CI between `npm ci` and `vite build` (see .github/workflows/deploy.yml),
 * so the events are baked into the bundle and the visitor's browser never talks
 * to Google. Officer-facing docs: docs/calendar-sync.md.
 *
 * WHY THIS IS A BUILD STEP AND NOT A FETCH
 * ----------------------------------------
 * The site is static files on GitHub Pages — there is no server to proxy a
 * request and no safe place to put a key that a browser could use. Baking the
 * data in also means no loading state, no CORS, and no dependency on Google
 * being reachable when a visitor arrives.
 *
 * FAILURE POLICY
 * --------------
 * Loud, with one exception. A failed build is already the graceful degradation
 * you want here: the previously deployed artifact stays live, so visitors keep
 * seeing the last good calendar, and Actions shows a red X plus an email.
 * Silently falling back to the committed snapshot produces the same page for
 * the visitor but with nobody alerted — which is how a site quietly freezes in
 * August and nobody notices until November.
 *
 * The exception is a MISSING API KEY, which exits 0. That is the path for a
 * contributor running `npm run dev` after a fresh clone, and for pull requests
 * from forks, where repository secrets are unavailable by design.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import type { ClubEvent } from '../src/types';
import { GOOGLE_CALENDAR_ID } from '../src/data/general';
import type { GeneratedEventsFile } from '../src/data/events';
import {
  DEFAULT_CATEGORY,
  categoryFromGoogleColorId,
  isEventCategory,
  type EventCategory,
} from '../src/data/event-categories';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(HERE, '../src/data/events.generated.json');

/**
 * Imported rather than duplicated: which calendar the site reads is a property
 * of the site, not of this script, and two copies would drift.
 */
const CALENDAR_ID = GOOGLE_CALENDAR_ID;
const TIME_ZONE = 'America/New_York';

/**
 * How much calendar to keep, in months either side of today.
 *
 * This window IS the navigable range of the calendar UI: monthsWithEvents() in
 * src/utils/events.ts clamps month navigation and builds the jump pills from
 * whatever events exist. 12 back preserves the past-events archive; 12 forward
 * covers the next academic year plus February's HackAI. Roughly 8 event-months
 * a year means ~16 jump pills, about as many as that strip handles well.
 *
 * NOTE the window is rolling and recomputed every build, so an event drops off
 * the site 12 months after it happened — recap included. That is a deliberate
 * trade for a bounded page, not an oversight. A permanent archive would mean
 * merging into the existing snapshot instead of replacing it.
 */
const MONTHS_BACK = 12;
const MONTHS_FORWARD = 12;

/** Google's cap is 2500; we are nowhere near it, but be explicit. */
const PAGE_SIZE = 2500;
/** A pagination bug should fail, not spin. 10 pages is ~25k events. */
const MAX_PAGES = 10;

const MAX_TITLE_CHARS = 120;
/**
 * EventCard renders the description untruncated (no line-clamp), so one long
 * description would make a single grid cell tower over its neighbours.
 */
const MAX_DESCRIPTION_CHARS = 280;

/**
 * Below this, "everything was skipped" is plausible rather than alarming — a
 * calendar holding two private busy-blocks and nothing else is a real state.
 */
const SUSPICIOUS_SKIP_THRESHOLD = 3;

const SCHEMA_VERSION = 1;

// ---------------------------------------------------------------------------
// Google Calendar API types — only the fields we ask for in `fields=`.
// ---------------------------------------------------------------------------

interface GoogleEventTime {
  /** RFC3339 instant, for timed events: '2026-09-02T19:00:00-04:00'. */
  dateTime?: string;
  /** Civil date, for all-day events: '2026-09-02'. Exclusive on `end`. */
  date?: string;
  timeZone?: string;
}

interface GoogleEvent {
  id?: string;
  status?: string;
  visibility?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: GoogleEventTime;
  end?: GoogleEventTime;
  htmlLink?: string;
  colorId?: string;
  attendees?: { email?: string }[];
}

interface GoogleEventsResponse {
  items?: GoogleEvent[];
  nextPageToken?: string;
}

// ---------------------------------------------------------------------------
// Environment guards — run before any network call, so a broken runtime fails
// in under a second rather than after a successful fetch and a wrong file.
// ---------------------------------------------------------------------------

/**
 * Node ships full ICU, but a stripped build resolves an unknown timezone to UTC
 * *silently*. That would shift every 7pm event to the next calendar day — the
 * exact bug src/utils/date.ts's header exists to prevent, arriving through a
 * different door. Assert on a fixed instant instead of trusting the platform.
 */
function assertTimeZoneSupport(): void {
  // 2026-07-01T16:00:00Z is noon EDT (UTC-4).
  const probe = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(new Date('2026-07-01T16:00:00Z'));

  if (probe !== '12') {
    throw new Error(
      `This Node build cannot resolve ${TIME_ZONE} (expected hour '12', got '${probe}'). ` +
        'It was likely compiled with small-icu. Use an official Node 22 build.',
    );
  }
}

// ---------------------------------------------------------------------------
// Time formatting
//
// Intl is used here deliberately; see the exemption note in src/utils/date.ts.
// The short version: this runs once on a build machine with the locale and zone
// passed as explicit arguments, and it emits plain strings that the browser
// never re-parses.
// ---------------------------------------------------------------------------

const NY_PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

interface CivilTime {
  /** 'YYYY-MM-DD' in America/New_York. */
  date: string;
  hour: number;
  minute: number;
}

/** An RFC3339 instant -> its civil clock reading in America/New_York. */
function nyCivil(rfc3339: string): CivilTime {
  const instant = new Date(rfc3339);
  if (Number.isNaN(instant.getTime())) {
    throw new Error(`Unparseable timestamp from Google: ${rfc3339}`);
  }

  const parts: Record<string, string> = {};
  for (const part of NY_PARTS.formatToParts(instant)) parts[part.type] = part.value;

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/**
 * (19, 0) -> '7:00 PM'.
 *
 * Assembled by hand rather than via Intl's format(), which under ICU 72+ joins
 * with U+202F NARROW NO-BREAK SPACE. That looks identical in a terminal, would
 * not equal MEETING_TIME ('7:00 PM') in src/data/general.ts, and renders with
 * subtly wrong spacing on the card.
 */
function formatClockTime(hour: number, minute: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:${String(minute).padStart(2, '0')} ${suffix}`;
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** '2026-09-02' -> 'Sep 2'. String slicing only — no Date, so no timezone. */
function shortDate(iso: string): string {
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  return `${MONTH_SHORT[month - 1]} ${day}`;
}

/** Shift a civil 'YYYY-MM-DD' by whole days via the numeric Date constructor. */
function addDays(iso: string, delta: number): string {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  const shifted = new Date(year, month - 1, day + delta);
  return [
    String(shifted.getFullYear()).padStart(4, '0'),
    String(shifted.getMonth() + 1).padStart(2, '0'),
    String(shifted.getDate()).padStart(2, '0'),
  ].join('-');
}

// ---------------------------------------------------------------------------
// Description handling
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

/**
 * Google Calendar's description field is HTML — its compose box is a rich-text
 * editor — and EventCard renders the string as a text node. Without this an
 * officer's bulleted list shows up as literal `<li>` on the site.
 *
 * Anchors lose their href here (step 2). That is a known limitation, documented
 * for officers: put links in a directive, not in prose.
 */
function htmlToPlainText(html: string): string {
  let text = html;

  // 1. Block-level tags become line breaks before everything else is stripped.
  text = text.replace(/<\s*br\s*\/?\s*>/gi, '\n');
  text = text.replace(/<\s*\/\s*(p|div|li|ul|ol|h[1-6])\s*>/gi, '\n');
  text = text.replace(/<\s*li[^>]*>/gi, '\n• ');

  // 2. Everything else goes.
  text = text.replace(/<[^>]*>/g, '');

  // 3. Entities, named then numeric.
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    text = text.replace(new RegExp(entity, 'gi'), char);
  }
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));

  // 4. Tidy whitespace, keeping paragraph breaks.
  text = text.replace(/\r\n?/g, '\n');
  text = text.split('\n').map((line) => line.trim()).join('\n');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

interface Directives {
  /** The description with directive lines removed. */
  body: string;
  recapUrl?: string;
  category?: string;
}

/**
 * Pull `Recap:` / `Category:` lines out of a description.
 *
 * These exist because a Google Calendar event has no field for either. They are
 * matched case-insensitively on their own line and removed from the visible
 * text, so an officer can add one without it showing up on the site or in the
 * calendar apps of anyone subscribed.
 */
function extractDirectives(text: string): Directives {
  const kept: string[] = [];
  let recapUrl: string | undefined;
  let category: string | undefined;

  for (const line of text.split('\n')) {
    const recap = /^\s*recap\s*:\s*(\S+)\s*$/i.exec(line);
    if (recap) {
      recapUrl = recap[1];
      continue;
    }
    const cat = /^\s*category\s*:\s*(.+?)\s*$/i.exec(line);
    if (cat) {
      category = cat[1];
      continue;
    }
    kept.push(line);
  }

  return {
    body: kept.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    recapUrl,
    category,
  };
}

/** Cut at a word boundary and add an ellipsis. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Mapping a Google event to a ClubEvent
// ---------------------------------------------------------------------------

/** Reasons an event was left out, for the run summary. */
type SkipReason = 'cancelled' | 'private' | 'has-guests' | 'no-title' | 'no-start' | 'no-id';

/** DOM-id safe, and stable across syncs so React keys don't churn. */
function slugId(googleId: string): string {
  return googleId.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function cleanTitle(summary: string): string {
  return truncate(summary.replace(/\s+/g, ' ').trim(), MAX_TITLE_CHARS);
}

/**
 * Google Maps autocomplete appends a country to anything picked from its
 * dropdown, so "Enarson Classroom Building, Columbus, OH 43210, United States"
 * is what an officer gets for clicking one suggestion. The card has room for a
 * room number, not a postal address.
 */
function cleanLocation(location: string | undefined): string {
  if (!location) return 'Location TBA';
  const trimmed = location
    .split('\n')[0]
    .replace(/,\s*(United States|USA|US)\s*$/i, '')
    .trim();
  return trimmed || 'Location TBA';
}

/** Only accept a directive URL that will actually work as an href. */
function validUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : undefined;
}

/**
 * Build the `time` display string.
 *
 * A multi-day event still produces ONE ClubEvent on its start date, so the span
 * has to live in this string. indexEventsByDate() in src/utils/events.ts maps
 * an event to exactly one date; spanning cells would mean either duplicating
 * the event (breaking id uniqueness and React keys) or teaching the calendar
 * about ranges. Known limitation — HackAI's two-day weekend hits it.
 */
function formatTimeRange(start: GoogleEventTime, end: GoogleEventTime | undefined): string {
  // All-day: dates are civil already, and `end.date` is EXCLUSIVE.
  if (start.date) {
    const lastDay = end?.date ? addDays(end.date, -1) : start.date;
    return lastDay > start.date
      ? `All day · ${shortDate(start.date)} – ${shortDate(lastDay)}`
      : 'All day';
  }

  const from = nyCivil(start.dateTime!);
  const fromClock = formatClockTime(from.hour, from.minute);

  if (!end?.dateTime) return fromClock;

  const to = nyCivil(end.dateTime);
  const toClock = formatClockTime(to.hour, to.minute);

  if (to.date !== from.date) {
    return `${shortDate(from.date)}, ${fromClock} – ${shortDate(to.date)}, ${toClock}`;
  }
  return toClock === fromClock ? fromClock : `${fromClock} – ${toClock}`;
}

interface MappedEvent {
  event?: ClubEvent;
  skip?: SkipReason;
  warning?: string;
}

function toClubEvent(item: GoogleEvent): MappedEvent {
  // singleEvents=true + showDeleted=false already excludes most of these, but a
  // cancelled *instance* of a recurring event can still come back.
  if (item.status === 'cancelled') return { skip: 'cancelled' };
  // Private events on a public calendar arrive redacted.
  if (item.visibility === 'private') return { skip: 'private' };

  // A club event announced to the world has no invitee list; a meeting *with*
  // people does. Belt-and-braces on top of using a dedicated public calendar:
  // if a meeting invite is ever forwarded onto it, this keeps the guests' names
  // and email addresses off the public site.
  //
  // The cost: a real club event that has guests invited on it will silently
  // stop publishing. Officers are told not to invite people to public events.
  if (Array.isArray(item.attendees) && item.attendees.length > 0) {
    return { skip: 'has-guests' };
  }
  if (!item.id) return { skip: 'no-id' };
  if (!item.start || (!item.start.dateTime && !item.start.date)) return { skip: 'no-start' };

  // An untitled event on a public calendar is almost always a personal busy
  // block, not something the club meant to advertise.
  const summary = item.summary?.trim();
  if (!summary) return { skip: 'no-title' };

  const plain = item.description ? htmlToPlainText(item.description) : '';
  const { body, recapUrl, category: categoryDirective } = extractDirectives(plain);

  let category: EventCategory = categoryFromGoogleColorId(item.colorId);
  let warning: string | undefined;
  if (categoryDirective !== undefined) {
    if (isEventCategory(categoryDirective)) {
      category = categoryDirective;
    } else {
      warning = `'${summary}' has "Category: ${categoryDirective}", which is not a known category; using ${category}`;
    }
  }

  const date = item.start.date ?? nyCivil(item.start.dateTime!).date;

  return {
    event: {
      id: slugId(item.id),
      category,
      title: cleanTitle(summary),
      description: truncate(body, MAX_DESCRIPTION_CHARS),
      date,
      time: formatTimeRange(item.start, item.end),
      location: cleanLocation(item.location),
      ...(item.htmlLink ? { calendarUrl: item.htmlLink } : {}),
      ...(validUrl(recapUrl) ? { recapUrl: validUrl(recapUrl) } : {}),
    },
    warning,
  };
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/** First of the month, `delta` months from today, as an RFC3339 UTC instant. */
function monthBoundary(delta: number): string {
  const now = new Date();
  const anchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + delta, 1));
  return anchor.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

const FIELDS = 'nextPageToken,items(id,status,visibility,summary,description,location,start,end,htmlLink,colorId,attendees(email))';

function buildUrl(apiKey: string, pageToken?: string): string {
  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: 'true', // expand recurrences server-side
    orderBy: 'startTime', // only legal alongside singleEvents
    showDeleted: 'false',
    maxResults: String(PAGE_SIZE),
    timeZone: TIME_ZONE,
    timeMin: monthBoundary(-MONTHS_BACK),
    timeMax: monthBoundary(MONTHS_FORWARD + 1),
    // Trims the payload ~80%, and means a field Google adds later cannot
    // silently change what this script sees.
    fields: FIELDS,
  });
  if (pageToken) params.set('pageToken', pageToken);

  return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(apiKey: string, pageToken?: string): Promise<GoogleEventsResponse> {
  const url = buildUrl(apiKey, pageToken);
  let lastError = '';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return (await response.json()) as GoogleEventsResponse;

      const body = await response.text();

      // An invalid or missing key comes back as 400 INVALID_ARGUMENT, not 401.
      if (response.status === 400 || response.status === 401) {
        throw new Error(
          `Google rejected the API key (HTTP ${response.status}).\n` +
            '  Check the GOOGLE_CALENDAR_API_KEY value — locally in your shell, on CI in\n' +
            '  Settings -> Secrets and variables -> Actions. Keys look like "AIza...".\n' +
            `  Response body: ${body}`,
        );
      }

      // Permanent too — retrying just delays the real message.
      if (response.status === 403 || response.status === 404) {
        throw new Error(
          `Google returned ${response.status}.\n` +
            '  Two things cause this, in order of likelihood:\n' +
            `    1. The calendar is no longer public. Google Calendar -> Settings for ${CALENDAR_ID}\n` +
            '       -> Access permissions -> tick "Make available to public" / "See all event details".\n' +
            '    2. The API key is restricted to the wrong thing. In Google Cloud Console the key needs\n' +
            '       API restriction = Google Calendar API, and Application restriction = None.\n' +
            '       An HTTP-referrer restriction breaks server-side calls like this one.\n' +
            `  Response body: ${body}`,
        );
      }

      lastError = `HTTP ${response.status}: ${body}`;
    } catch (error) {
      // Permanent failures are already fully explained; don't retry or reword.
      if (error instanceof Error && /^Google (returned|rejected)/.test(error.message)) throw error;
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < 3) {
      const backoff = 1000 * 2 ** (attempt - 1);
      console.warn(`  attempt ${attempt} failed (${lastError}); retrying in ${backoff}ms`);
      await sleep(backoff);
    }
  }

  throw new Error(`Could not reach the Google Calendar API after 3 attempts. Last error: ${lastError}`);
}

async function fetchAllEvents(apiKey: string): Promise<GoogleEvent[]> {
  const items: GoogleEvent[] = [];
  let pageToken: string | undefined;
  let page = 0;

  do {
    if (++page > MAX_PAGES) {
      throw new Error(`Stopped after ${MAX_PAGES} pages — that is far more than this calendar should have.`);
    }
    const response = await fetchPage(apiKey, pageToken);
    items.push(...(response.items ?? []));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return items;
}

// ---------------------------------------------------------------------------
// Snapshot IO
// ---------------------------------------------------------------------------

function readExistingSnapshot(): GeneratedEventsFile | null {
  try {
    return JSON.parse(readFileSync(OUT_FILE, 'utf8')) as GeneratedEventsFile;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY?.trim();
  const existing = readExistingSnapshot();

  // The one non-fatal path. A fresh clone has no key, and neither does a PR
  // from a fork — both should still be able to build the site.
  if (!apiKey) {
    console.warn('GOOGLE_CALENDAR_API_KEY is not set — skipping the calendar sync.');
    console.warn(
      existing
        ? `Keeping the committed snapshot (${existing.events?.length ?? 0} events, generated ${existing.generatedAt}).`
        : 'There is no committed snapshot either, so the site will render its empty states.',
    );
    console.warn('This is expected locally. On CI it means the repository secret is missing.');
    return;
  }

  assertTimeZoneSupport();

  console.log(`Fetching ${CALENDAR_ID} (${MONTHS_BACK} months back, ${MONTHS_FORWARD} forward)…`);
  const raw = await fetchAllEvents(apiKey);
  console.log(`  ${raw.length} raw events returned`);

  const events: ClubEvent[] = [];
  const skips = new Map<SkipReason, number>();
  const seenIds = new Map<string, string>();

  for (const item of raw) {
    const { event, skip, warning } = toClubEvent(item);
    if (warning) console.warn(`  ! ${warning}`);
    if (skip) {
      skips.set(skip, (skips.get(skip) ?? 0) + 1);
      continue;
    }
    if (!event) continue;

    // Two events collapsing to one id would silently drop one and break React
    // keys for the other. Fail instead — it means slugId needs widening.
    const collision = seenIds.get(event.id);
    if (collision) {
      throw new Error(
        `Two events slug to the same id '${event.id}': '${collision}' and '${event.title}'. ` +
          'Widen slugId() in this script.',
      );
    }
    seenIds.set(event.id, event.title);
    events.push(event);
  }

  events.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date < b.date ? -1 : 1));

  // ---- Summary. This table is the debugging tool; keep it printing. ----
  const byCategory = new Map<string, number>();
  for (const event of events) byCategory.set(event.category, (byCategory.get(event.category) ?? 0) + 1);

  console.log(`\n  ${events.length} events kept`);
  for (const category of [...byCategory.keys()].sort()) {
    console.log(`    ${category.padEnd(10)} ${byCategory.get(category)}`);
  }
  if (skips.size > 0) {
    console.log('  skipped:');
    for (const [reason, count] of skips) console.log(`    ${reason.padEnd(10)} ${count}`);
  }
  if (events.length > 0) {
    console.log(`  range: ${events[0].date} … ${events[events.length - 1].date}`);
    console.log(`  first: ${events[0].title} (${events[0].time})`);
  }
  console.log('');

  // Google returned events and every single one was discarded. That is a broken
  // mapping or a calendar full of private entries — not an empty calendar — and
  // publishing it would silently blank the Events page.
  //
  // Note this deliberately does NOT compare against the previous snapshot's
  // count: the committed snapshot is empty by design, so on CI that baseline is
  // always 0 and such a check would never fire where it matters most.
  if (events.length === 0 && raw.length >= SUSPICIOUS_SKIP_THRESHOLD) {
    throw new Error(
      `Google returned ${raw.length} events but none survived mapping — refusing to publish an empty calendar.\n` +
        `  Skipped: ${[...skips].map(([reason, count]) => `${reason} x${count}`).join(', ') || 'none'}\n` +
        '  If these are all genuinely private or untitled, the calendar has no public events to show.',
    );
  }

  // An empty result with nothing fetched is legitimate — a brand-new calendar,
  // or a club between semesters. Say so rather than failing.
  if (events.length === 0) {
    console.warn('No events to publish. The Events page will render its empty states.');
  }

  const snapshot: GeneratedEventsFile = {
    schema: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    calendarId: CALENDAR_ID,
    window: { from: monthBoundary(-MONTHS_BACK).slice(0, 10), to: monthBoundary(MONTHS_FORWARD + 1).slice(0, 10) },
    events,
  };

  if (dryRun) {
    console.log('--dry-run: not writing. Snapshot would be:\n');
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  // Compare events only, never generatedAt — otherwise every local run dirties
  // the git diff and `git status` stops being informative.
  if (existing && JSON.stringify(existing.events) === JSON.stringify(events)) {
    console.log('No changes since the last sync; leaving the file alone.');
    return;
  }

  writeFileSync(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${events.length} events to src/data/events.generated.json`);
}

main().catch((error: unknown) => {
  console.error('\nCalendar sync failed.\n');
  console.error(error instanceof Error ? error.message : error);
  console.error('\nSee docs/calendar-sync.md for the debugging checklist.');
  process.exit(1);
});
