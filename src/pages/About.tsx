import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { OFFICERS } from '../data';
import { Officer } from '../types';
import { Linkedin, Github, Twitter, Instagram, Globe, X, Sparkles, Trophy, Award } from 'lucide-react';
import { AboutSection } from '../components/AboutSection';
import { AboutGallery } from '../components/AboutGallery';
import { FAQ } from '../components/FAQ';
import { TextScramble } from '../components/TextScramble';
import { Reveal } from '../components/Reveal';
import { useRevealProps, useRevealSequenceProps, sequenceDelay, staggerDelay } from '../hooks/useReveal';

interface AboutProps {
  onNavigate?: (page: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading, copy and buttons
  // each get their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const officersHeaderReveal = useRevealProps();
  const [expandedOfficer, setExpandedOfficer] = useState<Officer | null>(null);
  const [animState, setAnimState] = useState<'idle' | 'starting' | 'active' | 'closing'>('idle');
  const [initialRect, setInitialRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape key to close flipped card & handle body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && animState === 'active') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (animState !== 'idle') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [animState]);

  const handleCardClick = (officer: Officer, id: string) => {
    if (animState !== 'idle') return;

    const cardEl = cardsRef.current[id];
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      setInitialRect(rect);
      setExpandedOfficer(officer);
      setAnimState('starting');

      setTimeout(() => {
        setAnimState('active');
      }, 30);
    }
  };

  const handleClose = () => {
    if (animState !== 'active') return;

    setAnimState('closing');

    setTimeout(() => {
      setExpandedOfficer(null);
      setInitialRect(null);
      setAnimState('idle');
    }, 600);
  };

  const renderExpandedOfficer = () => {
    if (!mounted || !expandedOfficer || !initialRect) return null;

    return createPortal(
      <>
        {/* Backdrop for flipped card focus */}
        <AnimatePresence mode="wait">
          {animState !== 'idle' && (
            <motion.div
              id="officer-flip-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleClose}
              className="fixed inset-0 bg-overlay backdrop-blur-sm z-[100] cursor-pointer"
            />
          )}
        </AnimatePresence>

        {/* Floating Centered Expanded Card */}
        <div
          className="card-container is-active"
          id="officer-card-container-expanded"
          style={{
            position: 'fixed',
            width: animState === 'active' ? 'max(300px, min(500px, 92vw))' : `${initialRect.width}px`,
            height: animState === 'active' ? '450px' : `${initialRect.height}px`,
            top: animState === 'active' ? '50%' : `${initialRect.top}px`,
            left: animState === 'active' ? '50%' : `${initialRect.left}px`,
            transform: animState === 'active' ? 'translate(-50%, -50%)' : 'translate(0, 0)',
            transition: animState === 'starting' 
              ? 'none' 
              : 'width 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1), top 600ms cubic-bezier(0.4, 0, 0.2, 1), left 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 110,
            perspective: '1000px',
            cursor: 'default',
          }}
        >
          <div
            className="card-inner"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: animState === 'active' ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* FRONT FACE */}
            <div
              className="card-front"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                top: 0,
                left: 0,
                overflow: 'hidden',
              }}
            >
              <div className="w-full h-full rounded-2xl bg-bg-elevated border border-border-subtle shadow-card flex flex-col justify-between overflow-hidden">
                {/* Image at Top */}
                <div className="w-full h-[280px] overflow-hidden relative border-b border-border-subtle/50 bg-bg-secondary flex items-center justify-center shrink-0">
                  {expandedOfficer.photo ? (
                    <img
                      src={expandedOfficer.photo}
                      alt={expandedOfficer.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-accent-primary font-display font-black text-2xl">
                      {expandedOfficer.initials}
                    </div>
                  )}
                  {/* Academic Year Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-overlay backdrop-blur-md rounded-full text-[8px] font-bold text-accent-secondary tracking-widest uppercase border border-border-subtle/10">
                    {expandedOfficer.year}
                  </div>
                </div>

                {/* Content immediately below */}
                <div className="p-3 text-left flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans text-[15px] font-bold text-text-primary leading-tight">
                      {expandedOfficer.name}
                    </h3>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-accent-secondary mt-0.5">
                      {expandedOfficer.role}
                    </p>
                  </div>
                  
                  <div className="border-t border-border-subtle/30 pt-1.5 flex flex-col gap-0.5">
                    <p className="font-sans text-[10px] text-text-secondary line-clamp-1">
                      <span className="font-bold text-text-primary">Major: </span>{expandedOfficer.major}
                    </p>
                    {expandedOfficer.minor && (
                      <p className="font-sans text-[10px] text-text-secondary line-clamp-1 font-medium bg-accent-secondary/5 px-1.5 py-0.5 rounded">
                        <span className="font-bold text-text-primary">Minor: </span>{expandedOfficer.minor}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div
              className="card-back"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                top: 0,
                left: 0,
                overflow: 'hidden',
              }}
            >
              <div className="w-full h-full p-5 md:p-6 flex flex-col justify-between bg-bg-elevated rounded-2xl border border-border-subtle shadow-2xl relative overflow-hidden">
                {/* Close Button top-right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-text-secondary hover:text-accent-primary hover:border-accent-primary cursor-pointer transition-all active:scale-95 z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Top row: Portrait photo and basic details */}
                <div className="flex items-center gap-4 mt-1 row-top-profile shrink-0">
                  {expandedOfficer.photo ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-border-subtle shrink-0">
                      <img
                        src={expandedOfficer.photo}
                        alt={expandedOfficer.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-bg-secondary flex items-center justify-center text-accent-primary font-display font-bold text-lg shrink-0 border border-border-subtle">
                      {expandedOfficer.initials}
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-lg font-bold text-text-primary leading-tight">
                      {expandedOfficer.name}
                    </h3>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-accent-secondary mt-0.5">
                      {expandedOfficer.role}
                    </p>
                    <div className="flex flex-col text-[10px] text-text-secondary mt-1 gap-1">
                      <span><span className="font-semibold text-text-primary">Major:</span> {expandedOfficer.major}</span>
                      {expandedOfficer.minor && (
                        <span>
                          <span className="font-semibold text-text-primary">Minor:</span>{' '}
                          <span>
                            {expandedOfficer.minor}
                          </span>
                        </span>
                      )}
                      <span><span className="font-semibold text-text-primary">Standing:</span> {expandedOfficer.year}</span>
                    </div>
                  </div>
                </div>

                {/* Biography paragraph with scrolling */}
                <div className="my-3 text-left flex-grow overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                  <span className="font-sans text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">
                    Biography
                  </span>
                  <p className="font-sans text-[12.5px] leading-[1.6] text-text-secondary">
                    {expandedOfficer.bio}
                  </p>
                </div>

                {/* Social and OSU indicator row at bottom */}
                <div className="flex items-center justify-between border-t border-border-subtle/40 pt-3 shrink-0">
                  <div className="flex items-center gap-2">
                    {expandedOfficer.socials.linkedin && (
                      <a
                        href={expandedOfficer.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-accent-primary-dim hover:text-accent-primary flex items-center justify-center text-text-secondary transition-all"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {expandedOfficer.socials.github && (
                      <a
                        href={expandedOfficer.socials.github}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-accent-primary-dim hover:text-accent-primary flex items-center justify-center text-text-secondary transition-all"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {expandedOfficer.socials.twitter && (
                      <a
                        href={expandedOfficer.socials.twitter}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-accent-primary-dim hover:text-accent-primary flex items-center justify-center text-text-secondary transition-all"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {expandedOfficer.socials.instagram && (
                      <a
                        href={expandedOfficer.socials.instagram}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-accent-primary-dim hover:text-accent-primary flex items-center justify-center text-text-secondary transition-all"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {expandedOfficer.socials.website && (
                      <a
                        href={expandedOfficer.socials.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-accent-primary-dim hover:text-accent-primary flex items-center justify-center text-text-secondary transition-all"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[9px] font-mono text-accent-secondary bg-accent-secondary/10 px-2.5 py-1 rounded-full font-bold uppercase transition-colors">
                    <span>OSU Lead</span>
                    <span className="w-1 h-1 rounded-full bg-accent-secondary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <div id="about-page-root" className="pt-[72px] min-h-screen">
      
      {/* 1. ABOUT HERO */}
      {/* `flex-col`, not the previous `items-center justify-center`: those centre
          a single child, and the heading / gallery / description now stack.
          `overflow-hidden` stays — it is what clips the gallery's tilt. */}
      <section
        id="about-hero-header"
        className="py-20 md:py-28 relative overflow-hidden flex flex-col items-center text-center border-b border-border-subtle"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--ui-accent-secondary-dim)_0%,transparent_50%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center" {...heroReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.25em] block mb-4">
            Our Story & Vision
          </span>
          <h1 className="font-display text-[44px] md:text-[64px] font-extrabold text-text-primary leading-none tracking-tight mb-6">
            <TextScramble id="about-title-scramble" text="About Us" delay={sequenceDelay(1)} />
          </h1>
          <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed max-w-2xl">
            We are a community of students and researchers passionate about bringing people together to collaborate on algorithmic theory, real-world deployment, and safety in Artificial Intelligence.
          </p>
        </div>

        {/* Deliberately outside any `data-reveal` element: the reveal's unlayered
            transform rules outrank Tailwind and leave a lingering transform,
            which would fight the row's per-frame translate3d. The spacing lives
            here rather than in the component so the gallery does not dictate its
            own outer margins. */}
        <div className="w-full relative z-10 mt-12 md:mt-16">
          <AboutGallery />
        </div>
      </section>

       {/* 2. WHO WE ARE BADGED TEASER */}
      <AboutSection onNavigate={onNavigate || (() => {})} />

      {/* 3. CURRENT OFFICERS SUB-SECTION */}
      <section id="officers-list-section" className="py-24 bg-veil-band border-t border-border-subtle relative">

        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div id="officers-header" className="mb-14 text-center" {...officersHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Leadership
            </span>
            <h2 className="font-display text-[32px] md:text-[46px] font-extrabold text-text-primary tracking-tight">
              Meet the Officers
            </h2>
            <p className="font-sans text-[14px] md:text-[15px] text-text-secondary mt-3 max-w-md mx-auto">
              Our dedicated executive board coordinating workshops, HackAI prizes, and client prototypes.
            </p>
          </div>

          {/* Officers 3D Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 justify-items-center">
            {OFFICERS.map((off, idx) => {
              const isBeingExpanded = expandedOfficer?.id === off.id;

              return (
                // The Reveal stays mounted across the placeholder swap below. If it
                // unmounted along with the card, closing the modal would replay the
                // card's reveal animation.
                <Reveal key={off.id} delay={staggerDelay(idx)}>
                {isBeingExpanded && animState !== 'idle' ? (
                  <div className="w-[300px] h-[380px]" style={{ visibility: 'hidden' }} />
                ) : (
                <div
                  ref={(el) => {
                    cardsRef.current[off.id] = el as HTMLDivElement;
                  }}
                  id={`officer-card-shell-${off.id}`}
                  onClick={() => handleCardClick(off, off.id)}
                  /* Flat single element, mirroring the project card in
                     Projects.tsx. The perspective / preserve-3d / backface
                     wrappers this replaces were inert: the grid card was pinned
                     at rotateY(0deg) and had no back face, so it never flipped.
                     Worse, `card-front`'s overflow:hidden sat on a box exactly
                     the size of its child, so it clipped away the child's entire
                     drop shadow. The shadow now lives on the clipping element
                     itself, where overflow cannot eat it. */
                  className="group w-[300px] h-[380px] bg-bg-elevated rounded-2xl overflow-hidden border border-border-subtle hover:border-accent-primary/20 shadow-card hover:shadow-card-hover transition-all duration-350 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer select-none"
                >
                  {/* Image at Top */}
                  <div className="w-full h-[280px] overflow-hidden relative border-b border-border-subtle/50 bg-bg-secondary flex items-center justify-center shrink-0">
                    {off.photo ? (
                      <img
                        src={off.photo}
                        alt={off.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-accent-primary font-display font-black text-2xl group-hover:scale-[1.03] transition-transform duration-500">
                        {off.initials}
                      </div>
                    )}
                    {/* Academic Year Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-overlay backdrop-blur-md rounded-full text-[8px] font-bold text-accent-secondary tracking-widest uppercase border border-border-subtle/10">
                      {off.year}
                    </div>
                  </div>

                  {/* Content immediately below */}
                  <div className="p-3 text-left flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans text-[15px] font-bold text-text-primary leading-tight group-hover:text-accent-primary transition-colors">
                        {off.name}
                      </h3>
                      <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-accent-secondary mt-0.5">
                        {off.role}
                      </p>
                    </div>

                    <div className="border-t border-border-subtle/30 pt-1.5 flex flex-col gap-0.5">
                      <p className="font-sans text-[10px] text-text-secondary line-clamp-1">
                        <span className="font-bold text-text-primary">Major: </span>{off.major}
                      </p>
                      {off.minor && (
                        <p className="font-sans text-[10px] text-text-secondary line-clamp-1">
                          <span className="font-bold text-text-primary">Minor: </span>{off.minor}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                )}
                </Reveal>
              );
            })}
          </div>

          {renderExpandedOfficer()}

        </div>
      </section>

      {/* 4. CLUB FAQ SECTION */}
      <FAQ />
    </div>
  );
};
