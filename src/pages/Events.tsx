import React, { useMemo, useState } from 'react';
import { EVENTS, EVENTS_SYNCED_AT, EVENT_CATEGORIES } from '../data/events';
import { Clock, CalendarPlus } from 'lucide-react';
import { TextScramble } from '../components/TextScramble';
import { Reveal } from '../components/Reveal';
import { EventCalendar } from '../components/EventCalendar';
import { EventCard } from '../components/EventCard';
import { useRevealProps, useRevealSequenceProps, sequenceDelay, staggerDelay } from '../hooks/useReveal';
import { formatLongDate, formatSyncStamp, todayISO } from '../utils/date';
import {
  ALL_FILTER,
  byDateAsc,
  byDateDesc,
  categoryLabel,
  isEventPast,
  matchesFilter,
} from '../utils/events';
import {
  MEETING_LOCATION,
  MEETING_DAY,
  MEETING_TIME,
  CLUB_DISCORD_URL,
  NEWSLETTER_URL,
  PUBLIC_CALENDAR_URL
} from '../data';

export const Events: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading, copy and buttons
  // each get their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const calendarHeaderReveal = useRevealProps();
  const calendarModuleReveal = useRevealProps();
  const upcomingHeaderReveal = useRevealProps();
  const pastHeaderReveal = useRevealProps();
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);

  /**
   * Resolved once per mount and threaded everywhere "past" is decided, so the
   * whole page agrees on today even if a render straddles midnight — and so the
   * calendar's memos aren't invalidated by a fresh string every render.
   */
  const today = useMemo(() => todayISO(), []);

  // The 'All' pill isn't a category, so it's prepended rather than stored in
  // EVENT_CATEGORIES.
  const filters = [ALL_FILTER, ...EVENT_CATEGORIES.map((c) => c.id)];

  const upcomingEvents = useMemo(
    () => EVENTS.filter((e) => !isEventPast(e, today)).sort(byDateAsc),
    [today],
  );

  // Past events honour the category pills too, so the calendar and the recap
  // strip never disagree about what's visible. Sorted most-recent-first —
  // "highlights" means the events that just happened, not the oldest ones.
  const pastEvents = useMemo(
    () => EVENTS.filter((e) => isEventPast(e, today) && matchesFilter(e, activeFilter)).sort(byDateDesc),
    [today, activeFilter],
  );

  // Both lists cap at 3 — a spotlight, not a full archive. The calendar above
  // is the browse-everything view; these sections point at what's next / what
  // just happened.
  const MAX_LISTED = 3;
  const filteredUpcoming = upcomingEvents.filter((e) => matchesFilter(e, activeFilter));
  const visibleUpcoming = filteredUpcoming.slice(0, MAX_LISTED);
  const visiblePast = pastEvents.slice(0, MAX_LISTED);

  return (
    <div id="events-page-root" className="pt-[72px] min-h-screen">
      
      {/* 1. EVENTS HERO & FILTER BAR */}
      <section
        id="events-hero-header"
        className="py-16 md:py-24 border-b border-border-subtle relative flex flex-col items-center justify-center text-center overflow-hidden"
      >
        {/* Green, not blue: the page mesh already puts a blue lobe at this exact
            corner, so a blue glow here just doubled up. See docs/styling.md. */}
        <div className="absolute right-0 top-0 w-[40%] h-full bg-[radial-gradient(circle_at_80%_20%,var(--ui-accent-secondary-dim)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center" {...heroReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.25em] block mb-4">
            Get Involved
          </span>
          <h1 className="font-display text-[44px] md:text-[64px] font-extrabold text-text-primary leading-none tracking-tight mb-5 animate-fade-in">
            <TextScramble id="events-title-scramble" text="Club Events" delay={sequenceDelay(1)} />
          </h1>
          <p className="font-sans text-[15px] md:text-[17px] text-text-secondary leading-relaxed max-w-xl mb-8">
            Workshops, speaker sessions, regional hackathons, and social mixers — explore our academic calendar and add what you like to your own.
          </p>

          {/* Weekly Meetings Highlight Text */}
          <p className="font-sans text-[13.5px] text-text-secondary flex items-center justify-center gap-1.5 flex-wrap mb-12 select-none">
            <Clock className="w-4 h-4 text-accent-primary shrink-0" />
            <span>General Meetings every</span>
            <span className="font-bold text-text-primary whitespace-nowrap">{MEETING_DAY} at {MEETING_TIME}</span>
            <span>in</span>
            <span className="font-semibold text-text-primary whitespace-nowrap">{MEETING_LOCATION}</span>
          </p>

          {/* Filter Row */}
          <div id="events-filter-row" className="flex flex-wrap items-center justify-center gap-2.5 max-w-full">
            {filters.map((filter) => {
              const isActive = activeFilter.toLowerCase() === filter.toLowerCase();
              return (
                <button
                  key={filter}
                  id={`events-filter-${filter}`}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-full font-sans text-xs font-bold tracking-wide transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-accent-primary text-on-accent border-accent-primary shadow-[0_4px_12px_var(--ui-accent-glow)]'
                      : 'bg-bg-elevated text-text-secondary hover:text-accent-primary border-border-subtle shadow-sm hover:scale-[1.01]'
                  }`}
                >
                  {filter === ALL_FILTER ? 'All Events' : categoryLabel(filter)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE MONTH CALENDAR */}
      <section id="events-calendar-section" className="py-20 bg-veil-band border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 md:px-16">

          <div className="flex items-center space-x-3 mb-10" {...calendarHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] select-none">
              Browse By Date
            </span>
            <div className="flex-1 h-[1px] bg-border-subtle" />
            {/* Subscribing beats checking back: the visitor's own calendar then
                updates with ours, no return visit required. */}
            <a
              id="events-subscribe-calendar"
              href={PUBLIC_CALENDAR_URL}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-bg-elevated border border-border-subtle text-text-secondary hover:text-accent-primary hover:border-accent-primary/40 font-sans text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-sm"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Subscribe</span>
            </a>
          </div>

          {/* The whole module reveals as one unit rather than per-cell. Note the
              reveal transform applies to this element only, so the day cells'
              hover:scale still works — just don't add a hover transform here. */}
          <div {...calendarModuleReveal}>
            <EventCalendar
              events={EVENTS}
              activeFilter={activeFilter}
              today={today}
            />

            {/* The cheapest diagnostic on the page. An officer who added an
                event and doesn't see it can tell "the sync is stale" from "I
                forgot to hit save" without opening the Actions tab. */}
            <p className="mt-5 text-center font-sans text-[11.5px] text-text-muted select-none">
              Subscribe for up-to-date events on our {' '}
              <a
                href={PUBLIC_CALENDAR_URL}
                target="_blank"
                rel="noreferrer"
                className="text-accent-primary font-semibold hover:underline"
              >
                Google Calendar
              </a>
              {formatSyncStamp(EVENTS_SYNCED_AT) && ` · ${formatSyncStamp(EVENTS_SYNCED_AT)}`}
            </p>
          </div>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS GRID */}
      <section id="upcoming-events-grid-section" className="py-20 max-w-7xl mx-auto px-6 md:px-16">
        
        <div className="flex items-center space-x-3 mb-10 select-none" {...upcomingHeaderReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em]">
            Upcoming Calendar
          </span>
          <div className="flex-1 h-[1px] bg-border-subtle" />
        </div>

        {filteredUpcoming.length === 0 ? (
          <div id="no-events-fallback" className="py-20 text-center bg-bg-secondary/40 rounded-3xl border border-dashed border-border-medium/60 max-w-lg mx-auto p-8 flex flex-col items-center">
            <span className="text-3xl mb-3">📅</span>
            <h3 className="font-sans font-bold text-text-primary text-[15px] uppercase tracking-wide">No Scheduled Events</h3>
            {/* Two different situations: nothing is scheduled at all, or nothing
                matches the active filter. Blaming the filter in the first case
                sends people toggling pills that were never the problem. */}
            <p className="font-sans text-xs text-text-secondary leading-relaxed mt-2 text-center max-w-xs">
              {upcomingEvents.length === 0 ? (
                <>
                  Nothing is on the schedule just yet. Follow us on{' '}
                  <a href={CLUB_DISCORD_URL} target="_blank" rel="noreferrer" className="text-accent-primary font-bold hover:underline">Discord</a>
                  {' '}or join the{' '}
                  <a href={NEWSLETTER_URL} target="_blank" rel="noreferrer" className="text-accent-primary font-bold hover:underline">newsletter</a>
                  {' '}to hear about the next one first.
                </>
              ) : (
                <>There are no upcoming {categoryLabel(activeFilter).toLowerCase()} on the calendar. Try toggling back to general event categories.</>
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleUpcoming.map((item, idx) => (
              <Reveal key={item.id} delay={staggerDelay(idx)}>
                <EventCard event={item} today={today} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* 4. PAST EVENTS STRIP */}
      <section id="past-events-stripe-section" className="py-20 bg-veil-band border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 md:px-16">

          <div className="flex items-center space-x-3 mb-10 select-none" {...pastHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-text-muted uppercase tracking-[0.2em]">
              Past Events Highlights
            </span>
            <div className="flex-1 h-[1px] bg-border-subtle" />
          </div>

          {pastEvents.length === 0 ? (
            /* Without this the heading above sits over an empty scroll track. */
            <div id="no-past-events-fallback" className="py-16 text-center bg-bg-secondary/40 rounded-3xl border border-dashed border-border-medium/60 max-w-lg mx-auto p-8 flex flex-col items-center">
              <span className="text-3xl mb-3">🗂️</span>
              <h3 className="font-sans font-bold text-text-primary text-[15px] uppercase tracking-wide">No Recaps Yet</h3>
              <p className="font-sans text-xs text-text-secondary leading-relaxed mt-2 text-center max-w-xs">
                {EVENTS.length === 0
                  ? 'Once events have wrapped, their recaps and photo galleries land here.'
                  : `No past ${categoryLabel(activeFilter).toLowerCase()} to show. Try another category.`}
              </p>
            </div>
          ) : (
          /* Horizontal drag stripe list */
          <div
            id="past-events-strip-track"
            className="flex space-x-6 overflow-x-auto pb-4 snap-x pr-4 scrollbar-thin"
            style={{ scrollbarWidth: 'none' }}
          >
            {visiblePast.map((item, idx) => (
              <Reveal key={item.id} delay={staggerDelay(idx)} className="flex-shrink-0">
              <div
                id={`past-event-stip-card-${item.id}`}
                className="w-[280px] bg-bg-secondary border border-border-subtle rounded-xl p-5 flex-shrink-0 snap-start flex flex-col justify-between h-[230px] opacity-72 hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-bg-primary border border-border-subtle text-[8.5px] text-text-muted uppercase font-bold rounded">
                      {item.category}
                    </span>
                    <span className="font-mono text-xs text-text-muted font-semibold">
                      {formatLongDate(item.date)}
                    </span>
                  </div>

                  <h4 className="font-sans text-[14px] font-bold text-text-primary leading-tight mt-4 line-clamp-2">
                    {item.title}
                  </h4>
                  
                  <p className="font-sans text-[12px] text-text-secondary leading-relaxed mt-2 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Only when a recap actually exists — this used to render
                    href="#", promising a recap and scrolling to the top. */}
                <div className="pt-4 mt-auto border-t border-border-subtle/50 flex justify-end">
                  {item.recapUrl ? (
                    <a
                      href={item.recapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent-primary text-xs font-bold hover:underline inline-flex items-center space-x-1"
                    >
                      <span>View Recap</span>
                      <span>→</span>
                    </a>
                  ) : (
                    <span className="text-text-muted text-xs font-bold select-none">Recap coming soon</span>
                  )}
                </div>
              </div>
              </Reveal>
            ))}
          </div>
          )}

        </div>
      </section>

    </div>
  );
};
