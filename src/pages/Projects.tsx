import React from 'react';
import { Network, Cpu, Megaphone } from 'lucide-react';
import { TextScramble } from '../components/TextScramble';
import { UnderConstruction } from '../components/UnderConstruction';
import { FAQ } from '../components/FAQ';
import { Reveal } from '../components/Reveal';
import { INCUBATOR_APPLICATION_URL, INCUBATOR_FAQS, NOTION_SPONSORED_PROJECTS_URL } from '../data';
import { useRevealProps, useRevealSequenceProps, sequenceDelay } from '../hooks/useReveal';

const SPONSORSHIP_BENEFITS = [
  {
    icon: Network,
    label: 'Network of contacts',
    body: "Introductions through AIC's contacts — the people who can advise, fund, or open a door for your project.",
  },
  {
    icon: Cpu,
    label: 'Systems and compute',
    body: 'Access to university systems and compute resources, so infrastructure is not what slows you down.',
  },
  {
    icon: Megaphone,
    label: 'Marketing support',
    body: 'Visibility with professors across departments and with students looking for a team to join.',
  },
];

export const Projects: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading and copy each get
  // their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const sponsoredHeaderReveal = useRevealProps();
  const applyHeaderReveal = useRevealProps();

  return (
    <div id="projects-page-root" className="pt-[72px] min-h-screen select-none">

      {/* 1. HERO HEADER INTRO */}
      <section id="projects-hero-banner" className="py-20 md:py-24 bg-[linear-gradient(to_bottom,var(--ui-veil-band),rgba(0,0,0,0))] border-b border-border-subtle relative overflow-hidden">
        {/* Green, not blue: the page mesh already washes blue across the top of
            every page. See docs/styling.md. */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10 flex flex-col items-center">
          <div className="max-w-3xl text-center" {...heroReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Student-Led Innovation
            </span>
            <h1 className="font-display text-[38px] md:text-[54px] font-extrabold text-text-primary tracking-tight leading-[1.1]">
              <TextScramble id="projects-title-scramble" text="The AIC Project Incubator" delay={sequenceDelay(1)} />
            </h1>
            <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
              The incubator gives student-led AI projects real backing to go further. Selected projects get access to AIC's network of contacts, university systems and compute resources, and marketing support — both to professors across departments and to fellow students looking to join a team.
            </p>
            <p className="font-sans text-[14px] md:text-[15px] text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
              Whether you are starting from an idea or already have a working prototype, sponsorship helps you build faster, find the right teammates, and get noticed by the people who can help you grow. Projects here come in every size — built for fun, built to teach other students, sponsorship work for another organization, a potential startup, or a business.
            </p>
          </div>
        </div>
      </section>

      {/* 2. CURRENTLY SPONSORED PROJECTS
          The roster is published from the club's Notion board rather than
          hardcoded here. Until NOTION_SPONSORED_PROJECTS_URL is set, this
          section carries a section-level under-development notice. */}
      <section id="incubator-sponsored-projects" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="max-w-2xl mx-auto text-center" {...sponsoredHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Currently Sponsored
            </span>
            <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
              Projects in the Incubator
            </h2>
            <p className="font-sans text-sm text-text-secondary mt-3">
              Every project the club is backing right now, with what each one is building and who is on it.
            </p>
          </div>
        </div>

        {NOTION_SPONSORED_PROJECTS_URL ? (
          /* White frame, same reasoning as the calendar embed on Events: the
             embed renders in its own theme, so it is presented as a deliberate
             light panel that reads the same in both of ours. */
          <div className="max-w-5xl mx-auto px-6 mt-12">
            <div className="bg-white rounded-2xl shadow-card border border-border-subtle p-2 md:p-3 overflow-hidden">
              <iframe
                id="incubator-notion-embed"
                title="Sponsored Incubator Projects"
                src={NOTION_SPONSORED_PROJECTS_URL}
                loading="lazy"
                className="w-full h-[560px] md:h-[700px] border-0 rounded-xl block"
              />
            </div>
          </div>
        ) : (
          <UnderConstruction
            id="incubator-projects-under-development"
            heading="This section is under development"
            blurb="The live roster of sponsored projects will be published here from the club's Notion board. Until then, email us if you want to know what teams are currently being backed."
          />
        )}
      </section>

      {/* 3. APPLY FOR SPONSORSHIP */}
      <section id="incubator-apply" className="py-20 md:py-24 bg-veil-band border-y border-border-subtle">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10" {...applyHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Sponsorship
            </span>
            <h2 className="font-display text-[32px] md:text-[42px] font-extrabold text-text-primary tracking-tight">
              Apply for AIC Sponsorship
            </h2>
            <p className="font-sans text-sm text-text-secondary mt-3">
              Any Ohio State student can apply, solo or as a team, from an idea or a working prototype.
            </p>
          </div>

          {/* Reveal wrapper, not useRevealProps: the CTA inside carries a hover
              transform, which an in-place reveal would kill. See docs/styling.md. */}
          <Reveal>
            <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-8 shadow-card">
              <ul className="flex flex-col gap-5 mb-8">
                {SPONSORSHIP_BENEFITS.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={idx} className="flex items-start gap-4">
                      <span className="w-10 h-10 shrink-0 rounded-xl bg-accent-primary-dim text-accent-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="font-sans text-[13.5px] font-bold text-text-primary block leading-snug">
                          {benefit.label}
                        </span>
                        <span className="font-sans text-[12.5px] text-text-secondary leading-relaxed">
                          {benefit.body}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <a
                id="incubator-apply-cta"
                href={INCUBATOR_APPLICATION_URL}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[13px] font-bold rounded-full flex items-center justify-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_14px_var(--ui-accent-glow)] cursor-pointer"
              >
                Apply for Sponsorship
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. FAQ */}
      <FAQ
        id="incubator-faqs"
        items={INCUBATOR_FAQS}
        eyebrow="Incubator FAQ"
        title="Frequently Asked Questions"
        blurb="What sponsorship covers, who can apply, and what happens once you do."
      />

    </div>
  );
};
