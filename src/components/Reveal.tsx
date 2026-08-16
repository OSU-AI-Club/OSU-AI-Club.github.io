import React from 'react';
import { useReveal } from '../hooks/useReveal';

interface RevealProps {
  children: React.ReactNode;
  /** Stagger offset in ms. Use `staggerDelay(idx)` for grids. */
  delay?: number;
  /**
   * Passed to the wrapper. This matters: the wrapper becomes the grid/flex child,
   * so sizing classes the original element relied on (`h-full`, `col-span-*`)
   * have to move here.
   */
  className?: string;
  id?: string;
}

/**
 * Wrapper form of the scroll reveal, for plain card grids where an extra div is
 * harmless.
 *
 * Where the element must stay the *direct* child of its container — `divide-*`
 * separators and `col-span-*` layouts both break otherwise — use
 * `useRevealProps()` from `hooks/useReveal` and spread it onto the existing
 * element instead of wrapping.
 */
export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '', id }) => {
  const { ref, isRevealed } = useReveal();

  return (
    <div
      id={id}
      ref={ref}
      data-reveal=""
      {...(isRevealed ? { 'data-revealed': '' } : {})}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};
