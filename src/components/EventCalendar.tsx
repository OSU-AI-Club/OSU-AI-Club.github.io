import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ClubEvent } from '../types';
import { EVENT_CATEGORIES } from '../data/events';
import {
  type ISODate,
  type YearMonth,
  MONTH_LONG,
  WEEKDAY_LONG,
  WEEKDAY_MIN,
  addDays,
  addMonths,
  addMonthsKeepingDay,
  buildMonthMatrix,
  chunkIntoWeeks,
  formatFullDate,
  formatMonthPill,
  formatMonthYear,
  isSameMonth,
  monthKey,
  monthOf,
  parseISODate,
  toISODate,
  weekdayIndex,
} from '../utils/date';
import {
  categoryDotClass,
  indexEventsByDate,
  isEventPast,
  matchesFilter,
  monthsWithEvents,
  nextUpcomingEvent,
} from '../utils/events';
import { EventCalendarRail } from './EventCalendarRail';

interface EventCalendarProps {
  /**
   * ALL events, unfiltered. The component applies `activeFilter` itself, because
   * the navigation clamp and the jump pills must be computed from the full set
   * — see `bounds` below.
   */
  events: ClubEvent[];
  activeFilter: string;
  /** Hoisted from the page so every subtree agrees on "now". */
  today: ISODate;
}

/** Reused for every cell with no events, so we don't allocate 42 arrays a render. */
const NO_EVENTS: ClubEvent[] = [];

/** Max dots drawn in a cell before they collapse into a "+more" marker. */
const MAX_DOTS = 3;

interface Bounds {
  min: YearMonth;
  max: YearMonth;
}

function isWithinBounds(iso: ISODate, bounds: Bounds | null): boolean {
  if (!bounds) return true; // no events -> navigate freely
  const { year, month } = monthOf(iso);
  const key = monthKey(year, month);
  return key >= monthKey(bounds.min.year, bounds.min.month)
    && key <= monthKey(bounds.max.year, bounds.max.month);
}

/**
 * Interactive month calendar for the Events page.
 *
 * The no-events path is fully designed rather than an edge case: `bounds` is
 * null, month navigation is unclamped, the jump strip doesn't render, and the
 * rail shows its CTA state. Events now come from Google Calendar, so that path
 * is no longer what ships — it is what a visitor sees if the calendar is bare
 * or a sync has failed. Keep it; it is the degraded-state UI, not dead code.
 */
export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  activeFilter,
  today,
}) => {
  /**
   * The months containing events, from the UNFILTERED list. A filter-dependent
   * clamp could strand the user outside the navigable range mid-session, and
   * pills that appear and vanish as you toggle filters are disorienting.
   */
  const jumpMonths = useMemo(() => monthsWithEvents(events), [events]);

  /** null when there are no events at all, which means "don't clamp". */
  const bounds = useMemo<Bounds | null>(
    () => (jumpMonths.length ? { min: jumpMonths[0], max: jumpMonths[jumpMonths.length - 1] } : null),
    [jumpMonths],
  );

  /**
   * Where to open. The next upcoming event if there is one, else the last event
   * we have, else today — so an empty calendar opens on the current month
   * rather than somewhere arbitrary.
   */
  const anchor = useMemo<ISODate>(() => {
    const upcoming = nextUpcomingEvent(events, today);
    if (upcoming) return upcoming.date;
    const last = [...events].sort((a, b) => (a.date < b.date ? -1 : 1)).pop();
    return last?.date ?? today;
  }, [events, today]);

  // Lazy initializers: these are the *opening* position, and must not be
  // recomputed when the filter changes underneath the user.
  const [view, setView] = useState<YearMonth>(() => monthOf(anchor));
  const [selectedISO, setSelectedISO] = useState<ISODate | null>(null);
  const [focusedISO, setFocusedISO] = useState<ISODate>(() => anchor);

  const gridRef = useRef<HTMLDivElement>(null);
  /**
   * Only keyboard-driven moves should pull focus. Without this the restoration
   * effect below would fire on mount and on every filter change, yanking focus
   * into the calendar from wherever the user actually was.
   */
  const shouldStealFocus = useRef(false);

  const visibleEvents = useMemo(
    () => events.filter((event) => matchesFilter(event, activeFilter)),
    [events, activeFilter],
  );
  const eventsByDate = useMemo(() => indexEventsByDate(visibleEvents), [visibleEvents]);
  const matrix = useMemo(() => buildMonthMatrix(view.year, view.month), [view.year, view.month]);
  const weeks = useMemo(() => chunkIntoWeeks(matrix), [matrix]);
  const nextUp = useMemo(() => nextUpcomingEvent(visibleEvents, today), [visibleEvents, today]);

  const canStepBack = !bounds || monthKey(view.year, view.month) > monthKey(bounds.min.year, bounds.min.month);
  const canStepForward = !bounds || monthKey(view.year, view.month) < monthKey(bounds.max.year, bounds.max.month);

  /** Move the keyboard cursor, following it into another month when needed. */
  const moveFocus = (iso: ISODate) => {
    const target = monthOf(iso);
    // React batches both updates into one render, so the grid and the cursor
    // never disagree.
    if (!isSameMonth(target, view)) setView(target);
    shouldStealFocus.current = true;
    setFocusedISO(iso);
  };

  const stepMonth = (delta: number) => {
    const target = addMonths(view, delta);
    setView(target);
    // Keep the cursor inside the rendered grid.
    setFocusedISO((prev) => {
      const { day } = parseISODate(prev);
      return toISODate(target.year, target.month, Math.min(day, 28));
    });
  };

  const jumpToMonth = (target: YearMonth) => {
    setView(target);
    const firstEventInMonth = visibleEvents
      .filter((event) => isSameMonth(monthOf(event.date), target))
      .sort((a, b) => (a.date < b.date ? -1 : 1))[0];
    setFocusedISO(firstEventInMonth?.date ?? toISODate(target.year, target.month, 1));
  };

  const selectDay = (iso: ISODate) => {
    const target = monthOf(iso);
    if (!isSameMonth(target, view)) setView(target); // clicking a spill day pages the grid
    setFocusedISO(iso);
    setSelectedISO((prev) => (prev === iso ? null : iso)); // click again to deselect
  };

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Enter and Space are deliberately absent: the day cells are real buttons,
    // which fire click natively for both. Handling them here would double-fire.
    let next: ISODate | null = null;
    switch (e.key) {
      case 'ArrowRight': next = addDays(focusedISO, 1); break;
      case 'ArrowLeft': next = addDays(focusedISO, -1); break;
      case 'ArrowDown': next = addDays(focusedISO, 7); break;
      case 'ArrowUp': next = addDays(focusedISO, -7); break;
      case 'Home': next = addDays(focusedISO, -weekdayIndex(focusedISO)); break;
      case 'End': next = addDays(focusedISO, 6 - weekdayIndex(focusedISO)); break;
      case 'PageUp': next = addMonthsKeepingDay(focusedISO, e.shiftKey ? -12 : -1); break;
      case 'PageDown': next = addMonthsKeepingDay(focusedISO, e.shiftKey ? 12 : 1); break;
      case 'Escape':
        e.preventDefault();
        setSelectedISO(null);
        return;
      default:
        return; // let Tab and everything else through
    }
    // Load-bearing: unhandled arrows scroll the window, and SmoothScrollProvider
    // then chases that with its lerp — a visible lurch, not just a nuisance.
    e.preventDefault();
    if (!isWithinBounds(next, bounds)) return;
    moveFocus(next);
  };

  useEffect(() => {
    if (!shouldStealFocus.current) return;
    shouldStealFocus.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${focusedISO}"]`)
      // preventScroll is MANDATORY here. A bare focus() triggers the browser's
      // implicit scroll-into-view, which writes scrollTop on the provider's
      // fixed overflow-hidden viewport and permanently desyncs the page.
      // See src/utils/scroll.ts.
      ?.focus({ preventScroll: true });
  }, [focusedISO, view.year, view.month]);

  const selectedDayEvents = selectedISO ? eventsByDate.get(selectedISO) ?? NO_EVENTS : NO_EVENTS;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
      {/* ---- Calendar card ---- */}
      <div className="bg-bg-elevated border border-border-subtle rounded-2xl shadow-card p-4 md:p-6">
        {/* Month heading + stepper */}
        <div className="flex items-center justify-between mb-5 select-none">
          <h3
            id="event-calendar-month-label"
            className="font-display text-[18px] md:text-[20px] font-extrabold text-text-primary leading-none tracking-tight"
          >
            {MONTH_LONG[view.month - 1]}{' '}
            <span className="font-mono text-text-muted font-bold">{view.year}</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="event-calendar-prev-month"
              aria-label="Previous month"
              disabled={!canStepBack}
              onClick={() => stepMonth(-1)}
              className="w-8 h-8 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-accent-primary cursor-pointer transition-all active:scale-95 disabled:opacity-35 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="event-calendar-next-month"
              aria-label="Next month"
              disabled={!canStepForward}
              onClick={() => stepMonth(1)}
              className="w-8 h-8 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-accent-primary cursor-pointer transition-all active:scale-95 disabled:opacity-35 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Jump pills — only rendered once some month actually has events.
            NOTE: this list grows unbounded as the archive fills up; past a
            dozen or so it should probably group by year. */}
        {jumpMonths.length > 0 && (
          <div
            id="event-calendar-jump-strip"
            role="group"
            aria-label="Jump to a month with events"
            className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-5 snap-x md:flex-wrap md:overflow-x-visible select-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {jumpMonths.map((month) => {
              const isActive = isSameMonth(month, view);
              return (
                <button
                  type="button"
                  key={monthKey(month.year, month.month)}
                  id={`event-calendar-jump-${month.year}-${month.month}`}
                  onClick={() => jumpToMonth(month)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`shrink-0 snap-start px-3 py-1.5 rounded-full font-sans text-[10.5px] font-bold tracking-wide transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-accent-primary text-on-accent border-accent-primary shadow-[0_4px_12px_var(--ui-accent-glow)]'
                      : 'bg-bg-elevated text-text-secondary hover:text-accent-primary border-border-subtle shadow-sm hover:scale-[1.03]'
                  }`}
                >
                  {formatMonthPill(month.year, month.month)}
                </button>
              );
            })}
          </div>
        )}

        {/* Real row elements rather than `display: contents` wrappers: contents
            has a history of dropping elements out of the accessibility tree,
            which would silently delete the row layer. Every row is its own
            equal-width 7-col grid, so the columns line up regardless. */}
        <div
          ref={gridRef}
          id="event-calendar-grid"
          role="grid"
          aria-labelledby="event-calendar-month-label"
          aria-readonly="true"
          onKeyDown={onGridKeyDown}
          className="flex flex-col gap-1 md:gap-1.5"
        >
          <div role="row" className="grid grid-cols-7 gap-1 md:gap-1.5 select-none">
            {WEEKDAY_MIN.map((label, i) => (
              <div
                key={label}
                role="columnheader"
                aria-label={WEEKDAY_LONG[i]}
                className="h-7 flex items-center justify-center font-sans text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted"
              >
                {label}
              </div>
            ))}
          </div>

          {weeks.map((week, rowIndex) => (
            <div key={rowIndex} role="row" className="grid grid-cols-7 gap-1 md:gap-1.5">
              {week.map((iso) => {
                const { day } = parseISODate(iso);
                const inMonth = isSameMonth(monthOf(iso), view);
                const inBounds = isWithinBounds(iso, bounds);
                const isToday = iso === today;
                const isSelected = iso === selectedISO;
                const dayEvents = eventsByDate.get(iso) ?? NO_EVENTS;
                const allPast = dayEvents.length > 0
                  && dayEvents.every((event) => isEventPast(event, today));

                // Outside the navigable range: a plain cell, not a disabled
                // button. A disabled button can't hold focus, so if the roving
                // cursor ever landed on one the grid would drop out of the tab
                // order entirely.
                if (!inBounds) {
                  return (
                    <div
                      key={iso}
                      role="gridcell"
                      className="h-11 md:h-14 flex items-center justify-center font-mono text-[13px] font-bold text-text-muted/35 cursor-default select-none"
                    >
                      {day}
                    </div>
                  );
                }

                const label = dayEvents.length === 0
                  ? `${formatFullDate(iso)}, no events`
                  : dayEvents.length === 1
                    ? `${formatFullDate(iso)}, 1 event: ${dayEvents[0].title}`
                    : `${formatFullDate(iso)}, ${dayEvents.length} events`;

                return (
                  <button
                    type="button"
                    key={iso}
                    data-date={iso}
                    // gridcell rather than button: aria-selected is invalid on a
                    // button role and valid here, and it's what makes the
                    // selection state announceable at all. Native button
                    // keyboard activation is unaffected by the role.
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={label}
                    tabIndex={iso === focusedISO ? 0 : -1}
                    onClick={() => selectDay(iso)}
                    className={[
                      'relative h-11 md:h-14 rounded-lg flex items-center justify-center font-mono text-[13px] font-bold border transition-all cursor-pointer',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated',
                      isSelected
                        ? 'bg-accent-primary text-on-accent border-accent-primary shadow-[0_4px_12px_var(--ui-accent-glow)] scale-[1.03]'
                        : dayEvents.length > 0
                          ? 'bg-bg-secondary border-border-subtle text-text-primary hover:bg-bg-primary hover:border-accent-primary/40 hover:scale-[1.05]'
                          : 'bg-transparent border-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary',
                      !isSelected && isToday ? 'ring-1 ring-inset ring-accent-secondary/60 text-accent-secondary' : '',
                      !isSelected && allPast ? 'opacity-55 hover:opacity-100' : '',
                      !inMonth ? 'opacity-45 text-text-muted hover:opacity-80' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className="leading-none">{day}</span>

                    {dayEvents.length > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-1.5 left-0 right-0 flex items-center justify-center gap-[3px] pointer-events-none"
                      >
                        {dayEvents.slice(0, MAX_DOTS).map((event) => (
                          <span
                            key={event.id}
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              // On a selected cell the dot would otherwise be
                              // accent-on-accent and vanish entirely.
                              isSelected ? 'bg-on-accent' : categoryDotClass(event.category)
                            }`}
                          />
                        ))}
                        {dayEvents.length > MAX_DOTS && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-on-accent/70' : 'bg-text-muted'
                            }`}
                          />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Only the month. The focused cell's own aria-label already announces
            the day, so repeating it here would stutter on every arrow key. */}
        <span className="sr-only" role="status" aria-live="polite">
          {formatMonthYear(view.year, view.month)}
        </span>

        {/* Legend stays visible even with no events — it tells a first-time
            visitor what the dots are going to mean. */}
        <div className="mt-5 pt-4 border-t border-border-subtle/60 flex flex-wrap items-center gap-x-4 gap-y-2 select-none">
          {EVENT_CATEGORIES.map((category) => (
            <span
              key={category.id}
              className="flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted"
            >
              {/* Same mark the cell dots use, so the legend explains what's
                  actually drawn in the grid. */}
              <span className={`w-1.5 h-1.5 rounded-full ${categoryDotClass(category.id)}`} />
              {category.id}
            </span>
          ))}
          <span className="flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-text-muted ml-auto">
            <span className="w-1.5 h-1.5 rounded-full ring-1 ring-accent-secondary/60" />
            Today
          </span>
        </div>
      </div>

      <EventCalendarRail
        selectedISO={selectedISO}
        dayEvents={selectedDayEvents}
        nextUp={nextUp}
        hasAnyEvents={events.length > 0}
        activeFilter={activeFilter}
        today={today}
        onClear={() => setSelectedISO(null)}
      />
    </div>
  );
};
