import React from 'react';
import { TextScramble } from '../components/TextScramble';
import { UnderConstruction } from '../components/UnderConstruction';
import { useRevealSequenceProps, sequenceDelay } from '../hooks/useReveal';

export const ResearchExpo: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading and copy each get
  // their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();

  return (
    <div id="research-expo-page-root" className="pt-[72px] min-h-screen select-none">

      {/* 1. HERO HEADER INTRO
          Green accent glow rather than blue: the page mesh already puts a blue
          lobe in this corner. Same reasoning as the Events hero. */}
      <section id="research-expo-hero-banner" className="py-20 md:py-24 bg-[linear-gradient(to_bottom,var(--ui-veil-band),rgba(0,0,0,0))] border-b border-border-subtle relative overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10 flex flex-col items-center">
          <div className="max-w-3xl text-center" {...heroReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Undergraduate Research
            </span>
            <h1 className="font-display text-[38px] md:text-[54px] font-extrabold text-text-primary tracking-tight leading-[1.1]">
              <TextScramble id="research-expo-title-scramble" text="AI Research Expo" delay={sequenceDelay(1)} />
            </h1>
            <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
              A showcase for student AI research at Ohio State — posters, live demos, and lightning
              talks from club members and from labs across campus.
            </p>
          </div>
        </div>
      </section>

      {/* 2. UNDER CONSTRUCTION NOTICE
          No dates, venue or submission deadline are published here on purpose —
          nothing is confirmed yet, and a placeholder date is worse than none. */}
      <UnderConstruction
        id="research-expo-under-construction"
        blurb="Dates, venue, and the call for submissions are still being finalized. Email us if you'd like to present, help organize, or hear as soon as the schedule is set."
      />

    </div>
  );
};
