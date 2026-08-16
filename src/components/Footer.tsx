import React from 'react';
import { Mail, MessageSquare, ExternalLink, Instagram, Linkedin } from 'lucide-react';
import { useRevealProps } from '../hooks/useReveal';
import aiLogo from '../../assets/images/AI_Logo_Final.png';
import {
  HACKAI_NAME,
  CLUB_EMAIL,
  CLUB_DISCORD_URL,
  CLUB_INSTAGRAM_URL,
  CLUB_LINKEDIN_URL,
  NEWSLETTER_URL,
} from '../data';

interface FooterProps {
  onNavigate: (page: string) => void;
  activePage?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, activePage }) => {
  // In-place props rather than <Reveal> wrappers: these three are `lg:col-span-*`
  // children of the 12-col grid and have to stay direct children of it.
  const brandReveal = useRevealProps();
  const linksReveal = useRevealProps(80);
  const contactReveal = useRevealProps(160);
  const bottomReveal = useRevealProps(240);

  return (
    <footer
      id="footer-contact"
      className="pt-24 pb-12 relative overflow-hidden border-t border-border-subtle"
    >
      {/* Top hairline sheen. The corner glow that used to sit here was removed:
          the page mesh already lands a purple lobe in the bottom-right, which is
          exactly where the footer sits. */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-16">
        
        {/* Col 1 (5/12): Brand logo, bio, newsletter */}
        <div className="lg:col-span-5 flex flex-col items-start" {...brandReveal}>
          <div className="flex items-center mb-6">
            <div className="w-9 h-9 flex items-center justify-center bg-surface-inverse rounded-xl shadow-md">
              <img
                src={aiLogo}
                alt="AI @ OSU Logo"
                className="w-5.5 h-5.5 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <p className="font-sans text-[14px] text-text-secondary leading-relaxed mb-8 max-w-sm">
            The official student-led engineering & research incubator for Artificial Intelligence and Machine Learning at The Ohio State University, Dreese Laboratories.
          </p>

          {/* Subscribe to our Newsletter Button */}
          <div className="w-full max-w-sm">
            <a
              id="footer-newsletter-button"
              href={NEWSLETTER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center h-11 px-6 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-xs font-bold rounded-full shadow-[0_4px_14px_var(--ui-accent-glow)] hover:shadow-[0_6px_20px_var(--ui-accent-glow)] transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Subscribe to our Newsletter</span>
              <span className="ml-2 font-mono">→</span>
            </a>
          </div>
        </div>

        {/* Col 2 (3/12): Quick Links */}
        <div className="lg:col-span-3 flex flex-col items-start" {...linksReveal}>
          <span className="font-sans text-[11px] font-bold text-text-primary uppercase tracking-widest block mb-6">
            Quick Navigation
          </span>
          <div className="flex flex-col space-y-3.5 text-sm font-medium">
            {[
              { label: 'Campus Homepage', id: 'home' },
              { label: 'Our Story & Officers', id: 'about' },
              { label: `${HACKAI_NAME}`, id: 'hackai' },
              { label: 'Events Calendar', id: 'events' },
              { label: 'Get Involved', id: 'getinvolved' },
            ].map((link) => (
              <button
                key={link.id}
                id={`footer-nav-link-${link.id}`}
                onClick={() => {
                  if (activePage === link.id) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className="text-text-secondary hover:text-accent-primary text-left transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Col 3 (4/12): Contacts / External */}
        <div id="footer-external-presence" className="lg:col-span-4 flex flex-col items-start" {...contactReveal}>
          <span className="font-sans text-[11px] font-bold text-text-primary uppercase tracking-widest block mb-6">
            Resources & Contact
          </span>
          <div className="space-y-4 w-full text-sm">
            
            {/* Discord */}
            <a
              id="footer-discord-link"
              href={CLUB_DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 text-text-secondary hover:text-accent-primary transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors">
                <svg
                  className="w-4 h-4 text-accent-primary fill-current"
                  viewBox="0 0 127.14 96.36"
                  role="img"
                >
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.8,6.83,77.19,77.19,0,0,0,49.5,0,105.15,105.15,0,0,0,19.06,8.07C2.75,32.4-1.69,56.12.51,79.46a105.52,105.52,0,0,0,31.7,16.09,77.11,77.11,0,0,0,6.67-10.87,68.7,68.7,0,0,1-10.51-5c.89-.66,1.76-1.37,2.58-2.1a75.46,75.46,0,0,0,65.07,0c.83.73,1.69,1.44,2.58,2.1a68.7,68.7,0,0,1-10.51,5,77.11,77.11,0,0,0,6.67,10.87,105.52,105.52,0,0,0,31.7-16.09C128.84,50.77,124.08,27.24,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-text-primary group-hover:text-accent-primary">Discord Server</span>
                <span className="text-xs text-text-muted">Join 500+ active campus members</span>
              </div>
            </a>

            {/* Instagram */}
            <a
              id="footer-instagram-link"
              href={CLUB_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 text-text-secondary hover:text-accent-primary transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-text-primary group-hover:text-accent-primary">Instagram</span>
                <span className="text-xs text-text-muted">Follow our visual updates</span>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              id="footer-linkedin-link"
              href={CLUB_LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 text-text-secondary hover:text-accent-primary transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-text-primary group-hover:text-accent-primary">LinkedIn Professional</span>
                <span className="text-xs text-text-muted">Connect with our alumni network</span>
              </div>
            </a>

            {/* Email */}
            <a
              id="footer-email-link"
              href={`mailto:${CLUB_EMAIL}`}
              className="flex items-center space-x-3 text-text-secondary hover:text-accent-primary transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-bg-secondary group-hover:bg-accent-primary-dim flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-text-primary group-hover:text-accent-primary">Contact Officers</span>
                <span className="text-xs text-text-muted">{CLUB_EMAIL}</span>
              </div>
            </a>

          </div>
        </div>

      </div>

      {/* Footer Bottom copyright row */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between text-xs text-text-muted" {...bottomReveal}>
        <div>
          © {new Date().getFullYear()} Artificial Intelligence Club at The Ohio State University. All rights reserved.
        </div>
        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-accent-primary transition-colors">Constitution</a>
          <a href="#" className="hover:text-accent-primary transition-colors">Dreese Lab Access</a>
          <div className="flex items-center text-[10px] uppercase font-mono font-bold text-accent-secondary">
            <span className="w-2 h-2 rounded-full bg-accent-secondary inline-block mr-1.5 animate-pulse" />
            Campus Active
          </div>
        </div>
      </div>
    </footer>
  );
};
