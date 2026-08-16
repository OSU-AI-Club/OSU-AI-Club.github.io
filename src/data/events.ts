import type { ClubEvent } from '../types';
import { MEETING_LOCATION, MEETING_TIME } from './general';

/**
 * The one category list.
 *
 * Drives the filter pills on the Events page, the calendar legend, and the
 * color of every event dot and card accent bar. Add a category by adding a row
 * here — nothing else to touch.
 *
 * `accent` is a design-token name, not a Tailwind class, so raw styling stays
 * out of the content layer. `categoryAccentClass()` and `categoryDotClass()` in
 * src/utils/events.ts map it to the actual utilities. Valid values:
 *
 *   'primary'   blue      'secondary' green     'tertiary' purple
 *   'warm'      amber     'gradient'  blue/green split (HackAI's two-brand mark)
 *
 * Give each category its own accent. Two categories sharing one defeats the
 * legend, and grey is reserved — the calendar's "+N more" dot already uses it.
 * A sixth category needs a new token in index.css and a case in both mappers.
 */
export const EVENT_CATEGORIES = [
  // General sits first because it's the baseline event type — the weekly
  // meeting most visitors are looking for. Reorder freely; the filter pills,
  // legend and calendar all follow this array's order.
  { id: 'General', label: 'General Meetings', accent: 'warm' },
  { id: 'Workshop', label: 'Workshops', accent: 'primary' },
  { id: 'Speaker', label: 'Speakers', accent: 'secondary' },
  { id: 'HackAI', label: 'HackAI', accent: 'gradient' },
  { id: 'Social', label: 'Socials', accent: 'tertiary' },
] as const;

/** Union of the category ids above. `ClubEvent.category` is typed as this. */
export type EventCategory = (typeof EVENT_CATEGORIES)[number]['id'];

/** Accent token names used above, for the class map in utils/events.ts. */
export type CategoryAccent = (typeof EVENT_CATEGORIES)[number]['accent'];

/**
 * Club events.
 *
 * Intentionally empty — the previous entries were placeholder content with
 * invented descriptions and `example.com` links. Add real events here and they
 * appear on the Events page calendar, in the upcoming grid, and (once the date
 * has passed) in the recap strip. Until then every one of those renders a
 * designed empty state.
 *
 * `date` is the ONLY date field: 'YYYY-MM-DD'. The card date badge ('OCT'/'07'),
 * the long form ('Oct 7, 2026'), the weekday, calendar placement, and whether
 * the event counts as past are ALL derived from it at render time — see
 * src/utils/date.ts. Never add `day` / `month` / `dateString` fields back; they
 * used to exist and drifted out of sync because nothing checked them.
 *
 * Template — copy one of these into the array and fill it in:
 *
 *   {
 *     id: 'pytorch-intro',        // kebab-case, unique; used as the React key
 *     category: 'Workshop',       // an id from EVENT_CATEGORIES above
 *     title: 'Intro to PyTorch & Neural Networks',
 *     description: 'One or two sentences shown on the event card.',
 *     date: '2026-10-07',         // YYYY-MM-DD — a Wednesday, per MEETING_DAY
 *     time: MEETING_TIME,         // or a literal, e.g. 'Weekend-long'
 *     location: MEETING_LOCATION, // or a literal, e.g. 'Ohio Union Ballroom'
 *     rsvpUrl: 'https://...',
 *     recapUrl: 'https://...',    // optional; shown once the event is past
 *   }
 *
 * Import MEETING_TIME / MEETING_LOCATION from './general' when you use them, so
 * a room or time change updates every event at once.
 */

export const EVENTS: ClubEvent[] = [
  {
    id: 'au26-intro',           
    category: 'General',           
    title: 'First Meeting',
    description: 'Meet the new board members and have a peek at what we have planned for the year!',
    date: '2026-09-02',           
    time: MEETING_TIME,             
    location: MEETING_LOCATION,    
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',       
  },
  {
    id: 'au26-gen2',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-09-09',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-gen3',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-09-16',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-gen4',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-09-23',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-gen5',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-09-30',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-gen6',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-10-07',
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-gen7',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-10-21',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-gen8',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-10-28',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-gen9',           
    category: 'General',            
    title: 'General Meeting',
    description: 'TBD',
    date: '2026-11-04',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  },
  {
    id: 'au26-last',           
    category: 'General',            
    title: 'Last Meeting',
    description: 'TBD',
    date: '2026-11-18',            
    time: MEETING_TIME,             
    location: MEETING_LOCATION,     
    rsvpUrl: 'https://...',
    recapUrl: 'https://...',        
  }
];
