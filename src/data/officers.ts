import { Officer } from '../types';

// Officer headshots are bundled assets, not remote URLs: hotlinked CDN images
// (LinkedIn in particular) carry signed expiry params and go dead without warning.
//
// To add a photo for an officer: drop a square crop into assets/profiles/
// named exactly `<officer-id>.webp` (or .png/.jpg/.jpeg) — e.g. the officer
// with id 'jane-doe' below needs assets/profiles/jane-doe.webp. That's it —
// no `photo:` field to add by hand (there isn't one to set below; see the
// `.map()` at the bottom of this file, which is the ONLY place `photo` gets
// attached, for every officer, every build). Vite's `import.meta.glob` scans
// the folder at build time and matches files to officers by id. An officer
// with no matching file just falls back to rendering `initials`.
const profilePhotos = import.meta.glob('../../assets/profiles/*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function photoForOfficer(id: string): string | undefined {
  const match = Object.keys(profilePhotos).find((path) => path.match(new RegExp(`/${id}\\.(webp|png|jpe?g)$`)));
  return match ? profilePhotos[match] : undefined;
}

// Deliberately Omit<Officer, 'photo'>: `photo` is derived, never authored, so
// it can't be typed here without every entry needing one — the `.map()` below
// is what actually attaches it. Same reasoning covers why no entry above sets
// `photo` by hand: doing so once would make it look optional/manual instead
// of automatic, and that's the exact mistake this shape is meant to close off.
type OfficerRecord = Omit<Officer, 'photo'>;

// NOTE: bios below are neutral role descriptions. Replace them with copy each
// officer has written and approved — do not invent internships, labs or research
// interests for a named person.
const OFFICER_RECORDS: OfficerRecord[] = [
  {
    id: 'anirudh-chinthagunta',
    name: 'Anirudh Chinthagunta',
    role: 'President',
    major: 'Computer Science & Engineering',
    year: '3rd Year',
    initials: 'AC',
    bio: 'Leads the club\'s strategic direction and coordinates between all officer teams.',
    socials: {
      linkedin: 'https://www.linkedin.com/in/anirudh-chinthagunta/',
      instagram: "https://www.instagram.com/anirudhchinthagunta/"
    }
  },
  {
    id: 'aayush-paul',
    name: 'Aayush Paul',
    role: 'Vice President',
    major: 'Computer Science and Engineering',
    minor: "Business",
    year: '4th Year',
    initials: 'AP',
    bio: 'Hi everyone! I am a 4th-year Computer Science and Engineering student, pursuing a minor in business through the Integrated Business and Engineering (IBE) Honors Program. I am thrilled to be the Vice President of the AI Club this school year! I joined the club as a general member during my freshman year, and I\'ve loved growing with this community, as I served as a tech committee member and Treasurer along the way. As the Vice President, I am passionate about giving back by engaging in the planning of meetings and events. My main goal is to grow our community and welcome individuals from all majors who share an interest in AI. Feel free to check out my LinkedIn and Portfolio if you would like to connect and learn more about me!',
    socials: {
      linkedin: "https://www.linkedin.com/in/aayushpaul1/",
      website: "https://aayushpaul-portfolio.netlify.app/",
      github: "https://github.com/AayushPaul",
    }
  },
  {
    id: 'maanov-jajodia',
    name: 'Maanov Jajodia',
    role: 'Treasurer',
    major: 'Computer Science and Engineering',
    minor: "Robotics and Autonomous Systems",
    year: '3rd Year',
    initials: 'MJ',
    bio: 'I am working at the Systems and AI Lab at OSU as an Undergraduate Research Assistant. My research interests include Deep Learning and Computer Vision.',
    socials: {
      linkedin: "www.linkedin.com/in/maanavj18 ",
      github: "https://github.com/maanavj18"
    }
  },
  {
    id: 'harker-lecroy',
    name: 'Harker LeCroy',
    role: 'Chief Communications Officer',
    major: 'Computer Science and Engineering',
    year: '4th Year',
    initials: 'HL',
    bio: 'Hi! My name is Harker LeCroy, and I am a fourth-year Computer Science and Engineering student serving as the AI Club\'s Communications Officer, where I lead corporate relations and external communications to support sponsorships and member development. Outside of these responsibilities, I am passionate about software development and ethical AI. Beyond the club, I work as a grader for Foundations I and an engineering tutor at the OSU Care Office. Additionally, I am a member of the Society of Women Engineers (SWE) and Kappa Alpha Theta. In my free time, I enjoy working out, reading, and spending time with friends.',
    socials: {
      linkedin: "http://www.linkedin.com/in/harkerlecroy",
      github: "https://github.com/harkerlecroy"
    }
  },
  {
    id: 'cynthia-song',
    name: 'Cynthia Song',
    role: 'Technology Director',
    major: 'Computer Science and Engineering',
    minor: 'TBD',
    year: 'TBD Year',
    initials: 'CS',
    bio: 'Co-leads the club\'s technical programming, workshop curriculum, and semester project teams.',
    socials: {}
  },
  {
    id: 'evan-menges',
    name: 'Evan Menges',
    role: 'Technology Director',
    major: 'Electrical Engineering, Economics',
    minor: 'Nuclear Engineering',
    year: '4th Year',
    initials: 'EM',
    bio: 'Co-leads the club\'s technical programming, maintains this website, and manages the club\'s developer tooling.',
    socials: {
      linkedin: 'https://www.linkedin.com/in/evan-menges/',
      github: 'https://github.com/3venthatguy',
      website: "https://evanmenges.com"
    }
  },
  {
    id: 'mustafa-elshikh',
    name: 'Mustafa Elshikh',
    role: 'Marketing Officer',
    major: 'Computer Science and Engineering',
    minor: 'Mathematics',
    year: '2nd Year',
    initials: 'ME',
    bio: 'Runs the club\'s social channels, event promotion, and recruitment campaigns.',
    socials: {
      linkedin: 'https://www.linkedin.com/in/melshikh/',
      github: 'https://github.com/mustafa1821'
    }
  },
  {
    id: 'sushmita-sudhan-supriya',
    name: 'Sushmita Sudhan Supriya',
    role: 'Marketing Officer',
    major: 'Computer Science and Engineering',
    minor: 'Business Analytics',
    year: '2nd Year',
    initials: 'SS',
    bio: 'Runs the club\'s social channels, event promotion, and recruitment campaigns.',
    socials: {}
  }
];

// The single wiring point: every officer's `photo` comes from here, matched
// by id against assets/profiles/. Add a new officer above with no `photo`
// field, drop a same-id image in that folder, and this is what connects them
// — there is nowhere else in the app that needs to know the photo exists.
export const OFFICERS: Officer[] = OFFICER_RECORDS.map((officer) => ({
  ...officer,
  photo: photoForOfficer(officer.id),
}));
