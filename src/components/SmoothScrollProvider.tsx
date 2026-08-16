'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Accessibility Guard: detects system preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  // 2. React Lifecycle & Virtual/Interpolated Scroll Mechanics
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const content = contentRef.current;
    if (!content) return;

    let rAFId: number;
    let currentY = window.scrollY;

    // Use default browser scroll behavior as instant so that the lerp engine handles control
    document.documentElement.style.scrollBehavior = 'auto';

    // Physics Loop: CurrentY += (TargetY - CurrentY) * 0.08
    const loop = () => {
      const targetY = window.scrollY;

      // Smart snapping for large jumps (e.g., page navigation / scrollTo(0,0))
      if (Math.abs(targetY - currentY) > window.innerHeight * 1.5) {
        currentY = targetY;
      }

      // Linear Interpolation: CurrentY += (TargetY - CurrentY) * 0.08
      currentY += (targetY - currentY) * 0.08;

      // Rest when close to avoid perpetual subpixel calculations
      if (Math.abs(targetY - currentY) < 0.05) {
        currentY = targetY;
      }

      if (content) {
        // Hardware-accelerated hardware-translation style
        content.style.transform = `translate3d(0px, ${-currentY}px, 0px)`;
        
        // Dispatch custom smoothscroll event with momentum scroll position details
        window.dispatchEvent(new CustomEvent('smoothscroll', {
          detail: { scrollY: currentY }
        }));
      }

      rAFId = requestAnimationFrame(loop);
    };

    // Begin looping
    rAFId = requestAnimationFrame(loop);

    // Event listener to instantly snap scroll position state on navigation reset
    const handleSnap = () => {
      currentY = window.scrollY;
    };
    window.addEventListener('smoothscroll-snap', handleSnap);

    // 3. Dynamic height synchronization to match Next.js dynamic load / client-side routing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;
      const height = entries[0].contentRect.height;
      requestAnimationFrame(() => {
        document.body.style.height = `${height}px`;
      });
    });

    resizeObserver.observe(content);

    // 4. Memory-leak prevention and state cleanup
    return () => {
      cancelAnimationFrame(rAFId);
      resizeObserver.disconnect();
      window.removeEventListener('smoothscroll-snap', handleSnap);
      document.body.style.removeProperty('height');
      document.documentElement.style.removeProperty('scroll-behavior');
    };
  }, [prefersReducedMotion]);

  // Accessibility Fallback: standard native viewport rendered directly
  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <div
      ref={viewportRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      id="smooth-scroll-viewport"
    >
      <div
        ref={contentRef}
        className="w-full absolute top-0 left-0 transition-none will-change-transform"
        id="smooth-scroll-content"
      >
        {children}
      </div>
    </div>
  );
};
