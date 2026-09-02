import React, { useState } from 'react';
import { Trophy, Sparkles, BrainCircuit, Users, Terminal, Code2, Play } from 'lucide-react';
import { TextScramble } from '../components/TextScramble';
import { Reveal } from '../components/Reveal';
import { useRevealProps, useRevealSequenceProps, sequenceDelay, staggerDelay } from '../hooks/useReveal';
import {
  HACKAI_NAME,
  HACKAI_BANNER_BADGE,
  HACKAI_FAQS
} from '../data';

export const HackAI: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading, copy and buttons
  // each get their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const prizesHeaderReveal = useRevealProps();
  const scheduleHeaderReveal = useRevealProps();
  const faqHeaderReveal = useRevealProps();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setExpandedFaq(prev => (prev === idx ? null : idx));
  };

  // Prizes are per challenge subject, not overall: the same podium is paid out
  // in each of the three subjects, so these three cards describe nine awards.
  // `cash` is therefore always followed by the per-subject qualifier in the UI
  // — dropping it would read as a single event-wide payout.
  const CHALLENGE_SUBJECT_COUNT = 3;

  const prizes = [
    { rank: '1st Place', cash: '$300', label: 'Awarded in each challenge subject', cardBg: 'bg-[linear-gradient(135deg,var(--ui-surface-inverse)_0%,var(--ui-surface-inverse-deep)_100%)] border-accent-secondary-on-inverse/35' },
    { rank: '2nd Place', cash: '$200', label: 'Awarded in each challenge subject', cardBg: 'bg-bg-secondary border-border-subtle' },
    { rank: '3rd Place', cash: '$100', label: 'Awarded in each challenge subject', cardBg: 'bg-bg-secondary border-border-subtle' },
  ];

  const schedule = [
    { time: 'Saturday 8:30 AM', title: 'Check-In & Registration opens', desc: 'Arrive at the venue, pick up event credentials and swag kits.' },
    { time: 'Saturday 9:00 AM', title: 'Opening ceremony & keynote address', desc: 'Hear from our corporate research sponsors and reveal the prompt dataset.' },
    { time: 'Sunday 11:00 AM', title: 'Mentor office hours & workshop block', desc: 'Drop-in debugging with industry mentors plus beginner tracks on APIs and deployment.' },
    { time: 'Sunday 4:00 PM', title: 'Hacking deadline & submissions lock', desc: 'All notebooks and project code repositories must be committed onto GitHub.' },
    { time: 'Sunday 5:30 PM', title: 'Awards ceremony', desc: 'Keynote conclusions, grand cash winners announced and photo rounds.' }
  ];

  return (
    <div id="hackai-page-root" className="pt-[72px] min-h-screen">
      
      {/* 1. HACKAI HERO */}
      <section
        id="hackai-hero"
        className="py-16 md:py-24 border-b border-border-subtle relative overflow-hidden flex flex-col items-center justify-center text-center"
      >
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center" {...heroReveal}>
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/20 mb-5 select-none shadow-sm">
            {HACKAI_BANNER_BADGE}
          </span>

          <h1 className="font-display text-[44px] md:text-[76px] font-extrabold text-text-primary leading-none tracking-tighter mb-6">
            <TextScramble id="hackai-title-scramble" text={HACKAI_NAME} delay={sequenceDelay(1)} />
          </h1>
          
          <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed max-w-2xl text-center">
            HackAI is a 2-day hackathon where teams of 1-4 students can choose from challenges or tackle their own projects with the help of artificial intelligence. Mentors will be provided throughout the day, and judging will occur on the second day to determine the best AI projects of HackAI 2027. Tutorials, datasets, and meals will be provided.
          </p>
        </div>
      </section>

      {/* 2. CASH PRIZES SECTIONS */}
      <section id="hackai-prizes-section" className="py-24 max-w-7xl mx-auto px-6 md:px-16">
        <div className="mb-14 text-center select-none" {...prizesHeaderReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3 animate-pulse">
            Prize Pool Stakes
          </span>
          <h2 className="font-display text-[32px] md:text-[46px] font-extrabold text-text-primary tracking-tight">
            $2,000 in Total Cash Prizes
          </h2>
          <p className="font-sans text-sm text-text-secondary mt-3">
            {CHALLENGE_SUBJECT_COUNT} challenge subjects, released before the event. Each one is
            judged on its own and pays out its own full podium.
          </p>
        </div>

        {/* Prizes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((item, idx) => {
            const isGrand = idx === 0;
            return (
              <Reveal key={idx} delay={staggerDelay(idx)} className="h-full">
              <div
                id={`prize-item-${idx}`}
                className={`h-full p-8 rounded-2xl border flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${item.cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isGrand ? 'text-accent-secondary-on-inverse' : 'text-text-muted'}`}>
                      {item.rank}
                    </span>
                    <Trophy className={`w-5 h-5 ${isGrand ? 'text-accent-secondary-on-inverse' : 'text-accent-primary/60'}`} />
                  </div>
                  
                  <div className={`font-mono text-[38px] md:text-[48px] font-extrabold tracking-tight leading-none mt-4 ${isGrand ? 'text-on-inverse' : 'text-accent-primary'}`}>
                    {item.cash}
                    <span className={`font-sans text-[13px] font-semibold tracking-normal ml-2 ${isGrand ? 'text-on-inverse-muted' : 'text-text-secondary'}`}>
                      per subject
                    </span>
                  </div>
                </div>

                <div className={`pt-4 border-t mt-8 ${isGrand ? 'border-border-inverse' : 'border-border-subtle/40'}`}>
                  <span className={`text-xs font-sans ${isGrand ? 'text-on-inverse-muted' : 'text-text-secondary'}`}>
                    {item.label}
                  </span>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 3. WEEKEND SCHEDULE TIMELINE */}
      <section id="hackai-timeline-section" className="py-24 bg-veil-band border-y border-border-subtle">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-14 text-center select-none" {...scheduleHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Event Agenda
            </span>
            <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
              Weekend Hack Schedule
            </h2>
          </div>

          {/* Timeline Node Chain */}
          <div className="relative border-l border-border-medium/60 ml-3 md:ml-6 space-y-12">
            {schedule.map((item, idx) => (
              <Reveal key={idx} delay={staggerDelay(idx)}>
              <div className="relative pl-8 md:pl-10">
                
                {/* Timeline node marker circle */}
                <span className="absolute -left-2 top-1.5 w-4.5 h-4.5 rounded-full border-2 border-accent-primary bg-bg-primary flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                </span>

                <div className="text-left">
                  <span className="font-mono text-[11px] font-extrabold text-accent-primary bg-accent-primary-dim px-2.5 py-1 rounded-md">
                    {item.time}
                  </span>
                  <h4 className="font-sans text-[16px] md:text-[18px] font-extrabold text-text-primary leading-tight mt-3">
                    {item.title}
                  </h4>
                  <p className="font-sans text-xs md:text-sm text-text-secondary leading-relaxed mt-1.5">
                    {item.desc}
                  </p>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HackAI FAQ section */}
      <section id="hackai-faqs" className="py-24 border-t border-border-subtle select-none">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-14 text-center" {...faqHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              FAQ
            </span>
            <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
              HackAI Frequently Asked Questions
            </h2>
            <p className="font-sans text-sm text-text-secondary mt-3">
              Everything you need to know about preparing for, registered for, and building at HackAI.
            </p>
          </div>

          <div className="space-y-4">
            {HACKAI_FAQS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <Reveal key={idx} delay={staggerDelay(idx)}>
                <div
                  id={`hackai-faq-panel-item-${idx}`}
                  className="bg-bg-elevated border border-border-subtle rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:border-accent-primary/20"
                >
                  <button
                    id={`hackai-faq-accordion-toggle-${idx}`}
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between font-sans font-bold text-[15px] text-text-primary hover:text-accent-primary focus:outline-none cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <span className="text-xl text-text-muted shrink-0 transition-transform duration-350">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div id={`hackai-faq-answer-block-${idx}`} className="px-6 pb-6 animate-fade-in">
                      <div className="h-[1px] w-full bg-border-subtle/50 mb-4" />
                      <p className="font-sans text-[13.5px] text-text-secondary leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
