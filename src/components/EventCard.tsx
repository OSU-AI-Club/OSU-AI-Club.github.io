import React from 'react';
import { MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import type { ClubEvent } from '../types';
import { type ISODate, isoDayNumber, isoMonthBadge } from '../utils/date';
import { categoryAccentClass, isEventPast } from '../utils/events';

interface EventCardProps {
  event: ClubEvent;
  /** Threaded down rather than read here — see the single todayISO() call in Events.tsx. */
  today: ISODate;
  /** Ignored once the event is past — the footer switches to a recap link instead. */
  isRsvped?: boolean;
  onRsvp?: (eventId: string, e: React.MouseEvent) => void;
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
 * complete (untruncated) description, metadata footer, and an RSVP button
 * that becomes a recap link once the event is past.
 *
 * This is "the box component" — originally built for the Upcoming Events
 * grid and now shared with EventCalendarRail so a day selected on the
 * calendar shows the same full detail rather than a truncated preview.
 */
export const EventCard: React.FC<EventCardProps> = ({
  event,
  today,
  isRsvped,
  onRsvp,
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

          {/* Category Badge tag */}
          <span className={`inline-block px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider rounded-md border ${
            event.category === 'Workshop'
              ? 'bg-accent-primary-dim text-accent-primary border-accent-primary/10'
              : 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/15'
          }`}>
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
          <a
            id={`${idPrefix}-recap-${event.id}`}
            href={event.recapUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="w-full mt-2 py-3 bg-bg-primary hover:bg-accent-primary-dim border border-border-subtle text-text-secondary hover:text-accent-primary text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>View Recap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : isRsvped ? (
          <div id={`${idPrefix}-rsvp-success-${event.id}`} className="mt-2 py-2 w-full bg-accent-secondary/15 border border-accent-secondary/20 text-accent-secondary text-xs rounded-xl font-bold flex items-center justify-center space-x-1.5 select-none animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>RSVP SECURED</span>
          </div>
        ) : (
          <button
            type="button"
            id={`${idPrefix}-rsvp-action-${event.id}`}
            onClick={(e) => onRsvp?.(event.id, e)}
            className="w-full mt-2 py-3 bg-accent-primary-dim hover:bg-accent-primary text-accent-primary hover:text-on-accent text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <span>Confirm Attendance RSVP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
