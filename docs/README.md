# Documentation

Developer and AI-agent reference for the **Artificial Intelligence Club at Ohio State** website.

## What this app is

A single-page marketing/informational site for the club. No backend, no database, no CMS, no
authentication. Everything the site displays is **hardcoded under `src/data/`** and compiled into a
static bundle at build time. Deploying = building and serving `dist/`.

## Read these in order

| File | Read it when you need to… |
| --- | --- |
| [architecture.md](architecture.md) | Understand how pages, navigation, scrolling, and the 3D hero fit together |
| [content-and-data.md](content-and-data.md) | **Change any text, officer, event, project, date, link, or image** |
| [styling.md](styling.md) | **Change any color**, font, spacing, or animation — and how light/dark works |
| [known-issues.md](known-issues.md) | Know what's deliberately unfinished before "fixing" it |

## Quick start

```bash
npm install
npm run dev      # dev server on http://localhost:3000
npm run build    # production bundle into dist/
npm run preview  # serve the built dist/ locally
npm run lint     # tsc --noEmit; there is no ESLint config
```

There are **no tests**. `npm run lint` (typecheck) plus `npm run build` is the full verification story;
run both before committing.

## Stack

- **React 19** + **Vite 6**, TypeScript, client-side only
- **Tailwind CSS v4** via `@tailwindcss/vite` — configured in CSS, *not* a `tailwind.config.js`
- **three.js** + **GSAP** — only used by `src/components/NeuralNetworkCanvas.tsx`
- **motion** (Framer Motion) — only used for modal backdrops in `About.tsx` / `Projects.tsx`
- **lucide-react** — all icons

`@google/genai`, `express`, and `dotenv` are in `package.json` but **not imported anywhere**. They are
leftovers from the AI Studio scaffold. `.env.example` and `metadata.json` are likewise scaffold
artifacts; the app reads no environment variables at runtime.

## Repository layout

```text
assets/                 # Source images, imported by JS (NOT a static public/ dir)
├── images/             # AI_Logo_Final.png — navbar, footer, generated favicon
├── profiles/           # Officer headshots, square crops
└── sponsors/           # Sponsor logos for the marquee
docs/                   # You are here
src/
├── main.tsx            # Entry point; builds the favicon on a canvas at runtime
├── App.tsx             # Page state + layout shell
├── data/               # ★ ALL site content lives here — general/officers/events/projects/faqs
├── types.ts            # Officer / ClubEvent / ProjectItem interfaces
├── index.css           # ★ ALL color tokens live here (light + dark)
├── theme.ts            # Light/dark store; persists preference, follows the OS
├── hooks/              # useReveal — shared scroll-reveal observer
├── vite-env.d.ts       # Types image imports (`import x from './y.png'`)
├── pages/              # Home, About, Events, HackAI, Projects, GetInvolved
└── components/         # Shared and section-level components
index.html              # Vite entry HTML + pre-paint theme script
vite.config.ts          # Plugins, `@` alias, HMR toggle
```
