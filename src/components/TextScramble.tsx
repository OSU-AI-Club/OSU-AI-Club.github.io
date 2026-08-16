import React, { useState, useEffect, useRef } from 'react';

const GLITCH_CHARS = "0123456789%@$#&?<>X_";

export interface TextScrambleProps {
  id: string;
  text: string;
  className?: string;
  delay?: number;       // Delay in ms before starting the animation
  stagger?: number;     // Number of frames to stagger each character's reveal
  lockCycles?: number;  // Base number of frames a character scrambles before locking
  intervalMs?: number;  // Duration of each frame in ms
}

export const TextScramble: React.FC<TextScrambleProps> = ({
  id,
  text,
  className = '',
  delay = 0,
  stagger = 2,
  lockCycles = 6,
  intervalMs = 40,
}) => {
  const [frame, setFrame] = useState<number>(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute total characters including spaces
  const totalLength = text.length;
  // Account for staggering and base lock cycles
  const maxFrame = (totalLength - 1) * stagger + lockCycles + 3;

  useEffect(() => {
    // Clear any existing intervals and delays
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setFrame(-1);

    const runScramble = () => {
      setFrame(0);

      timerRef.current = setInterval(() => {
        setFrame(prev => {
          if (prev >= maxFrame) {
            if (timerRef.current) clearInterval(timerRef.current);
            return maxFrame;
          }
          return prev + 1;
        });
      }, intervalMs);
    };

    let startDelayTimer: NodeJS.Timeout | null = null;
    if (delay > 0) {
      startDelayTimer = setTimeout(runScramble, delay);
    } else {
      runScramble();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (startDelayTimer) clearTimeout(startDelayTimer);
    };
  }, [text, delay, stagger, lockCycles, intervalMs, maxFrame]);

  // Break text into words to prevent individual characters from breaking across lines
  let globalCharIndex = 0;
  const words = text.split(' ');

  const wordElements = words.map((word, wordIndex) => {
    const chars = word.split('').map((originalChar) => {
      const idx = globalCharIndex++;
      const startFrame = idx * stagger;
      
      // Introduce an organic digital organic texture: some characters scramble slightly longer than others
      const charLockCycles = lockCycles + (idx % 3);
      const lockFrame = startFrame + charLockCycles;

      let contentChar: string;
      let spanClass = '';
      const style: React.CSSProperties = {};

      if (frame < startFrame) {
        // 1. Initial State: hidden / blank spacing
        contentChar = '';
        spanClass = 'opacity-0';
      } else if (frame >= startFrame && frame < lockFrame) {
        // 2. Glitching Scramble State
        // Pick a fast-updating, frame-dependent random character
        const charSeed = (frame + idx) % GLITCH_CHARS.length;
        contentChar = GLITCH_CHARS[charSeed];
        spanClass = 'font-bold text-accent-secondary brightness-125 transition-transform duration-75';
        // Cyber glow shader effect mirroring the website colors
        style.textShadow = '0 0 8px var(--ui-accent-secondary-dim), 0 0 15px var(--ui-accent-primary-dim)';
      } else {
        // 3. Locked Decoded State
        contentChar = originalChar;
        spanClass = 'text-text-primary transition-colors duration-300';
      }

      // Each slot is sized by an invisible copy of the FINAL character, with the
      // current frame's character painted over it. `font-mono` is Roboto here
      // like everything else (see index.css), so a `%` or `@` is materially
      // wider than the letter it stands in for \u2014 measuring the live character
      // would make the heading's width, and therefore its line count, change on
      // every frame and shove the rest of the hero around mid-animation.
      return (
        <span
          key={idx}
          id={`${id}-character-${idx}`}
          className="relative inline-block text-center align-baseline"
        >
          <span aria-hidden="true" className="invisible">
            {originalChar}
          </span>
          <span
            className={`absolute inset-0 font-mono ${spanClass}`}
            style={style}
          >
            {contentChar}
          </span>
        </span>
      );
    });

    const isLastWord = wordIndex === words.length - 1;
    if (!isLastWord) {
      // Increment index for the trailing space to ensure uniform staggering
      globalCharIndex++;
    }

    return (
      <span
        key={wordIndex}
        id={`${id}-word-wrapper-${wordIndex}`}
        className="inline-block whitespace-nowrap"
      >
        {chars}
        {!isLastWord && (
          <span
            id={`${id}-word-space-${wordIndex}`}
            className="font-mono text-text-primary"
          >
            {'\u00A0'}
          </span>
        )}
      </span>
    );
  });

  // Runs once on mount only. It used to re-trigger on hover, which meant page
  // headings re-scrambled every time the pointer crossed them.
  return (
    <span
      id={id}
      className={`inline font-mono select-none ${className}`}
    >
      {wordElements}
    </span>
  );
};
