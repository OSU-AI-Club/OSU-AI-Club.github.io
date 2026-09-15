import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import { useRevealProps } from '../hooks/useReveal';
import speakingEvent from '../../assets/researchexpo_gallery/speaking-event.webp';

interface ResearchExpoTeaserProps {
  onNavigate: (page: string) => void;
}

export const ResearchExpoTeaser: React.FC<ResearchExpoTeaserProps> = ({ onNavigate }) => {
  const headingReveal = useRevealProps();

  return (
    <section
      id="research-expo-teaser-section"
      className="py-24 relative border-b border-border-subtle"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-start w-full">

        <div id="research-expo-promo-headers" className="mb-10 text-left" {...headingReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
            Undergraduate Research
          </span>
          <h2 className="font-display text-[32px] md:text-[48px] font-extrabold text-text-primary tracking-tight">
            Student AI Research, On Stage
          </h2>
        </div>

        {/* Wrapped rather than revealed in place: the card's `hover:scale`
            transform would clobber an in-place reveal. */}
        <Reveal delay={120} className="w-full">
        <div
          id="research-expo-card-wrapper"
          className="w-full relative min-h-[460px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row bg-[linear-gradient(135deg,var(--ui-surface-inverse)_0%,var(--ui-surface-inverse-deep)_100%)] border border-border-inverse transform hover:scale-[1.005] transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-[50%] h-full bg-[radial-gradient(circle_at_20%_20%,var(--ui-accent-tertiary-dim)_0%,transparent_60%)] pointer-events-none" />

          <div className="flex-1 p-8 md:p-14 flex flex-col justify-between items-start z-10 relative">
            <div className="w-full">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-tertiary-on-inverse/15 text-accent-tertiary-on-inverse mb-5 border border-accent-tertiary-on-inverse/20">
                Coming Soon
              </span>

              {/* `text-text-on-inverse`, not `text-on-inverse` — see HackAITeaser. */}
              <h3 className="font-display text-[44px] md:text-[64px] font-extrabold text-text-on-inverse leading-none tracking-tighter mb-4">
                AI Research Expo
              </h3>

              <p className="font-sans text-[15px] md:text-[17px] text-text-on-inverse-muted leading-relaxed max-w-lg mb-8">
                A showcase for student AI research at Ohio State — posters, live demos, and lightning
                talks from club members and from labs across campus.
              </p>
            </div>

            <div className="flex w-full mt-auto">
              <button
                id="teaser-research-expo-cta-btn"
                onClick={() => onNavigate('researchexpo')}
                className="px-8 py-3.5 bg-accent-primary hover:bg-accent-primary-hover text-on-accent text-[14px] font-bold rounded-full shadow-[0_4px_20px_var(--ui-accent-glow)] hover:shadow-[0_6px_28px_var(--ui-accent-glow)] transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2 w-fit cursor-pointer"
              >
                <span>Explore the Expo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="md:w-[42%] h-[220px] md:h-full relative border-t md:border-t-0 md:border-l border-border-inverse overflow-hidden z-10 self-stretch">
            <img
              src={speakingEvent}
              alt="A student presenting at an AI Club speaking event"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

        </div>
        </Reveal>

      </div>
    </section>
  );
};
