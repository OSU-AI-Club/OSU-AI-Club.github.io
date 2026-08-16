import { useSyncExternalStore } from 'react';

/**
 * Theme store.
 *
 * Deliberately a plain external store rather than React context: the three.js
 * hero (NeuralNetworkCanvas) is imperative and needs to react to theme changes
 * from inside a `useEffect` without that effect re-running and tearing down the
 * WebGL scene. React components use `useTheme()`; the canvas uses `subscribe()`.
 *
 * `preference` is what the user chose ('system' means "follow the OS").
 * `resolvedTheme` is what is actually on screen, and is what the `dark` class
 * on <html> reflects.
 */

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** Must stay in sync with the pre-paint script in index.html. */
export const THEME_STORAGE_KEY = 'osu-aic-theme';

const listeners = new Set<() => void>();

const media = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null;

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private browsing / storage disabled — fall through to the OS setting.
  }
  return 'system';
}

let preference: ThemePreference = typeof window !== 'undefined'
  ? readStoredPreference()
  : 'system';

function systemTheme(): ResolvedTheme {
  return media?.matches ? 'dark' : 'light';
}

function resolve(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? systemTheme() : pref;
}

// Cached so useSyncExternalStore's getSnapshot returns a stable value; returning
// a fresh object each call would loop forever.
let resolvedTheme: ResolvedTheme = typeof window !== 'undefined' ? resolve(preference) : 'light';

function applyToDocument(theme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function emit() {
  listeners.forEach((fn) => fn());
}

function recompute() {
  const next = resolve(preference);
  if (next === resolvedTheme) return;
  resolvedTheme = next;
  applyToDocument(next);
  emit();
}

// Only relevant while the preference is 'system'; recompute() is a no-op otherwise.
media?.addEventListener('change', recompute);

export function getPreference(): ThemePreference {
  return preference;
}

export function getResolvedTheme(): ResolvedTheme {
  return resolvedTheme;
}

export function setPreference(next: ThemePreference) {
  preference = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Not fatal — the theme still applies for this session.
  }
  recompute();
  emit(); // preference itself changed even when the resolved theme did not
}

/** Flip between light and dark, dropping out of 'system'. */
export function toggleTheme() {
  setPreference(resolvedTheme === 'dark' ? 'light' : 'dark');
}

/** Returns an unsubscribe function. Used directly by the imperative canvas. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Reconciles the class the pre-paint script set with the store's own view.
 * Called once from main.tsx before render.
 */
export function initTheme() {
  applyToDocument(resolvedTheme);
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getResolvedTheme,
    () => 'light' as ResolvedTheme,
  );
  const pref = useSyncExternalStore(
    subscribe,
    getPreference,
    () => 'system' as ThemePreference,
  );
  return { theme, preference: pref, setPreference, toggleTheme };
}
