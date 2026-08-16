import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme';

interface ThemeToggleProps {
  /** `inline` is the compact navbar button; `full` is the wide mobile-drawer row. */
  variant?: 'inline' | 'full';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'inline' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  if (variant === 'full') {
    return (
      <button
        id="mobile-theme-toggle"
        onClick={toggleTheme}
        aria-label={label}
        aria-pressed={isDark}
        className="w-full h-12 flex items-center justify-between px-4 rounded-full border border-border-subtle bg-bg-elevated text-text-primary font-sans text-[15px] font-semibold transition-colors hover:border-accent-primary/40 cursor-pointer"
      >
        <span>{isDark ? 'Dark theme' : 'Light theme'}</span>
        {isDark ? (
          <Moon className="w-4 h-4 text-accent-primary" />
        ) : (
          <Sun className="w-4 h-4 text-accent-primary" />
        )}
      </button>
    );
  }

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-border-subtle bg-bg-elevated/60 text-text-nav hover:text-accent-primary hover:border-accent-primary/40 transition-colors cursor-pointer"
    >
      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
};
