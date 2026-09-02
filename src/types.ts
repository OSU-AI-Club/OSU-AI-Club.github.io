export interface Officer {
  id: string;
  name: string;
  role: string;
  major: string;
  minor?: string;
  year: string;
  bio: string;
  /** Second panel of the expanded card. Omitted renders a placeholder, not an empty section. */
  workExperience?: string;
  /** Third panel of the expanded card. Omitted renders a placeholder, not an empty section. */
  funFact?: string;
  /** Resolved URL of a bundled headshot imported in data/officers.ts. Omit to render `initials` instead. */
  photo?: string;
  initials: string;
  socials: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Sponsor {
  /** kebab-case, and also the logo filename: `assets/sponsors/<id>.<ext>`. */
  id: string;
  /** Display name — the `alt` text, and what the tile falls back to with no logo file. */
  name: string;
  /** Resolved URL of a bundled logo, attached by the glob in data/sponsors.ts. Never authored by hand. */
  logo?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  stats: string;
  image: string;
  applyUrl?: string;
}
