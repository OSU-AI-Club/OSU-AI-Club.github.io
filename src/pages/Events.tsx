import React from 'react';
import { Clock } from 'lucide-react';
import { TextScramble } from '../components/TextScramble';
import { useRevealProps, useRevealSequenceProps, sequenceDelay } from '../hooks/useReveal';
import {
  MEETING_LOCATION,
  MEETING_DAY,
  MEETING_TIME,
  GOOGLE_CALENDAR_EMBED_URL
} from '../data';

export const Events: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading and copy each get
  // their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const calendarModuleReveal = useRevealProps();

  return (
    <div id="events-page-root" className="pt-[72px] min-h-screen">

      {/* 1. EVENTS HERO */}
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
          <p className="font-sans text-[13.5px] text-text-secondary flex items-center justify-center gap-1.5 flex-wrap select-none">
            <Clock className="w-4 h-4 text-accent-primary shrink-0" />
            <span>General Meetings every</span>
            <span className="font-bold text-text-primary whitespace-nowrap">{MEETING_DAY} at {MEETING_TIME}</span>
            <span>in</span>
            <span className="font-semibold text-text-primary whitespace-nowrap">{MEETING_LOCATION}</span>
          </p>
        </div>
      </section>

      {/* 2. GOOGLE CALENDAR EMBED
          Google serves this live, so the page is always current with no build
          step and no API key. The white frame is deliberate: Google's embed
          renders light-only and has no dark-mode parameter, so rather than
          filter-hacking it into the dark theme we present it as an intentional
          light panel that reads the same in both. */}
      <section id="events-calendar-section" className="py-20 bg-veil-band">
        <div className="max-w-5xl mx-auto px-6" {...calendarModuleReveal}>
          <div className="bg-white rounded-2xl shadow-card border border-border-subtle p-2 md:p-3 overflow-hidden">
            <iframe
              id="events-google-calendar-embed"
              title="AIC Public Calendar"
              src={GOOGLE_CALENDAR_EMBED_URL}
              loading="lazy"
              className="w-full h-[560px] md:h-[700px] border-0 rounded-xl block"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
