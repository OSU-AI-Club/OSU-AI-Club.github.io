import React from 'react';
import {
  Mail,
  Instagram,
  Linkedin,
  Users,
  Presentation,
  Handshake,
  Clock,
  MapPin,
} from 'lucide-react';
import { TextScramble } from '../components/TextScramble';
import { Reveal } from '../components/Reveal';
import { useRevealProps, useRevealSequenceProps, sequenceDelay, staggerDelay } from '../hooks/useReveal';
import {
  MEETING_DAY,
  MEETING_TIME,
  MEETING_LOCATION,
  CLUB_EMAIL,
  CLUB_DISCORD_URL,
  CLUB_INSTAGRAM_URL,
  CLUB_LINKEDIN_URL,
  NEWSLETTER_URL,
  PROJECT_APPLICATION_URL,
  HACKAI_NAME,
} from '../data';

interface GetInvolvedProps {
  onNavigate: (page: string) => void;
}

export const GetInvolved: React.FC<GetInvolvedProps> = ({ onNavigate }) => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading, copy and buttons
  // each get their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const applyStripReveal = useRevealProps();
  const contactHeaderReveal = useRevealProps();
  const inPersonReveal = useRevealProps();

  return (
    <div id="get-involved-page-root" className="pt-[72px] min-h-screen">

      {/* 1. HERO */}
      <section
        id="get-involved-hero"
        className="py-20 md:py-28 relative overflow-hidden flex items-center justify-center text-center border-b border-border-subtle"
      >
        {/* Purple, not blue: the page mesh already washes blue across the top of
            every page, and purple ties the hero to this page's third pathway
            card below. See docs/styling.md. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--ui-accent-tertiary-dim)_0%,transparent_55%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center" {...heroReveal}>
          <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.25em] block mb-4">
            Everyone Is Welcome
          </span>
          <h1 className="font-display text-[44px] md:text-[64px] font-extrabold text-text-primary leading-none tracking-tight mb-6">
            <TextScramble id="get-involved-title-scramble" text="Get Involved" delay={sequenceDelay(1)} />
          </h1>
          <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed max-w-2xl">
            There is no application and no membership fee. Whether you have never written a line of
            Python or you are publishing research, there is a way in — show up, share what you are
            building, or partner with us.
          </p>

          <p className="font-sans text-[13.5px] text-text-secondary flex items-center justify-center gap-1.5 flex-wrap mt-8 select-none">
            <Clock className="w-4 h-4 text-accent-primary shrink-0" />
            <span>General Meetings every</span>
            <span className="font-bold text-text-primary whitespace-nowrap">{MEETING_DAY} at {MEETING_TIME}</span>
            <span>in</span>
            <span className="font-semibold text-text-primary whitespace-nowrap">{MEETING_LOCATION}</span>
          </p>
        </div>
      </section>

      {/* 2. THREE PATHWAYS */}
      <section id="get-involved-pathways" className="py-20 md:py-24 max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* --- How to Join --- */}
          {/* Wrapper and card both carry h-full: the grid is `items-stretch`, and
              without it the three boxes stop matching heights. */}
          <Reveal delay={0} className="h-full">
          <div
            id="pathway-how-to-join"
            className="h-full bg-bg-elevated border border-border-subtle rounded-2xl p-8 flex flex-col shadow-card hover:shadow-card-hover hover:border-accent-primary/25 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-primary-dim text-accent-primary flex items-center justify-center mb-5 shrink-0">
              <Users className="w-6 h-6" />
            </div>

            <h2 className="font-display text-[22px] font-extrabold text-text-primary tracking-tight mb-2">
              How to Join
            </h2>
            <p className="font-sans text-[13.5px] text-text-secondary leading-relaxed mb-6">
              Membership is free and open to every Ohio State student — undergraduate, graduate, or
              PhD, any major. Nothing to sign, no interview.
            </p>

            <ol className="flex flex-col gap-4 mb-8 flex-grow">
              {[
                {
                  title: 'Come to a general meeting',
                  body: `We meet ${MEETING_DAY} at ${MEETING_TIME} in ${MEETING_LOCATION}. Walk in — no notice needed.`,
                },
                {
                  title: 'Join the Discord',
                  body: 'Where announcements, team formation, and day-to-day questions happen.',
                },
                {
                  title: 'Pick something to work on',
                  body: 'Join a semester project team, come to a workshop, or sign up for HackAI.',
                },
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-accent-primary-dim text-accent-primary font-mono text-[11px] font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-sans text-[13px] font-bold text-text-primary block leading-snug">
                      {step.title}
                    </span>
                    <span className="font-sans text-[12.5px] text-text-secondary leading-relaxed">
                      {step.body}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-2.5 mt-auto">
              <a
                id="get-involved-discord-cta"
                href={CLUB_DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[13px] font-bold rounded-full flex items-center justify-center transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_14px_var(--ui-accent-glow)] cursor-pointer"
              >
                Join the Discord
              </a>
              <a
                id="get-involved-newsletter-cta"
                href={NEWSLETTER_URL}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-5 border border-accent-primary text-accent-primary hover:bg-accent-primary-dim font-sans text-[13px] font-bold rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                Subscribe to the Newsletter
              </a>
            </div>
          </div>
          </Reveal>

          {/* --- Present Your Work --- */}
          {/* Wrapper and card both carry h-full: the grid is `items-stretch`, and
              without it the three boxes stop matching heights. */}
          <Reveal delay={60} className="h-full">
          <div
            id="pathway-present-your-work"
            className="h-full bg-bg-elevated border border-border-subtle rounded-2xl p-8 flex flex-col shadow-card hover:shadow-card-hover hover:border-accent-secondary/25 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-secondary-dim text-accent-secondary flex items-center justify-center mb-5 shrink-0">
              <Presentation className="w-6 h-6" />
            </div>

            <h2 className="font-display text-[22px] font-extrabold text-text-primary tracking-tight mb-2">
              Present Your Work
            </h2>
            <p className="font-sans text-[13.5px] text-text-secondary leading-relaxed mb-6">
              Our meetings are member-driven. If you are working on something with AI in it, we want
              you at the front of the room — polished or not.
            </p>

            <ul className="flex flex-col gap-3.5 mb-8 flex-grow">
              {[
                { label: 'Research talks', body: 'Share a paper, a lab project, or a result you are still arguing with.' },
                { label: 'Build demos', body: 'Ten minutes on something you made. Broken demos are welcome and instructive.' },
                { label: 'Workshops', body: 'Teach a tool you know well — PyTorch, RAG, MLOps, prompt engineering.' },
                { label: 'Semester showcase', body: 'Project teams demo their prototypes at the end-of-semester mixer.' },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary shrink-0 mt-[7px]" />
                  <div>
                    <span className="font-sans text-[13px] font-bold text-text-primary">{item.label} — </span>
                    <span className="font-sans text-[12.5px] text-text-secondary leading-relaxed">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-bg-secondary/60 border border-border-subtle p-4 mb-5">
              <p className="font-sans text-[12.5px] text-text-secondary leading-relaxed">
                Email us a sentence or two on your topic and roughly how long you need. We will find
                you a slot — no formal proposal required.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-auto">
              <a
                id="get-involved-pitch-talk-cta"
                href={`mailto:${CLUB_EMAIL}?subject=${encodeURIComponent('Talk proposal for a general meeting')}`}
                className="h-11 px-5 bg-accent-secondary hover:opacity-90 text-on-accent font-sans text-[13px] font-bold rounded-full flex items-center justify-center transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Pitch a Talk
              </a>
              <button
                id="get-involved-projects-cta"
                onClick={() => onNavigate('projects')}
                className="h-11 px-5 border border-accent-secondary text-accent-secondary hover:bg-accent-secondary-dim font-sans text-[13px] font-bold rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                Browse Project Teams
              </button>
            </div>
          </div>
          </Reveal>

          {/* --- Sponsorships --- */}
          {/* Wrapper and card both carry h-full: the grid is `items-stretch`, and
              without it the three boxes stop matching heights. */}
          <Reveal delay={120} className="h-full">
          <div
            id="pathway-sponsorships"
            className="h-full bg-bg-elevated border border-border-subtle rounded-2xl p-8 flex flex-col shadow-card hover:shadow-card-hover hover:border-accent-tertiary/25 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-tertiary-dim text-accent-tertiary flex items-center justify-center mb-5 shrink-0">
              <Handshake className="w-6 h-6" />
            </div>

            <h2 className="font-display text-[22px] font-extrabold text-text-primary tracking-tight mb-2">
              Sponsorships
            </h2>
            <p className="font-sans text-[13.5px] text-text-secondary leading-relaxed mb-6">
              Sponsors fund {HACKAI_NAME}, our semester project teams, compute credits, and the food
              that keeps a room of students in it past 9 PM.
            </p>

            <ul className="flex flex-col gap-3.5 mb-8 flex-grow">
              {[
                { label: 'Recruiting access', body: 'Reach students who ship — resume drops, tech talks, and office hours on campus.' },
                { label: 'Brand presence', body: 'Logo placement on this site, event signage, and hackathon materials.' },
                { label: 'Sponsor a challenge', body: `Put your own problem statement and prize track in front of ${HACKAI_NAME} teams.` },
                { label: 'Mentorship', body: 'Send engineers to mentor project teams or judge the hackathon.' },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-tertiary shrink-0 mt-[7px]" />
                  <div>
                    <span className="font-sans text-[13px] font-bold text-text-primary">{item.label} — </span>
                    <span className="font-sans text-[12.5px] text-text-secondary leading-relaxed">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-bg-secondary/60 border border-border-subtle p-4 mb-5">
              <p className="font-sans text-[12.5px] text-text-secondary leading-relaxed">
                Tiers and benefits are tailored per partner. Reach out and we will send the current
                sponsorship packet.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-auto">
              <a
                id="get-involved-sponsor-cta"
                href={`mailto:${CLUB_EMAIL}?subject=${encodeURIComponent('Sponsorship inquiry')}`}
                className="h-11 px-5 bg-accent-tertiary hover:opacity-90 text-on-accent font-sans text-[13px] font-bold rounded-full flex items-center justify-center transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Request the Packet
              </a>
              <button
                id="get-involved-hackai-cta"
                onClick={() => onNavigate('hackai')}
                className="h-11 px-5 border border-accent-tertiary text-accent-tertiary hover:bg-accent-tertiary-dim font-sans text-[13px] font-bold rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                See {HACKAI_NAME}
              </button>
            </div>
          </div>
          </Reveal>

        </div>

        {/* Secondary note: applying to a project team */}
        <div className="mt-10 rounded-2xl border border-dashed border-border-medium bg-bg-secondary/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5" {...applyStripReveal}>
          <div>
            <h3 className="font-display text-[17px] font-extrabold text-text-primary tracking-tight">
              Ready to build something this semester?
            </h3>
            <p className="font-sans text-[13px] text-text-secondary leading-relaxed mt-1.5 max-w-xl">
              Project teams form at the start of each semester. Apply once and we will match you to a
              team based on your interests and experience level.
            </p>
          </div>
          <a
            id="get-involved-apply-cta"
            href={PROJECT_APPLICATION_URL}
            target="_blank"
            rel="noreferrer"
            className="h-11 px-6 shrink-0 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[13px] font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_14px_var(--ui-accent-glow)] cursor-pointer"
          >
            <span>Apply to a Project Team</span>
            <span className="font-mono">→</span>
          </a>
        </div>
      </section>

      {/* 3. CONTACT LINKS */}
      <section
        id="get-involved-contact"
        className="py-20 md:py-24 bg-veil-band border-t border-border-subtle"
      >
        <div className="max-w-5xl mx-auto px-6 md:px-16">
          <div className="mb-12 text-center" {...contactHeaderReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Reach Us
            </span>
            <h2 className="font-display text-[30px] md:text-[40px] font-extrabold text-text-primary tracking-tight">
              Contact & Community
            </h2>
            <p className="font-sans text-[14px] text-text-secondary mt-3 max-w-lg mx-auto">
              Questions about joining, presenting, or partnering? Any of these reach the officer team.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discord */}
            <Reveal delay={0}>
            <a
              id="get-involved-link-discord"
              href={CLUB_DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-4 p-5 rounded-2xl bg-bg-elevated border border-border-subtle hover:border-accent-primary/30 hover:shadow-card transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors shrink-0">
                <svg className="w-5 h-5 text-accent-primary fill-current" viewBox="0 0 127.14 96.36" role="img">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.8,6.83,77.19,77.19,0,0,0,49.5,0,105.15,105.15,0,0,0,19.06,8.07C2.75,32.4-1.69,56.12.51,79.46a105.52,105.52,0,0,0,31.7,16.09,77.11,77.11,0,0,0,6.67-10.87,68.7,68.7,0,0,1-10.51-5c.89-.66,1.76-1.37,2.58-2.1a75.46,75.46,0,0,0,65.07,0c.83.73,1.69,1.44,2.58,2.1a68.7,68.7,0,0,1-10.51,5,77.11,77.11,0,0,0,6.67,10.87,105.52,105.52,0,0,0,31.7-16.09C128.84,50.77,124.08,27.24,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[14px] font-bold text-text-primary group-hover:text-accent-primary">Discord Server</span>
                <span className="font-sans text-xs text-text-muted">Join 500+ active campus members</span>
              </div>
            </a>
            </Reveal>

            {/* Email */}
            <Reveal delay={60}>
            <a
              id="get-involved-link-email"
              href={`mailto:${CLUB_EMAIL}`}
              className="flex items-center space-x-4 p-5 rounded-2xl bg-bg-elevated border border-border-subtle hover:border-accent-primary/30 hover:shadow-card transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors shrink-0">
                <Mail className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[14px] font-bold text-text-primary group-hover:text-accent-primary">Email the Officers</span>
                <span className="font-sans text-xs text-text-muted">{CLUB_EMAIL}</span>
              </div>
            </a>
            </Reveal>

            {/* Instagram */}
            <Reveal delay={120}>
            <a
              id="get-involved-link-instagram"
              href={CLUB_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-4 p-5 rounded-2xl bg-bg-elevated border border-border-subtle hover:border-accent-primary/30 hover:shadow-card transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors shrink-0">
                <Instagram className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[14px] font-bold text-text-primary group-hover:text-accent-primary">Instagram</span>
                <span className="font-sans text-xs text-text-muted">Follow our visual updates</span>
              </div>
            </a>
            </Reveal>

            {/* LinkedIn */}
            <Reveal delay={180}>
            <a
              id="get-involved-link-linkedin"
              href={CLUB_LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-4 p-5 rounded-2xl bg-bg-elevated border border-border-subtle hover:border-accent-primary/30 hover:shadow-card transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors shrink-0">
                <Linkedin className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[14px] font-bold text-text-primary group-hover:text-accent-primary">LinkedIn</span>
                <span className="font-sans text-xs text-text-muted">Connect with our alumni network</span>
              </div>
            </a>
            </Reveal>
          </div>

          {/* Where to find us in person */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[13px] font-sans text-text-secondary" {...inPersonReveal}>
            <MapPin className="w-4 h-4 text-accent-primary shrink-0" />
            <span>
              In person: <span className="font-semibold text-text-primary">{MEETING_LOCATION}</span>,{' '}
              {MEETING_DAY} at {MEETING_TIME}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
