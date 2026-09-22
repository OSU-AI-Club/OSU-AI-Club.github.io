import React from 'react';
import { Construction } from 'lucide-react';
import { CLUB_EMAIL } from '../data';
import { Reveal } from './Reveal';

interface UnderConstructionProps {
  /**
   * Section id. Each page passes its own rather than sharing one, so the notice
   * stays a stable per-page deep-link and QA target.
   */
  id: string;
  /** One sentence on what will live here once the page is built. */
  blurb: string;
  /**
   * Headline. Defaults to the page-level wording; pass a section-level one when
   * the rest of the page around this notice is already live.
   */
  heading?: string;
  /** Defaults to a mailto the club. Pass an http(s) URL and it opens in a new tab. */
  ctaHref?: string;
  ctaLabel?: string;
}

/**
 * Placeholder body for a page whose tab is published but whose content is not
 * ready yet.
 *
 * Deliberately shared: three pages use it today, and a visitor who lands on two
 * of them should meet the same notice rather than two near-copies that drift
 * apart as one gets edited.
 */
export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  id,
  blurb,
  heading = 'This page is under construction',
  ctaHref = `mailto:${CLUB_EMAIL}`,
  ctaLabel = 'Email the club',
}) => {
  const isExternal = ctaHref.startsWith('http');

  return (
    <section id={id} className="py-24 max-w-7xl mx-auto px-6 md:px-16">
      <Reveal>
        <div className="rounded-3xl border border-dashed border-border-medium bg-bg-secondary/40 py-20 px-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-accent-primary-dim text-accent-primary flex items-center justify-center">
            <Construction className="w-6 h-6" />
          </div>
          <span className="font-display font-black text-xl text-text-primary block mt-5">
            {heading}
          </span>
          <p className="font-sans text-[13px] text-text-secondary leading-relaxed mt-2.5 max-w-md mx-auto">
            {blurb}
          </p>
          <a
            id={`${id}-cta`}
            href={ctaHref}
            {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="mt-6 inline-flex h-10 px-5 rounded-full bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[13px] font-semibold items-center justify-center transition-all duration-200 cursor-pointer"
          >
            {ctaLabel}
          </a>
        </div>
      </Reveal>
    </section>
  );
};
