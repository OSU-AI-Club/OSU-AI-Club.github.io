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
 * Incubator sponsorship application. Deliberately its own form, not
 * PROJECT_APPLICATION_URL — that one is for joining an existing team, this one
 * is for a team asking the club to back its project.
 */
export const INCUBATOR_APPLICATION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfYCuIXLisadro-GGryF1YAH6Wjxiq29ZWc4mxVDz9YWKgljA/viewform?usp=dialog";

/**
 * Public Notion page listing the projects the incubator currently sponsors.
 * Empty until that board is published: the Incubator page shows an
 * under-development notice while this is falsy and iframes it once set, so
 * going live is a one-line edit here.
 */
export const NOTION_SPONSORED_PROJECTS_URL = "";

/**
 * The calendars the website shows, overlaid in one embed under the "AIC Public
 * Calendar" title. Each is dedicated to events meant for publication:
 * everything on them is public by definition, so there is nothing to filter and
 * nothing private that could reach the site by accident. Deliberately NOT the
 * osuaiclub@gmail.com primary calendar — that account's own calendar carries
 * busy-blocks and forwarded invites that have no business on a public page.
 *
 * Order matters: Google pairs the Nth `src` with the Nth `color`, so add and
 * remove entries as whole rows. Adding or dropping a calendar the site shows is
 * a one-row edit here; GOOGLE_CALENDAR_EMBED_URL derives from this list.
 */
export const GOOGLE_CALENDARS = [
  { name: "General Meetings", id: "9d4d51bcbbf901443d1e32bdb25ed366eff8d8078f2799868c6e8f9b6ed3a943@group.calendar.google.com", color: "#ef6c00" },
  { name: "HackAI", id: "06abf7bd4168934416b396493776eb4ec240f37741c3e24bb80fcd251c666a69@group.calendar.google.com", color: "#c0ca33" },
  { name: "Holidays", id: "2c6d8f2d79132b77fc72ceb1886017cf3c102940f897953c11ac11a34ad55204@group.calendar.google.com", color: "#0b8043" },
  { name: "Social Events", id: "813da2eeca08d8dfa170bb795de2172dab6c7fae0aa2c391fadc8b19f5efd6e8@group.calendar.google.com", color: "#8e24aa" },
  { name: "Speakers", id: "cb239286a7cfe93fd30afe95f000d670c8ae69ea7a32007752c1597b27ed67dc@group.calendar.google.com", color: "#7cb342" },
  { name: "Workshops", id: "38d09b5cffc4cb55f1c79e253fde2e5b40acb0dc751c81dac9a3af3b5995ea8b@group.calendar.google.com", color: "#4285f4" },
] as const;

/**
 * The embed the Events page iframes. Google renders this live, so the site is
 * always current — there is no build step, no API key and no snapshot.
 *
 * Requires every calendar above to stay public with "See all event details";
 * tighten that sharing setting and that calendar's events drop out of the view.
 */
export const GOOGLE_CALENDAR_EMBED_URL =
  `https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York` +
  `&showPrint=0&title=AIC%20Public%20Calendar` +
  GOOGLE_CALENDARS.map(c => `&src=${encodeURIComponent(c.id)}`).join('') +
  GOOGLE_CALENDARS.map(c => `&color=${encodeURIComponent(c.color)}`).join('');

// Google's embed has no "listed but unchecked" option, so a calendar is hidden
// by leaving it out of the URL entirely.
const HOME_AGENDA_CALENDARS = GOOGLE_CALENDARS.filter(c => c.name !== "Holidays");

/** Home page's upcoming-events list: agenda view, no date navigation, no holidays. */
export const GOOGLE_CALENDAR_AGENDA_EMBED_URL =
  `https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York` +
  `&mode=AGENDA&showPrint=0&showNav=0&title=AIC%20General%20Calendar` +
  HOME_AGENDA_CALENDARS.map(c => `&src=${encodeURIComponent(c.id)}`).join('') +
  HOME_AGENDA_CALENDARS.map(c => `&color=${encodeURIComponent(c.color)}`).join('');

export const MEETING_LOCATION = "Hitchcock 035";
export const MEETING_DAY = "Wednesdays";
export const MEETING_TIME = "7:30 PM";
export const MEETING_SCHEDULE = `${MEETING_DAY} ${MEETING_TIME}`;

export const HACKAI_NAME = "HACKAI 2027";
export const HACKAI_DATE_BADGE = "FEB 20–21, 2027";
export const HACKAI_DATE_FULL = "Feb 20–21, 2027";
export const HACKAI_LOCATION_BADGE = "FONTANA LAB";
export const HACKAI_LOCATION_FULL = "Fontana Lab";
export const HACKAI_DATE_SHORT = "FEB 20–21";
export const HACKAI_BANNER_BADGE = `✦ ${HACKAI_DATE_BADGE} — ${HACKAI_LOCATION_BADGE}`;
