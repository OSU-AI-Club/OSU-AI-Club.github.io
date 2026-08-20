// Imported from data/event-categories rather than data/events: the latter now
// pulls in the generated snapshot, and there is no reason for a type file to
// drag a JSON payload into its import graph. event-categories imports nothing.
import type { EventCategory } from './data/event-categories';

export interface Officer {
  id: string;
  name: string;
  role: string;
  major: string;
  minor?: string;
  year: string;
  bio: string;
  /** Resolved URL of a bundled headshot imported in data/officers.ts. Omit to render `initials` instead. */
  photo?: string;
  initials: string;
  socials: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

/**
 * One club event as the UI consumes it.
 *
 * Produced by scripts/sync-calendar.ts from a Google Calendar event and
 * validated in data/events.ts before any component sees it. Not hand-written —
 * see docs/calendar-sync.md.
 */
export interface ClubEvent {
  /** Google's event id, slugged. Stable unless the event is deleted and recreated. */
  id: string;
  /** An id from EVENT_CATEGORIES — the one category list. Set via the event's Google Calendar color. */
  category: EventCategory;
  title: string;
  /** Plain text. Google returns HTML; the sync script flattens and truncates it. */
  description: string;
  /**
   * The one canonical date, ISO 'YYYY-MM-DD', local-civil (not a timestamp).
   * Every display string — the 'OCT'/'07' badge, 'Oct 7, 2026', the weekday —
   * derives from this at render time via src/utils/date.ts.
   *
   * A multi-day event carries only its START date; the span lives in `time`.
   */
  date: string;
  /** Display string, already formatted: "7:00 PM", "7:00 PM – 9:00 PM", "All day". */
  time: string;
  /** "Enarson 258", or "Location TBA" when the calendar event has no Where field. */
  location: string;
  /**
   * Google Calendar's public page for this event — where the "Add to Calendar"
   * button points. Optional: absent on a hand-seeded entry, in which case the
   * card falls back to PUBLIC_CALENDAR_URL in data/general.ts.
   */
  calendarUrl?: string;
  /** Set by a `Recap: <url>` line in the event description. The recap link is hidden without it. */
  recapUrl?: string;
  /**
   * OVERRIDE ONLY. Omit it and past-ness is derived from `date` vs today, which
   * self-heals as time passes. Set it explicitly only to pin an event on the
   * wrong side of the line — e.g. holding a just-finished event out of the
   * recap strip until its `recapUrl` exists. See isEventPast() in utils/events.
   *
   * The sync script never emits this; it exists as a manual escape hatch.
   */
  isPast?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  stats: string;
  image: string;
  applyUrl?: string;
}
