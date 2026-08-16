import React, { useEffect, useState } from 'react';
import { useReveal } from '../hooks/useReveal';

interface StatItem {
  target: number;
  suffix: string;
  prefix?: string;
  label: string;
}

export const StatsBar: React.FC = () => {
  const statsList: StatItem[] = [
    { target: 120, suffix: '+', label: 'Active Members' },
    { target: 10, suffix: '', label: 'Years Active' },
    { target: 1, suffix: '', label: 'Projects Launched' },
    { target: 5, suffix: 'K', prefix: '$', label: 'HackAI Prize Pool' }
  ];

  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  // Shared reveal observer replaces this component's own; `isRevealed` both
  // fades the band in and starts the count-up.
  const { ref: containerRef, isRevealed: triggered } = useReveal();

  useEffect(() => {
    if (!triggered) return;

    const duration = 1500; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = duration / frameRate;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quadratic
      const easeProgress = progress * (2 - progress);

      const nextCounts = statsList.map((stat) => {
        const currentVal = Math.round(easeProgress * stat.target);
        return Math.min(currentVal, stat.target);
      });

      setCounts(nextCounts);

      if (frame >= totalFrames) {
        setCounts(statsList.map((stat) => stat.target));
        clearInterval(interval);
      }
    }, frameRate);

    return () => clearInterval(interval);
  }, [triggered]);

  return (
    // The whole band reveals as one unit. The stat cells must NOT be wrapped
    // individually — `divide-y`/`divide-x` below draws separators between direct
    // children, and an extra wrapper per cell would remove them.
    <div
      id="homepage-stats-band"
      ref={containerRef}
      data-reveal=""
      {...(triggered ? { 'data-revealed': '' } : {})}
      className="bg-bg-elevated border-y border-border-subtle shadow-card py-6 md:py-8 z-20 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-border-subtle/50">
        {statsList.map((item, idx) => (
          <div
            key={idx}
            id={`stat-item-box-${idx}`}
            className="flex flex-col items-center justify-center py-4 md:py-2 px-4 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-baseline font-mono text-[42px] md:text-[48px] font-bold text-accent-primary leading-none tracking-tight">
              {item.prefix && <span className="text-[28px] md:text-[32px] font-sans font-semibold mr-0.5">{item.prefix}</span>}
              <span>{counts[idx]}</span>
              {item.suffix && <span className="text-[28px] md:text-[32px] font-sans font-semibold ml-0.5">{item.suffix}</span>}
            </div>
            
            <div className="text-center font-sans text-[11px] md:text-[12px] font-semibold text-text-muted mt-2 uppercase tracking-widest">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
