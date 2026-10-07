import React from 'react';
import { CalendarDays, Clock, MapPin, FlaskConical, Building2, Briefcase, Mail } from 'lucide-react';
import { TextScramble } from '../components/TextScramble';
import { FAQ } from '../components/FAQ';
import { Reveal } from '../components/Reveal';
import { useRevealProps, useRevealSequenceProps, sequenceDelay, staggerDelay } from '../hooks/useReveal';
import {
  CLUB_EMAIL,
  RESEARCH_EXPO_NAME,
  RESEARCH_EXPO_TERM,
  RESEARCH_EXPO_DATE,
  RESEARCH_EXPO_TIME,
  RESEARCH_EXPO_LOCATION,
  RESEARCH_EXPO_BANNER_BADGE,
  RESEARCH_EXPO_FAQS,
} from '../data';

/**
 * Every image in assets/researchexpo_gallery, discovered at build time — same
 * mechanism and same load-bearing filename sort as AboutGallery. Dropping a
 * photo into that folder is all it takes to add it to the gallery below.
 */
const galleryModules = import.meta.glob(
  '../../assets/researchexpo_gallery/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, import: 'default' }
);

const GALLERY = Object.entries(galleryModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => {
    // "speaking-event.webp" -> "Speaking event". Filenames are the only
    // description these photos have, so name them readably.
    const base = path.split('/').pop()!.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    return { src: src as string, alt: base.charAt(0).toUpperCase() + base.slice(1) };
  });

const EVENT_DETAILS = [
  { icon: CalendarDays, label: 'Date', value: RESEARCH_EXPO_DATE },
  { icon: Clock, label: 'Time', value: RESEARCH_EXPO_TIME },
  { icon: MapPin, label: 'Location', value: RESEARCH_EXPO_LOCATION },
];

const HIGHLIGHTS = [
  {
    icon: FlaskConical,
    label: 'Research from across Ohio State',
    body: 'Faculty, graduate, and undergraduate researchers present the AI projects coming out of labs all over campus.',
  },
  {
    icon: Building2,
    label: 'Industry and organizations',
    body: 'External companies and organizations show what they are building and where they see the field heading next.',
  },
  {
    icon: Briefcase,
    label: 'Recruiting',
    body: 'Presenters come to meet students. Talk to them about internships, full-time roles, and open research positions.',
  },
];

export const ResearchExpo: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading and copy each get
  // their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const highlightsHeaderReveal = useRevealProps();
  const galleryHeaderReveal = useRevealProps();
  const presentHeaderReveal = useRevealProps();

  const [featured, ...restOfGallery] = GALLERY;

  return (
    <div id="research-expo-page-root" className="pt-[72px] min-h-screen select-none">

      {/* 1. HERO HEADER INTRO
          Green accent glow rather than blue: the page mesh already puts a blue
          lobe in this corner. Same reasoning as the Events hero. */}
      <section id="research-expo-hero-banner" className="py-20 md:py-24 bg-[linear-gradient(to_bottom,var(--ui-veil-band),rgba(0,0,0,0))] border-b border-border-subtle relative overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10 flex flex-col items-center">
          <div className="max-w-3xl text-center flex flex-col items-center" {...heroReveal}>
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/20 mb-5 shadow-sm">
              {RESEARCH_EXPO_BANNER_BADGE}
            </span>
            <h1 className="font-display text-[38px] md:text-[54px] font-extrabold text-text-primary tracking-tight leading-[1.1]">
              <TextScramble id="research-expo-title-scramble" text={RESEARCH_EXPO_NAME} delay={sequenceDelay(1)} />
            </h1>
            <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
              An event where Ohio State researchers and outside companies and organizations present
              their AI projects, show students the newest developments in the field, and meet the
              students they want to recruit.
            </p>
          </div>
        </div>
      </section>

      {/* 2. EVENT DETAILS
          Values come straight from general.ts. While one is still "TBD" it is
          shown muted rather than hidden, so the layout doesn't shift when the
          real value lands. */}
      <section id="research-expo-details" className="pt-16 md:pt-20 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EVENT_DETAILS.map((item, idx) => {
            const Icon = item.icon;
            const isTbd = item.value === 'TBD';
            return (
              <Reveal key={item.label} delay={staggerDelay(idx)} className="h-full">
                <div
                  id={`research-expo-detail-${item.label.toLowerCase()}`}
                  className="h-full bg-bg-elevated border border-border-subtle rounded-2xl p-6 flex items-center gap-4 shadow-card"
                >
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-primary-dim text-accent-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <span className="font-sans text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                      {RESEARCH_EXPO_TERM} · {item.label}
                    </span>
                    <span className={`font-sans text-[15px] font-bold leading-snug block mt-0.5 ${isTbd ? 'text-text-muted' : 'text-text-primary'}`}>
                      {item.value}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 3. WHAT TO EXPECT */}
      <section id="research-expo-highlights" className="py-20 md:py-24 max-w-7xl mx-auto px-6 md:px-16">
        <div className="mb-14 text-center" {...highlightsHeaderReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
            What to Expect
          </span>
          <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
            Where Campus Research Meets Industry
          </h2>
          <p className="font-sans text-sm text-text-secondary mt-3 max-w-2xl mx-auto">
            One room, two sides of the field: the work happening in Ohio State labs, and the work
            happening at the companies and organizations students go on to join.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.label} delay={staggerDelay(idx)} className="h-full">
                <div
                  id={`research-expo-highlight-${idx}`}
                  className="h-full p-8 rounded-2xl border border-border-subtle bg-bg-elevated flex flex-col shadow-card hover:shadow-card-hover hover:border-accent-primary/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="w-12 h-12 rounded-xl bg-accent-secondary-dim text-accent-secondary flex items-center justify-center mb-5 shrink-0">
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-display text-[20px] font-extrabold text-text-primary tracking-tight mb-2">
                    {item.label}
                  </h3>
                  <p className="font-sans text-[13.5px] text-text-secondary leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 4. GALLERY
          Skipped entirely when the folder is empty. A lone photo gets a single
          wide frame; with more, the first leads a 2x2 tile and the rest fill
          in beside and below it. */}
      {featured && (
        <section id="research-expo-gallery" className="pb-20 md:pb-24 max-w-7xl mx-auto px-6 md:px-16">
          <div className="mb-10 text-center" {...galleryHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Gallery
            </span>
            <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
              Moments from the Expo
            </h2>
          </div>

          {restOfGallery.length === 0 ? (
            <Reveal>
              <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-bg-secondary border border-border-subtle shadow-card">
                <img
                  src={featured.src}
                  alt={featured.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[160px] md:auto-rows-[220px] gap-4">
              {GALLERY.map((img, idx) => (
                <Reveal
                  key={img.src}
                  delay={staggerDelay(idx)}
                  className={idx === 0 ? 'col-span-2 row-span-2' : ''}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-bg-secondary border border-border-subtle">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. PRESENT AT THE EXPO */}
      <section id="research-expo-present" className="py-20 md:py-24 bg-veil-band border-y border-border-subtle">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10" {...presentHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              For Labs and Organizations
            </span>
            <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
              Present at the Expo
            </h2>
            <p className="font-sans text-sm text-text-secondary mt-3">
              Ohio State research groups and outside companies and organizations are all welcome to present.
            </p>
          </div>

          {/* Reveal wrapper, not useRevealProps: the CTA inside carries a hover
              transform, which an in-place reveal would kill. See docs/styling.md. */}
          <Reveal>
            <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-8 shadow-card">
              <p className="font-sans text-[14px] text-text-secondary leading-relaxed mb-8">
                Show students what your team is working on, share where you see AI heading, and meet
                students looking for research positions, internships, and jobs. Email us with who you
                are and what you would like to present, and we will follow up with the details for{' '}
                {RESEARCH_EXPO_TERM}.
              </p>

              <a
                id="research-expo-present-cta"
                href={`mailto:${CLUB_EMAIL}?subject=${encodeURIComponent(`Presenting at the ${RESEARCH_EXPO_NAME}`)}`}
                className="h-11 px-5 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[13px] font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_14px_var(--ui-accent-glow)] cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email {CLUB_EMAIL}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. FAQ */}
      <FAQ
        id="research-expo-faqs"
        items={RESEARCH_EXPO_FAQS}
        eyebrow="Expo FAQ"
        title="Frequently Asked Questions"
        blurb="Who presents, who can attend, and how to get involved."
      />

    </div>
  );
};
