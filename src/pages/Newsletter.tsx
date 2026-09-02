import React from 'react';
import { NEWSLETTER_URL } from '../data';
import { TextScramble } from '../components/TextScramble';
import { UnderConstruction } from '../components/UnderConstruction';
import { useRevealSequenceProps, sequenceDelay } from '../hooks/useReveal';

export const Newsletter: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading and copy each get
  // their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();

  return (
    <div id="newsletter-page-root" className="pt-[72px] min-h-screen select-none">

      {/* 1. HERO HEADER INTRO */}
      <section id="newsletter-hero-banner" className="py-20 md:py-24 bg-[linear-gradient(to_bottom,var(--ui-veil-band),rgba(0,0,0,0))] border-b border-border-subtle relative overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10 flex flex-col items-center">
          <div className="max-w-3xl text-center" {...heroReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Straight to Your Inbox
            </span>
            <h1 className="font-display text-[38px] md:text-[54px] font-extrabold text-text-primary tracking-tight leading-[1.1]">
              <TextScramble id="newsletter-title-scramble" text="The AI Club Newsletter" delay={sequenceDelay(1)} />
            </h1>
            <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
              Meeting recaps, speaker announcements, project-team openings, and opportunities from
              across the Ohio State AI community — collected and sent out to members.
            </p>
          </div>
        </div>
      </section>

      {/* 2. UNDER CONSTRUCTION NOTICE
          The signup link is live, so it stands in as this page's CTA until the
          archive and issue listing are built. */}
      <UnderConstruction
        id="newsletter-under-construction"
        blurb="We're building out the issue archive and a proper signup flow here. In the meantime, the subscription list is already open — put your email on it and you won't miss anything."
        ctaHref={NEWSLETTER_URL}
        ctaLabel="Subscribe to the newsletter"
      />

    </div>
  );
};
