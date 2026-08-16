// `import type` matters here: data/events.ts imports ClubEvent back from this
// file, and a value import would make that a real runtime cycle. Type-only
// imports are erased at compile time, so this direction is free.
import type { EventCategory } from './data/events';

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

export interface ClubEvent {
  id: string;
  /** An id from EVENT_CATEGORIES in data/events.ts — the one category list. */
  category: EventCategory;
  title: string;
  description: string;
  /**
   * The one canonical date, ISO 'YYYY-MM-DD', local-civil (not a timestamp).
   * Every display string — the 'OCT'/'07' badge, 'Oct 7, 2026', the weekday —
   * derives from this at render time via src/utils/date.ts.
   */
  date: string;
  time: string; // "7:00 PM"
  location: string; // "Enarson 258"
  rsvpUrl: string;
  recapUrl?: string;
  /**
   * OVERRIDE ONLY. Omit it and past-ness is derived from `date` vs today, which
   * self-heals as time passes. Set it explicitly only to pin an event on the
   * wrong side of the line — e.g. holding a just-finished event out of the
   * recap strip until its `recapUrl` exists. See isEventPast() in utils/events.
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
