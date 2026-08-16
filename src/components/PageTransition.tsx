import React, { useState, useEffect, useRef } from 'react';

// Defines the chronological layout order of the site navigation architecture
const PAGE_ORDER = ['home', 'about', 'hackai', 'projects', 'events', 'getinvolved'];

interface PageTransitionProps {
  activePage: string;
  renderPage: (page: string) => React.ReactNode;
  /**
   * Rendered inside the animated container, below the page. The footer has to
   * transition with the page: left outside, it stays frozen on screen through
   * the fade-out and then visibly jumps when the scroll resets.
   */
  footer?: React.ReactNode;
}

type AnimationState = 'idle' | 'fading-out' | 'fading-in-init' | 'fading-in-active';
type Direction = 'forward' | 'backward';

export const PageTransition: React.FC<PageTransitionProps> = ({ activePage, renderPage, footer }) => {
  // Store currently rendered/displayed page ID
  const [displayingPage, setDisplayingPage] = useState<string>(activePage);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [direction, setDirection] = useState<Direction>('forward');

  // Track the previous page to determine direction correctly on page changes
  const lastPageRef = useRef<string>(activePage);

  useEffect(() => {
    // If the active page changed
    if (activePage !== lastPageRef.current) {
      const prevPage = lastPageRef.current;
      lastPageRef.current = activePage;

      // 1. Navigation Index Mapping: Mathematically evaluate the relative movement vector
      const prevIndex = PAGE_ORDER.indexOf(prevPage);
      const targetIndex = PAGE_ORDER.indexOf(activePage);

      // Default to forward/right if page index is not found
      const currentDirection = (targetIndex >= 0 && prevIndex >= 0)
        ? (targetIndex > prevIndex ? 'forward' : 'backward')
        : 'forward';

      setDirection(currentDirection);
      setAnimationState('fading-out');

      // Every timer in the chain is tracked here. Returning a cleanup from inside a
      // setTimeout callback does nothing, so without this a navigation that happens
      // mid-transition leaves the previous chain running and it clobbers the new
      // animation state on its way out.
      const timeouts: ReturnType<typeof setTimeout>[] = [];

      // 3. Timing & Performance: Old page has 500ms to fully transition out
      timeouts.push(setTimeout(() => {
        // Change the mounted DOM content to the new page
        setDisplayingPage(activePage);

        // Scroll to the top of the next page and snap the smooth scroll momentum state immediately
        window.scrollTo({ top: 0, behavior: 'instant' as any });
        window.dispatchEvent(new CustomEvent('smoothscroll-snap'));

        setAnimationState('fading-in-init');

        // Allow the browser to repaint in the pre-positioned state
        timeouts.push(setTimeout(() => {
          setAnimationState('fading-in-active');

          // Completion of the enter animation
          timeouts.push(setTimeout(() => {
            setAnimationState('idle');
          }, 500)); // 500ms duration matches elegant easing timing
        }, 30)); // Quick tick for paint pipeline
      }, 500));

      return () => timeouts.forEach(clearTimeout);
    }
  }, [activePage]);

  // Handle building dynamic styles for hardware acceleration
  const getContainerStyle = (): React.CSSProperties => {
    // Elegant easing curve specified by architectural constraints
    const easing = 'cubic-bezier(0.25, 1, 0.5, 1)';
    const transitionProperty = 'transform 500ms ' + easing + ', opacity 500ms ' + easing;

    switch (animationState) {
      case 'fading-out':
        return {
          willChange: 'transform, opacity',
          transition: transitionProperty,
          opacity: 0,
          transform: `translate3d(${direction === 'forward' ? '-100px' : '100px'}, 0px, 0px)`,
        };

      case 'fading-in-init':
        return {
          willChange: 'transform, opacity',
          transition: 'none',
          opacity: 0,
          transform: `translate3d(${direction === 'forward' ? '100px' : '-100px'}, 0px, 0px)`,
        };

      case 'fading-in-active':
        return {
          willChange: 'transform, opacity',
          transition: transitionProperty,
          opacity: 1,
          transform: 'translate3d(0px, 0px, 0px)',
        };

      case 'idle':
      default:
        return {
          willChange: 'transform, opacity',
          opacity: 1,
          transform: 'translate3d(0px, 0px, 0px)',
        };
    }
  };

  return (
    <div
      style={getContainerStyle()}
      className="w-full relative overflow-visible"
      id="directional-slide-fade-container"
    >
      <main id="main-content-flow" className="w-full">
        {renderPage(displayingPage)}
      </main>
      {footer}
    </div>
  );
};
