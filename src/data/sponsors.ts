import { Sponsor } from '../types';

// Sponsor logos are bundled assets matched to entries by `id`, exactly like
// officer headshots in officers.ts — same reasoning, same mechanics.
//
// TO CHANGE A LOGO: replace assets/sponsors/<id>.<ext> with the new file. The
// extension may change (png -> webp is fine); nothing here needs editing.
//
// TO ADD A SPONSOR: add a row below and drop assets/sponsors/<that-id>.<ext>
// next to the others. Vite's `import.meta.glob` scans the folder at build time,
// so there is no import to write and no path to keep in sync.
//
// TO REMOVE ONE: delete its row. The file can stay — an image nothing imports
// is never shipped. Files in assets/sponsors/unused/ are excluded by the glob
// (it does not recurse), which is where alternate crops live.
const sponsorLogos = import.meta.glob('../../assets/sponsors/*.{webp,png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function logoForSponsor(id: string): string | undefined {
  const match = Object.keys(sponsorLogos).find((path) => path.match(new RegExp(`/${id}\.(webp|png|jpe?g|svg)$`)));
  return match ? sponsorLogos[match] : undefined;
}

// Deliberately Omit<Sponsor, 'logo'>: `logo` is derived, never authored, so no
// entry below can set it by hand — the `.map()` at the bottom is the only place
// it gets attached. Same shape as OFFICER_RECORDS, for the same reason.
type SponsorRecord = Omit<Sponsor, 'logo'>;

// ORDER IS DISPLAY ORDER — the marquee scrolls this list left to right and then
// repeats it. Reorder freely; nothing keys off position.
//
// Note that every name here is a real company making a real claim: the band is
// labelled "Presenting Partners" in SponsorsBar.tsx. Only list an organization
// the club actually has a sponsorship or partnership with, and change that
// label if the relationship is something weaker.
const SPONSOR_RECORDS: SponsorRecord[] = [
  { id: '99p-labs', name: '99P Labs' },
  { id: 'cisco', name: 'Cisco' },
  { id: 'jane-street', name: 'Jane Street' },
  { id: 'jpmorgan-chase', name: 'JPMorgan Chase' },
  { id: 'capital-one', name: 'Capital One' },
  { id: 'nationwide', name: 'Nationwide' },
  { id: 'google', name: 'Google' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'ibm', name: 'IBM' },
  { id: 'intel', name: 'Intel' },
  { id: 'waymo', name: 'Waymo' },
  { id: 'rockwell-automation', name: 'Rockwell Automation' },
  { id: 'te-connectivity', name: 'TE Connectivity' },
  { id: 'velocity', name: 'Velocity Software' },
  { id: 'ai-futures', name: 'AI Futures' },
];

// The single wiring point: every sponsor's `logo` comes from here, matched by
// id against assets/sponsors/. A sponsor with no matching file is not an error
// — SponsorsBar renders its `name` as a wordmark instead.
export const SPONSORS: Sponsor[] = SPONSOR_RECORDS.map((sponsor) => ({
  ...sponsor,
  logo: logoForSponsor(sponsor.id),
}));
