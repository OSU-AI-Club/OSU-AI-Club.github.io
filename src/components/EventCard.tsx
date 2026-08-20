import React from 'react';
import { MapPin, Clock, ArrowRight, CalendarPlus } from 'lucide-react';
import type { ClubEvent } from '../types';
import { type ISODate, isoDayNumber, isoMonthBadge } from '../utils/date';
import { categoryAccentClass, categoryBadgeClass, isEventPast } from '../utils/events';
import { PUBLIC_CALENDAR_URL } from '../data/general';

interface EventCardProps {
  event: ClubEvent;
  /** Threaded down rather than read here — see the single todayISO() call in Events.tsx. */
  today: ISODate;
  /**
   * Distinguishes DOM ids between the two places this card can render at once
   * — the upcoming grid and the calendar rail can both show the next event on
   * the same page, and duplicate ids break getElementById-based lookups.
   */
  idPrefix?: string;
  className?: string;
}

/**
 * The full event card: color bar, floating date badge, category tag, title,
 * complete (untruncated) description, metadata footer, and a footer action
 * that depends on which side of today the event falls.
 *
 * The footer has three states, not two:
 *   upcoming        -> "Add to Calendar", linking to the event on Google Calendar
 *   past + recap    -> "View Recap"
 *   past, no recap  -> an inert "Event concluded" block
 *
 * That third state exists because the recap link used to render `href="#"` when
 * `recapUrl` was missing — a link that promised a recap and scrolled to the top
 * of the page. It stays a filled block rather than nothing so cards keep equal
 * heights in the 3-column grid.
 *
 * This is "the box component" — originally built for the Upcoming Events
 * grid and now shared with EventCalendarRail so a day selected on the
 * calendar shows the same full detail rather than a truncated preview.
 */
export const EventCard: React.FC<EventCardProps> = ({
  event,
  today,
  idPrefix = 'event-card-item',
  className = '',
}) => {
  const past = isEventPast(event, today);

  return (
    <div
      id={`${idPrefix}-${event.id}`}
      className={`bg-bg-secondary hover:bg-bg-elevated border border-border-subtle hover:border-accent-primary/20 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-card group ${className}`}
    >
      <div>
        {/* Elevated categorical color bar at top */}
        <div className={`h-1.5 w-full ${categoryAccentClass(event.category)}`} />

        <div className="p-6 relative">
          {/* Floating Date Badge */}
          <div className="absolute top-6 right-6 w-12 h-14 bg-bg-elevated group-hover:bg-bg-secondary border border-border-subtle flex flex-col items-center justify-center rounded-xl p-1 shadow-sm transition-colors select-none">
            <span className="font-sans text-[9px] font-extrabold text-text-muted leading-none uppercase tracking-wide">
              {isoMonthBadge(event.date)}
            </span>
            <span className="font-mono text-[22px] font-black text-text-primary leading-none mt-1">
              {isoDayNumber(event.date)}
            </span>
          </div>

          {/* Category Badge tag — color comes from the accent system, so it
              always agrees with the bar above and the calendar dots. */}
          <span className={`inline-block px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider rounded-md border ${categoryBadgeClass(event.category)}`}>
            {event.category}
          </span>

          {/* Event Title */}
          <h3 className="font-sans text-[18px] font-bold text-text-primary leading-tight mt-5 mb-3 group-hover:text-accent-primary transition-colors max-w-[80%]">
            {event.title}
          </h3>

          {/* Full description — never truncated, unlike the past-strip card */}
          <p className="font-sans text-[13px] text-text-secondary leading-relaxed mb-6">
            {event.description}
          </p>
        </div>
      </div>

      {/* Card metadata footer row */}
      <div className="p-6 pt-0 mt-auto">
        <div className="h-[1px] w-full bg-border-subtle/50 my-4" />

        <div className="flex flex-col space-y-2 text-xs font-sans text-text-muted mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-text-muted hover:text-accent-primary transition-colors" />
            <span>{event.location}</span>
          </div>
        </div>

        {past ? (
          event.recapUrl ? (
            <a
              id={`${idPrefix}-recap-${event.id}`}
              href={event.recapUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full mt-2 py-3 bg-bg-primary hover:bg-accent-primary-dim border border-border-subtle text-text-secondary hover:text-accent-primary text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>View Recap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div
              id={`${idPrefix}-concluded-${event.id}`}
              className="w-full mt-2 py-3 bg-bg-primary border border-border-subtle text-text-muted text-xs font-bold rounded-xl flex items-center justify-center select-none"
            >
              <span>Event Concluded</span>
            </div>
          )
        ) : (
          /* Google's own page for the event, where a visitor can copy it into
             their calendar. Falls back to the club calendar for any event
             without one — a hand-seeded entry, or a snapshot predating the
             field. Never renders a dead href. */
          <a
            id={`${idPrefix}-add-to-calendar-${event.id}`}
            href={event.calendarUrl ?? PUBLIC_CALENDAR_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full mt-2 py-3 bg-accent-primary-dim hover:bg-accent-primary text-accent-primary hover:text-on-accent text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Add to Calendar</span>
          </a>
        )}
      </div>
    </div>
  );
};
