import React, { useState } from 'react';
import { FAQS } from '../data';
import { Reveal } from './Reveal';
import { useRevealProps, staggerDelay } from '../hooks/useReveal';

interface FAQProps {
  /**
   * Section id, and the prefix for every per-item id. Each page passes its own:
   * two accordions rendered on one page would otherwise collide on ids.
   */
  id?: string;
  items?: { q: string; a: string }[];
  eyebrow?: string;
  title?: string;
  blurb?: string;
}

/**
 * Accordion FAQ section. One question open at a time; clicking the open one
 * closes it.
 *
 * Props all default to the club-wide FAQ the About page shows, so `<FAQ />`
 * with no props stays the general version.
 */
export const FAQ: React.FC<FAQProps> = ({
  id = 'club-faqs',
  items = FAQS,
  eyebrow = 'Help Center',
  title = 'Frequently Asked Questions',
  blurb = "Got questions? We've got answers. Explore everything you need to know about joining and participating in our activities.",
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const headerReveal = useRevealProps();

  const toggleFaq = (idx: number) => {
    setExpandedFaq(prev => (prev === idx ? null : idx));
  };

  return (
    <section id={id} className="py-24 border-t border-border-subtle select-none">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-14 text-center" {...headerReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
            {eyebrow}
          </span>
          <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
            {title}
          </h2>
          <p className="font-sans text-sm text-text-secondary mt-3">
            {blurb}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <Reveal key={idx} delay={staggerDelay(idx)}>
              <div
                id={`${id}-panel-item-${idx}`}
                className="bg-bg-elevated border border-border-subtle rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:border-accent-primary/20"
              >
                <button
                  id={`${id}-accordion-toggle-${idx}`}
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-sans font-bold text-[15px] text-text-primary hover:text-accent-primary focus:outline-none cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-xl text-text-muted shrink-0 transition-transform duration-350">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div id={`${id}-answer-block-${idx}`} className="px-6 pb-6 animate-fade-in">
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
  );
};
