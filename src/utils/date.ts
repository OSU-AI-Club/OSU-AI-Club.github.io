/**
 * Pure calendar math and date formatting.
 *
 * No React, no ClubEvent, no dependencies. Everything here operates on an
 * `ISODate` — a 'YYYY-MM-DD' string standing for a local civil date, not a
 * timestamp.
 *
 * THE ONE RULE THAT MATTERS
 * -------------------------
 * `new Date('2026-10-07')` does NOT do what it looks like it does. Per ECMA-262
 * a *date-only* ISO string is parsed as UTC, so in every US timezone that value
 * reports Oct 6:
 *
 *     new Date('2026-10-07').getDate()   // -> 6 in America/New_York
 *
 * The symmetric trap is on the way out: `new Date().toISOString().slice(0,10)`
 * returns tomorrow's date for anyone east of UTC past their local midnight.
 *
 * So this module follows three rules, and every function below obeys them:
 *
 *  1. Display strings are produced by string slicing plus array lookup. They
 *     never construct a Date at all, so they have zero timezone surface.
 *  2. Where a real Date is unavoidable (weekday, days-in-month, day arithmetic
 *     across month boundaries) use ONLY the numeric multi-argument constructor
 *     `new Date(y, m - 1, d)`, which the spec defines as local time. Never the
 *     string constructor, never Date.parse, never Date.UTC, never toISOString.
 *  3. Ordering and comparison use plain string comparison. 'YYYY-MM-DD' is
 *     fixed-width and zero-padded, so lexicographic order IS chronological
 *     order — no allocation, no timezone involved.
 *
 * Intl.DateTimeFormat is deliberately unused: it would need explicit UTC
 * pinning to be safe, and its output varies with the visitor's locale while
 * this site's copy is fixed English.
 */

/** A local civil calendar date, 'YYYY-MM-DD'. Not a timestamp; has no timezone. */
export type ISODate = string;

/** A year plus a 1-based month. Deliberately not a Date. */
export interface YearMonth {
  year: number;
  /** 1-12, NOT the 0-11 that Date uses. */
  month: number;
}

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/**
 * Two letters, not one. Single-letter headers produce a duplicate S/S and T/T
 * that readers have to decode positionally; two letters still fit the column.
 */
export const WEEKDAY_MIN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const WEEKDAY_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

/** Cells in a month grid: 6 rows of 7. Fixed, so the grid never changes height. */
export const MONTH_MATRIX_CELLS = 42;

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// ---------------------------------------------------------------------------
// Parsing and formatting — string operations only, no Date constructed.
// ---------------------------------------------------------------------------

/** '2026-10-07' -> { year: 2026, month: 10, day: 7 }. Throws on malformed input. */
export function parseISODate(iso: ISODate): { year: number; month: number; day: number } {
  const match = ISO_PATTERN.exec(iso);
  if (!match) throw new Error(`Expected an ISO date like '2026-10-07', got: ${iso}`);
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** (2026, 10, 7) -> '2026-10-07'. Zero-pads month and day. */
export function toISODate(year: number, month: number, day: number): ISODate {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** '2026-10-07' -> '07'. Zero-padded, for the fixed-width card date badge. */
export function isoDayNumber(iso: ISODate): string {
  return iso.slice(8, 10);
}

/** '2026-10-07' -> 'OCT'. The card date badge's month line. */
export function isoMonthBadge(iso: ISODate): string {
  const { month } = parseISODate(iso);
  return MONTH_SHORT[month - 1].toUpperCase();
}

/** '2026-10-07' -> 'Oct 7, 2026'. Day is NOT zero-padded here. */
export function formatLongDate(iso: ISODate): string {
  const { year, month, day } = parseISODate(iso);
  return `${MONTH_SHORT[month - 1]} ${day}, ${year}`;
}

/** '2026-10-07' -> 'Wednesday, October 7, 2026'. For aria-labels and the rail. */
export function formatFullDate(iso: ISODate): string {
  const { year, month, day } = parseISODate(iso);
  return `${WEEKDAY_LONG[weekdayIndex(iso)]}, ${MONTH_LONG[month - 1]} ${day}, ${year}`;
}

/** (2026, 10) -> 'October 2026'. Calendar heading and the live region. */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_LONG[month - 1]} ${year}`;
}

/** (2026, 10) -> "Oct '26". The jump-pill label. */
export function formatMonthPill(year: number, month: number): string {
  return `${MONTH_SHORT[month - 1]} ’${String(year).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Calendar math — local Date via the numeric constructor only.
// ---------------------------------------------------------------------------

/**
 * Today, as a local ISO date.
 *
 * Reads the local component getters rather than toISOString(), which would
 * report the UTC day and be wrong for part of every day.
 */
export function todayISO(): ISODate {
  const now = new Date();
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** 0 = Sunday .. 6 = Saturday. */
export function weekdayIndex(iso: ISODate): number {
  const { year, month, day } = parseISODate(iso);
  return new Date(year, month - 1, day).getDay();
}

/**
 * 28 | 29 | 30 | 31 for a 1-based month.
 *
 * Day 0 of the *next* month is the last day of this one — which is also why
 * `month` is passed through unshifted here while everywhere else subtracts 1.
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Weekday index (0-6) of the 1st of a 1-based month. */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Shift an ISO date by whole days, crossing month and year boundaries.
 *
 * Out-of-range day arguments normalize automatically — `new Date(2026, 9, 46)`
 * is Nov 15 — so no manual carry logic is needed. Building from calendar
 * components rather than epoch milliseconds also makes this DST-safe, which
 * `iso + 86400000` would not be.
 */
export function addDays(iso: ISODate, delta: number): ISODate {
  const { year, month, day } = parseISODate(iso);
  const shifted = new Date(year, month - 1, day + delta);
  return toISODate(shifted.getFullYear(), shifted.getMonth() + 1, shifted.getDate());
}

/** Month arithmetic on a YearMonth. No Date involved. */
export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const zeroBased = ym.year * 12 + (ym.month - 1) + delta;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 };
}

/**
 * Shift by whole months while keeping the day where possible, clamping when the
 * target month is shorter: Jan 31 + 1 month is Feb 28, not Mar 3.
 */
export function addMonthsKeepingDay(iso: ISODate, delta: number): ISODate {
  const { year, month, day } = parseISODate(iso);
  const target = addMonths({ year, month }, delta);
  const clampedDay = Math.min(day, daysInMonth(target.year, target.month));
  return toISODate(target.year, target.month, clampedDay);
}

/** The YearMonth an ISO date falls in. */
export function monthOf(iso: ISODate): YearMonth {
  const { year, month } = parseISODate(iso);
  return { year, month };
}

/**
 * A total-ordering key for a month. Use this for comparison and equality —
 * never compare YearMonth objects directly, they're never referentially equal.
 */
export function monthKey(year: number, month: number): number {
  return year * 12 + (month - 1);
}

/** True when two YearMonths denote the same month. */
export function isSameMonth(a: YearMonth, b: YearMonth): boolean {
  return monthKey(a.year, a.month) === monthKey(b.year, b.month);
}

/**
 * The 42 ISO dates of a month's grid, including leading and trailing spill from
 * the adjacent months.
 *
 * Fixed at 6 rows rather than the natural 5 or 6. A dynamic row count makes the
 * calendar card grow and shrink by ~60px as you page between months, which
 * reflows the two-column layout and makes the detail rail jump. One extra row of
 * dimmed spill days is a cheap price for a stable module height.
 */
export function buildMonthMatrix(year: number, month: number): ISODate[] {
  const lead = firstWeekdayOfMonth(year, month);
  const start = addDays(toISODate(year, month, 1), -lead);
  return Array.from({ length: MONTH_MATRIX_CELLS }, (_, i) => addDays(start, i));
}

/** Split a flat matrix into weeks of 7 for row-wise rendering. */
export function chunkIntoWeeks(dates: ISODate[]): ISODate[][] {
  const weeks: ISODate[][] = [];
  for (let i = 0; i < dates.length; i += 7) weeks.push(dates.slice(i, i + 7));
  return weeks;
}
