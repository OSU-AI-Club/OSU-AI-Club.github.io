import React from 'react';
import { Cpu, Eye, MessageSquare, HardDrive, BrainCircuit, Flag, Network } from 'lucide-react';
import { Reveal } from './Reveal';
import { useRevealProps, staggerDelay } from '../hooks/useReveal';

interface AboutSectionProps {
  onNavigate: (page: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate }) => {
  // In-place props, not <Reveal>: these two are `lg:col-span-*` children of the
  // 12-col grid and must stay direct children of it.
  const infoReveal = useRevealProps();

  const categories = [
    { label: 'Machine Learning', icon: <Cpu className="w-10 h-10 text-accent-secondary" /> },
    { label: 'Computer Vision', icon: <Eye className="w-10 h-10 text-accent-secondary" /> },
    { label: 'Natural Language', icon: <MessageSquare className="w-10 h-10 text-accent-secondary" /> },
    { label: 'Robotics & Control', icon: <HardDrive className="w-10 h-10 text-accent-secondary" /> },
  ];

  return (
    <section
      id="about-teaser-section"
      className="py-24 relative border-b border-border-subtle"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side (55%) */}
        <div id="about-teaser-info" className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-8" {...infoReveal}>
          
          {/* Eyebrow with preceding marker line */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-[2px] bg-accent-secondary rounded-full" />
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em]">
              Who We Are
            </span>
          </div>

          <h2 className="font-display text-[32px] md:text-[46px] font-extrabold text-text-primary leading-[1.12] tracking-tight mb-6">
            Pushing the Frontier of AI at OSU
          </h2>

          <p className="font-sans text-[15px] md:text-[16px] text-text-secondary leading-relaxed mb-8">
            We are a student-run community of builders, researchers, and competitors at The Ohio State University.
            Whether you are a first-year curious about neural networks or a PhD candidate publishing in NeurIPS,
            there is a place for you here. We help bridge the gap between academic theory and deployment.
          </p>

          {/* Feature badges row */}
          <div id="about-teaser-features" className="flex flex-wrap gap-4 mt-2 mb-8 w-full">
            {[
              { text: 'Research', icon: <BrainCircuit className="w-4 h-4 text-accent-secondary" /> },
              { text: 'Competition', icon: <Flag className="w-4 h-4 text-accent-secondary" /> },
              { text: 'Networking', icon: <Network className="w-4 h-4 text-accent-secondary" /> },
            ].map((p, idx) => (
              <div
                key={idx}
                id={`teaser-feature-pill-${idx}`}
                className="bg-bg-elevated/80 border border-border-subtle px-5 py-3 rounded-full flex items-center space-x-2.5 shadow-[0_2px_8px_var(--ui-shadow-color)] hover:border-accent-primary/20 transition-all duration-200"
              >
                {p.icon}
                <span className="font-sans text-[13px] font-bold text-text-primary tracking-wide">
                  {p.text}
                </span>
              </div>
            ))}
          </div>

          <button
            id="meet-team-action-link"
            onClick={() => {
              onNavigate('about');
            }}
            className="group inline-flex items-center space-x-1.5 font-sans text-[14px] font-bold text-accent-primary hover:text-accent-primary-hover transition-colors cursor-pointer mt-2"
          >
            <span>Meet the Full Team</span>
            <span className="transform group-hover:translate-x-1 transition-transform duration-200 text-lg">→</span>
          </button>
        </div>

        {/* Right Side 2x2 grid (45%) */}
        <div id="about-teaser-grid" className="lg:col-span-5 grid grid-cols-2 gap-4 w-full">
          {categories.map((cat, idx) => (
            // Wrapped rather than revealed in place: the tile carries
            // `transform hover:-translate-y-1`, which an in-place reveal would override.
            <Reveal key={idx} delay={staggerDelay(idx)}>
            <div
              id={`teaser-category-card-${idx}`}
              className="h-[180px] p-6 bg-bg-secondary hover:bg-bg-elevated border border-border-subtle hover:border-accent-secondary/35 rounded-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-card group"
            >
              <div className="p-3 bg-bg-elevated group-hover:bg-bg-secondary w-fit rounded-xl shadow-[0_2px_8px_var(--ui-shadow-color)] transition-colors">
                {cat.icon}
              </div>
              <span className="font-sans text-[13px] font-bold text-text-primary uppercase tracking-wider mb-1 block">
                {cat.label}
              </span>
            </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};
