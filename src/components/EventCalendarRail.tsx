import React from 'react';
import { Calendar, ArrowRight, X } from 'lucide-react';
import type { ClubEvent } from '../types';
import { type ISODate, formatFullDate } from '../utils/date';
import { ALL_FILTER, categoryLabel } from '../utils/events';
import { CLUB_DISCORD_URL, NEWSLETTER_URL } from '../data';
import { EventCard } from './EventCard';

interface EventCalendarRailProps {
  /** null means nothing is selected — the rail falls back to "Next up". */
  selectedISO: ISODate | null;
  /** Events on the selected day, already filtered. */
  dayEvents: ClubEvent[];
  /** Shown when nothing is selected. */
  nextUp: ClubEvent | undefined;
  /** False when the club has no events at all, not merely none matching. */
  hasAnyEvents: boolean;
  activeFilter: string;
  today: ISODate;
  onClear: () => void;
  /** Shared with the Upcoming grid so an RSVP in either place shows in both. */
  rsvpStatus: { [key: string]: boolean };
  onRsvp: (eventId: string, e: React.MouseEvent) => void;
}

/**
 * The panel beside the calendar grid.
 *
 * Purely presentational — all state lives in EventCalendar. It has three
 * states, and the *first* is the one that ships today: with `EVENTS` empty,
 * every visitor sees the "nothing scheduled" case, so it gets real CTAs rather
 * than an apology.
 */
export const EventCalendarRail: React.FC<EventCalendarRailProps> = ({
  selectedISO,
  dayEvents,
  nextUp,
  hasAnyEvents,
  activeFilter,
  today,
  onClear,
  rsvpStatus,
  onRsvp,
}) => {
  const heading = selectedISO
    ? formatFullDate(selectedISO)
    : nextUp
      ? formatFullDate(nextUp.date)
      : 'Nothing scheduled';

  const shown = selectedISO ? dayEvents : nextUp ? [nextUp] : [];

  return (
    <aside
      id="event-calendar-rail"
      aria-live="polite"
      className="bg-bg-elevated border border-border-subtle rounded-2xl shadow-card p-6 min-h-[320px] flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <span className="font-sans text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent-secondary block">
            {!hasAnyEvents ? 'No Events Yet' : selectedISO ? 'Selected Day' : 'Next Up'}
          </span>
          <h4 className="font-sans text-[15px] font-bold text-text-primary leading-tight mt-1.5">
            {heading}
          </h4>
        </div>

        {selectedISO && (
          <button
            type="button"
            id="event-calendar-clear-selection"
            onClick={onClear}
            aria-label="Clear the selected day"
            className="w-7 h-7 shrink-0 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-text-muted hover:text-accent-primary hover:border-accent-primary cursor-pointer transition-all active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!hasAnyEvents ? (
        /* The state that actually ships. A visitor who finds nothing scheduled
           should still leave with a way to hear about the next thing. */
        <div className="flex-1 flex flex-col justify-center">
          <p className="font-sans text-[12.5px] text-text-secondary leading-relaxed">
            There's nothing on the calendar right now. General meetings,
            workshops, speaker sessions and socials all get posted here first.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={CLUB_DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 bg-accent-primary-dim hover:bg-accent-primary text-accent-primary hover:text-on-accent text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>Join the Discord</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={NEWSLETTER_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 text-center font-sans text-[11.5px] font-bold text-text-secondary hover:text-accent-primary transition-colors cursor-pointer"
            >
              Or get the newsletter →
            </a>
          </div>
        </div>
      ) : shown.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 animate-fade-in">
          <Calendar className="w-6 h-6 text-text-muted mb-3" />
          <p className="font-sans text-[12.5px] text-text-secondary leading-relaxed max-w-[26ch]">
            {activeFilter === ALL_FILTER
              ? 'Nothing scheduled on this day.'
              : `No ${categoryLabel(activeFilter).toLowerCase()} scheduled on this day.`}
          </p>
        </div>
      ) : (
        // Same box component as the Upcoming grid — full, untruncated
        // description, not a preview that sends the visitor scrolling
        // elsewhere to read the rest.
        <div className="flex flex-col gap-4 animate-fade-in">
          {shown.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              today={today}
              isRsvped={rsvpStatus[event.id]}
              onRsvp={onRsvp}
              idPrefix="event-calendar-rail-card"
            />
          ))}
        </div>
      )}
    </aside>
  );
};
