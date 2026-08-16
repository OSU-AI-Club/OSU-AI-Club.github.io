import React from 'react';
import { NeuralNetworkCanvas } from '../components/NeuralNetworkCanvas';
import { CanvasErrorBoundary } from '../components/CanvasErrorBoundary';
import { StatsBar } from '../components/StatsBar';
import { MissionStatement } from '../components/MissionStatement';
import { SponsorsBar } from '../components/SponsorsBar';
import { HackAITeaser } from '../components/HackAITeaser';
import { TextScramble } from '../components/TextScramble';
import { MEETING_DAY, MEETING_TIME, MEETING_LOCATION } from '../data';
import { Clock } from 'lucide-react';
import { useRevealSequenceProps, sequenceDelay } from '../hooks/useReveal';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading, copy and buttons
  // each get their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const mobileHeroReveal = useRevealSequenceProps();

  return (
    <div id="homepage-root">
      
      {/* 1. HERO SECTION (Full Viewport with Interactive 3D Backdrop) */}
      <section
        id="hero-section"
        className="h-screen w-full sticky top-0 z-0 flex items-center pt-[72px] overflow-hidden"
      >
        {/* Subtle, beautiful background glow centered behind the network canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none" />

        {/* Full-width 3D Backdrop - pointer events mapped explicitly */}
        <div className="absolute inset-0 w-full h-full z-0">
          <CanvasErrorBoundary>
            <NeuralNetworkCanvas />
          </CanvasErrorBoundary>
        </div>

        {/* Text Content Overlay Layer */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-16 z-10 relative pointer-events-none hidden lg:block">
          {/* Left Block — Text block with active pointer interaction for actions copy, clicks */}
          <div
            id="hero-left-col"
            className="flex flex-col items-start justify-center text-left py-12 lg:py-24 pr-0 lg:pr-8 max-w-lg xl:max-w-xl 2xl:max-w-2xl pointer-events-auto select-none"
            {...heroReveal}
          >
            {/* Campus Eyebrow */}
            <div className="flex items-center space-x-2.5 mb-5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
              <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.18em]">
                The Ohio State University Presents The
              </span>
            </div>

            {/* Title stacked */}
            <h1
              id="hero-heading"
              /* Only the lg+ steps ever render — this block is `hidden lg:block`.
                 72px was the single size for everything above 1024px, which is
                 what crowded the canvas on smaller laptops.

                 `min-h-[2.16em]` reserves exactly two lines (2 x the 1.08
                 line-height) at every breakpoint, since `em` tracks the heading's
                 own font-size. The title wraps to two lines once decoded, so
                 without the floor the entire hero column — copy, meeting line,
                 buttons — shifts down as the scramble resolves. */
              className="font-display text-[42px] lg:text-[52px] xl:text-[62px] 2xl:text-[72px] font-extrabold text-text-primary leading-[1.08] tracking-tight mb-6 lg:min-h-[2.16em]"
            >
              <TextScramble id="hero-title-scramble-1" text="Artificial Intelligence Club" delay={sequenceDelay(1)} className="block text-text-primary" />
            </h1>

            {/* Subtext description */}
            <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed max-w-md mb-8">
              Building the next generation of AI researchers, engineers, and innovators
            </p>

            {/* Weekly Meetings Highlight Text */}
            <p className="font-sans text-[13.5px] text-text-secondary flex items-center justify-center gap-1.5 flex-wrap mb-12 select-none">
              <Clock className="w-4 h-4 text-accent-primary shrink-0" />
              <span>General Meetings every</span>
              <span className="font-bold text-text-primary whitespace-nowrap">{MEETING_DAY} at {MEETING_TIME}</span>
              <span>in</span>
              <span className="font-semibold text-text-primary whitespace-nowrap">{MEETING_LOCATION}</span>
            </p>

            {/* Two Pill buttons matching specified references */}
            <div id="hero-ctas-row" className="flex flex-wrap items-center gap-4">
              <button
                id="hero-primary-cta"
                onClick={() => onNavigate('projects')}
                className="h-[52px] px-8 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[15px] font-semibold rounded-full flex items-center space-x-2 shadow-[0_4px_20px_var(--ui-accent-glow)] hover:shadow-[0_8px_32px_var(--ui-accent-glow)] transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span>Explore Projects</span>
                <span className="text-[18px] leading-none mb-0.5">›</span>
              </button>

              <button
                id="hero-secondary-cta"
                onClick={() => onNavigate('about')}
                className="h-[52px] px-8 bg-transparent hover:bg-accent-primary-dim border border-accent-primary text-accent-primary hover:border-accent-primary-hover font-sans text-[15px] font-semibold rounded-full flex items-center space-x-2 transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <span>Learn More</span>
                <span className="text-[18px] leading-none mb-0.5">›</span>
              </button>
            </div>

            {/* Hanging animated down chevron scroll indicator */}
            <div className="mt-14 lg:mt-20 flex flex-col items-start select-none">
              <svg
                className="w-5 h-5 text-text-muted animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 2-8. OVERLAPPING CONTENT WRAPPER

          This one keeps an opaque `bg-bg-primary` on purpose — it slides up over
          the sticky three.js hero and has to occlude it. So instead of letting
          the site-wide mesh show through, it paints its own opaque copy:
          `bg-bg-primary` sets background-color and the mesh sets
          background-image, so both classes apply without conflict. The column
          variant is tuned to this wrapper's height and reads as a vertical
          journey (blue -> green -> purple -> blue) rather than a flat slab. */}
      <div className="relative z-10 bg-bg-primary bg-[image:var(--ui-page-mesh-column)] shadow-[0_-15px_30px_var(--ui-shadow-color)] border-t border-border-subtle">
        {/* Mobile/Tablet Hero Title Card - Displays at the top of the flowing content card wrapper, sliding gracefully up over the full 3D interactive backdrop */}
        <div className="block lg:hidden w-full max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24 border-b border-border-subtle">
          <div className="flex flex-col items-start justify-center text-left max-w-2xl select-none" {...mobileHeroReveal}>
            {/* Campus Eyebrow */}
            <div className="flex items-center space-x-2.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
              <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.18em]">
                The Ohio State University
              </span>
            </div>

            {/* Title stacked */}
            <h1 className="font-display text-[38px] md:text-[56px] font-extrabold text-text-primary leading-[1.12] tracking-tight mb-5">
              <TextScramble id="hero-mobile-title-scramble-1" text="Artificial Intelligence" delay={sequenceDelay(1)} className="block text-text-primary" />
              <TextScramble id="hero-mobile-title-scramble-2" text="Club at Ohio State" delay={sequenceDelay(1) + 500} className="block text-text-primary mt-1" />
            </h1>

            {/* Subtext description */}
            <p className="font-sans text-[15px] md:text-[17px] text-text-secondary leading-relaxed max-w-md mb-8">
              Building the next generation of AI researchers, engineers, and innovators
            </p>

             {/* Two Pill buttons matching specified references */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('projects')}
                className="h-[48px] px-6 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[14px] font-semibold rounded-full flex items-center space-x-2 shadow-[0_4px_20px_var(--ui-accent-glow)] transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-none"
              >
                <span>Explore Projects</span>
                <span className="text-[16px] leading-none mb-0.5">›</span>
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="h-[48px] px-6 bg-transparent hover:bg-accent-primary-dim border border-accent-primary text-accent-primary hover:border-accent-primary-hover font-sans text-[14px] font-semibold rounded-full flex items-center space-x-2 transform hover:-translate-y-0.5 transition-all duration-250 cursor-pointer"
              >
                <span>Learn More</span>
                <span className="text-[16px] leading-none mb-0.5">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. STATS BAR */}
        <StatsBar />

      {/* 3. MISSION STATEMENT */}
      <MissionStatement />

      {/* 5. SPONSORS BAR */}
      <SponsorsBar />


      {/* 8. HACKAI TEASER PROMO BLOCK */}
      <HackAITeaser onNavigate={onNavigate} />
      </div>

    </div>
  );
};
