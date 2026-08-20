// Club-wide constants: contact links, meeting info, and HackAI event details.
// These are referenced across officers.ts, events.ts, projects.ts, and faqs.ts,
// so keep them here rather than duplicating literals in each file.

export const CLUB_EMAIL = "osuaiclub@gmail.com";
export const CLUB_DISCORD_URL = "https://discord.com/invite/GPCmTECWRu";
export const CLUB_INSTAGRAM_URL = "http://www.instagram.com/ohiostateaiclub";
export const CLUB_LINKEDIN_URL = "https://www.linkedin.com/company/artificial-intelligence-club/about/";
export const NEWSLETTER_URL = "https://go.osu.edu/aiclub";

/** Shared Google Form backing both project-team and HackAI signups. */
export const PROJECT_APPLICATION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd3Aj_10MRloCjjvdpF_HnvoOI8poBr6LveJTUvKTZkrhiDuA/viewform?usp=header";
export const HACKAI_REGISTRATION_URL = PROJECT_APPLICATION_URL;

/**
 * "AIC Public Calendar" — the one calendar the website reads.
 *
 * A calendar dedicated to events meant for publication: everything on it is
 * public by definition, so there is nothing to filter and nothing private that
 * could reach the site by accident.
 *
 * Changing which calendar the site reads is a one-line edit here — the sync
 * script imports this constant, and PUBLIC_CALENDAR_URL derives from it.
 * scripts/apps-script/Code.gs has its own copy that must be kept in step,
 * because Google's editor cannot import from this repo.
 *
 * See docs/calendar-sync.md.
 */
export const GOOGLE_CALENDAR_ID =
  "9d4d51bcbbf901443d1e32bdb25ed366eff8d8078f2799868c6e8f9b6ed3a943@group.calendar.google.com";

/**
 * Public view of that calendar. Two jobs: the "Subscribe" CTA on the Events
 * page, and the fallback target for an event card whose `calendarUrl` is absent.
 */
export const PUBLIC_CALENDAR_URL =
  `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(GOOGLE_CALENDAR_ID)}&ctz=America%2FNew_York`;

export const MEETING_LOCATION = "Enarson 258";
export const MEETING_DAY = "Wednesdays";
export const MEETING_TIME = "6:00 PM";
export const MEETING_SCHEDULE = `${MEETING_DAY} ${MEETING_TIME}`;

export const HACKAI_NAME = "HACKAI 2027";
export const HACKAI_DATE_BADGE = "FEB 20–21, 2027";
export const HACKAI_DATE_FULL = "Feb 20–21, 2027";
export const HACKAI_LOCATION_BADGE = "FONTANA LAB";
export const HACKAI_LOCATION_FULL = "Fontana Lab";
export const HACKAI_DATE_SHORT = "FEB 20–21";
export const HACKAI_BANNER_BADGE = `✦ ${HACKAI_DATE_BADGE} — ${HACKAI_LOCATION_BADGE}`;
