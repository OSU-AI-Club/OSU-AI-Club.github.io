import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import aiLogo from '../../assets/images/AI_Logo_Final.png';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

/**
 * How long after the boot band clears before the header drops in, in ms.
 *
 * The header is the one fixed element on screen, so landing it at the same
 * moment as the hero reads as two things arriving at once. Holding it back by
 * roughly one reveal step lets the hero start first and the chrome settle after.
 * Keep it under ~600ms — longer and the page looks like it is missing its nav.
 */
const NAV_ENTRANCE_DELAY = 420;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Held while the boot splash is up — see the `data-booting` contract in
   * docs/architecture.md. Fails open: an absent attribute (session-skip path, or
   * reduced motion, where there is no band to arrive behind) means visible from
   * the first frame, and the splash's 8s safety net dispatches the event even
   * when the load it was waiting on never completes.
   */
  const [entered, setEntered] = useState(
    () =>
      typeof document === 'undefined' ||
      !document.documentElement.hasAttribute('data-booting') ||
      prefersReducedMotion(),
  );

  useEffect(() => {
    if (entered) return;
    let timer: number | undefined;
    const onBoot = () => {
      timer = window.setTimeout(() => setEntered(true), NAV_ENTRANCE_DELAY);
    };
    window.addEventListener('aic:boot-complete', onBoot, { once: true });
    return () => {
      window.removeEventListener('aic:boot-complete', onBoot);
      if (timer !== undefined) clearTimeout(timer);
    };
    // Runs once: `entered` only ever goes false -> true, and the guard above
    // makes a re-run after that a no-op.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = (e?: Event) => {
      let scrollY = window.scrollY;
      if (e && (e as CustomEvent).detail && typeof (e as CustomEvent).detail.scrollY === 'number') {
        scrollY = (e as CustomEvent).detail.scrollY;
      }
      if (scrollY > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('smoothscroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('smoothscroll', handleScroll);
    };
  }, []);

  const navItems = [
    { label: 'About Us', id: 'about' },
    { label: 'HackAI', id: 'hackai' },
    { label: 'Projects', id: 'projects' }, // on home page, anchors to projects list
    { label: 'Events', id: 'events' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === activePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigate(id);
    }
  };

  return (
    <>
      <nav
        id="main-navigation-header"
        className={`fixed top-0 left-0 right-0 w-full z-50 h-[72px] transition-all duration-350 flex items-center ${
          scrolled || activePage !== 'home'
            ? 'bg-nav-scrim backdrop-blur-xl border-b border-border-subtle shadow-[0_1px_12px_var(--ui-shadow-color)]'
            : 'bg-transparent'
        } ${
          // Boot entrance. `pointer-events-none` matters: an invisible header
          // still sits over the top 72px of the hero and would swallow clicks.
          entered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        {/* The left and right rails both carry `flex-1` so they claim equal width.
            Without that, `justify-between` centers the nav links between a 36px
            logo and a ~200px toggle+CTA cluster, which visibly pulls them left. */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between">

          {/* Left rail: Logo Mark */}
          <div className="flex-1 flex justify-start">
            <div
              id="nav-brand-logo"
              className="flex items-center cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <div className="w-9 h-9 flex items-center justify-center bg-surface-inverse rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_4px_16px_var(--ui-shadow-color)]">
                <img
                  src={aiLogo}
                  alt="AI @ OSU Logo"
                  className="w-5.5 h-5.5 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Center: Desktop Nav Links */}
          <div id="desktop-nav-links" className="hidden md:flex items-center space-x-10 shrink-0">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative font-sans text-[15px] font-medium tracking-wide py-1 border-b-2 transition-colors duration-250 cursor-pointer ${
                    isActive
                      ? 'text-accent-primary border-accent-primary'
                      : 'text-text-nav border-transparent hover:text-accent-primary'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right rail: theme toggle + CTA on desktop, hamburger on mobile */}
          <div className="flex-1 flex justify-end items-center">

            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <button
                id="nav-join-cta-button"
                onClick={() => handleNavClick('getinvolved')}
                className="h-[38px] px-5 bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-[14px] font-semibold rounded-full flex items-center space-x-1.5 whitespace-nowrap shadow-[0_4px_14px_var(--ui-accent-glow)] hover:shadow-[0_6px_20px_var(--ui-accent-glow)] transform hover:scale-[1.03] transition-all duration-200 cursor-pointer"
              >
                <span>Get Involved</span>
                <span className="text-[16px] leading-none mb-0.5">›</span>
              </button>
            </div>

            {/* Mobile Hamburguer */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-text-primary p-1 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 top-[72px] bg-bg-primary/95 backdrop-blur-2xl z-40 flex flex-col px-6 py-8 md:hidden shadow-lg animate-fade-in border-t border-border-subtle"
        >
          <div className="flex flex-col space-y-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className="text-[18px] font-display font-semibold text-text-primary text-left py-2 border-b border-border-subtle focus:text-accent-primary"
              >
                {item.label}
              </button>
            ))}

            <button
              id="mobile-nav-join-button"
              onClick={() => handleNavClick('getinvolved')}
              className="w-full h-12 bg-accent-primary text-on-accent font-sans font-semibold rounded-full flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Get Involved</span>
              <span className="text-[18px]">›</span>
            </button>

            <ThemeToggle variant="full" />
          </div>
        </div>
      )}
    </>
  );
};
