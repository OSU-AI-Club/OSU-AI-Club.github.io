# Events & the Google Calendar sync

Club events on the website come from a Google Calendar named **AIC Public
Calendar**. Nobody edits event data in code any more.

> **AIC Public Calendar** is the only calendar the website reads. Anything on it
> is public; anything not on it does not appear on the site.
>
> Calendar ID: `9d4d51bcbbf901443d1e32bdb25ed366eff8d8078f2799868c6e8f9b6ed3a943@group.calendar.google.com`

**Part 1 is for officers.** Parts 2–5 are for whoever maintains the site.

---

## 1. For officers — adding an event

Add it to the club Google Calendar. That's the whole process. The website picks
it up within a few minutes.

Fill in:

| Google Calendar field | Shows up on the site as |
|---|---|
| **Title** | The event title |
| **Date & time** | The date badge, the calendar dot, and the time line |
| **Where** | The location line. Leave it blank and the card reads "Location TBA" |
| **Description** | The paragraph on the card |
| **Color** | The category tag — see below |

### Pick the category with the event's color

Open the event, click the colored dot next to the calendar name, and choose:

| Color | Category |
|---|---|
| 🍌 **Banana** | General Meeting |
| 🦚 **Peacock** | Workshop |
| 🌿 **Basil** | Speaker |
| 🍅 **Tomato** | HackAI |
| 🍇 **Grape** | Social |
| *(no color / default)* | General Meeting |

Tangerine and Graphite also read as General, Blueberry as Workshop, Sage as
Speaker, Flamingo as HackAI, Lavender as Social — so a near miss still lands in
the right place. Anything else falls back to General.

### Two optional lines in the description

Put either on **its own line**. They're removed before the description is shown,
so they never appear on the site or in anyone's calendar app.

```
Recap: https://photos.app.goo.gl/whatever
Category: Workshop
```

- `Recap:` adds a **View Recap** link to the card after the event has passed.
  Without it the finished card reads "Event Concluded".
- `Category:` overrides the color. Use it when you can't set the color — events
  forwarded from another account sometimes can't be recolored.

### Things that don't work the way you might expect

- **Links in the description become plain text.** Formatting is stripped. Use a
  `Recap:` line, or say "link in Discord".
- **A multi-day event only appears on its first day** on the calendar grid. The
  card still says e.g. "All day · Feb 20 – Feb 21".
- **Events older than about 12 months drop off the site.** They stay in Google
  Calendar; they just stop being published.
- **Deleting and recreating an event** gives it a new identity. Edit in place
  where you can.
- **Private events and events with no title are skipped**, on purpose — that's
  how personal busy-blocks stay off the public site.
- **Events with guests invited on them are skipped.** A public event shouldn't
  have an invitee list, and this is the safety net that keeps a forwarded
  meeting invite — and the guests' email addresses — off the website. If you
  need to coordinate with a speaker, do it on a separate meeting invite and keep
  the public event guest-free.

If the site hasn't caught up after an hour, see §4.

---

## 2. How it works

```
Google Calendar
   ├─ Apps Script trigger ──► GitHub repository_dispatch   (seconds after an edit)
   └─ scheduled cron ──────────────────────────────────►   (every 6 hours, fallback)
   ▼
GitHub Actions:  npm ci → npm run sync:calendar → npm run lint → vite build
                              │
                    src/data/events.generated.json ──inlined by Vite──► dist/
   ▼
GitHub Pages (www.osuaiclub.com)
```

`scripts/sync-calendar.ts` calls the Google Calendar API during the build and
writes `src/data/events.generated.json`. Vite inlines that file into the
JavaScript bundle, so **the visitor's browser never contacts Google** — no API
key reaches the client, there's no loading spinner, and the page works even if
Google is unreachable.

`src/data/events.ts` reads and validates that snapshot and exports `EVENTS`,
the same name the page always imported. `src/data/event-categories.ts` holds the
category list and the color map, shared by the script and the app.

**The committed copy of `events.generated.json` is empty, on purpose.** Every
event on the site comes from the Google Calendar; nothing is hardcoded as a
placeholder. So a clone without an API key builds a site whose Events page shows
its designed empty states, and the page only fills in once a sync has run. CI
overwrites the file before every build and never commits it back, so whatever is
in git is irrelevant to what's deployed.

### Why a build step instead of fetching in the browser

The site is static files on GitHub Pages. There's no server to proxy a request
and nowhere safe to put a key the browser could use.

---

## 3. One-time setup

### a. The public calendar

**AIC Public Calendar** already exists and is already public. To check or
recreate the settings: Google Calendar → **Settings** → pick *AIC Public
Calendar* → **Access permissions** → *Make available to public*, set to
**See all event details**.

Its **Calendar ID** is under **Integrate calendar** in those same settings:

```
9d4d51bcbbf901443d1e32bdb25ed366eff8d8078f2799868c6e8f9b6ed3a943@group.calendar.google.com
```

That ID lives in `GOOGLE_CALENDAR_ID` in `src/data/general.ts` — one place, and
the sync script and the Subscribe link both derive from it. If you ever swap
calendars, change it there and in `scripts/apps-script/Code.gs` (Google's editor
can't import from the repo, so that copy is manual).

### b. Create the API key

1. [Google Cloud Console](https://console.cloud.google.com) → new project.
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **Credentials → Create credentials → API key**.
4. Restrict it: **API restriction = Google Calendar API**.
   **Application restriction = None.**

> Leave Application restriction at *None*. An HTTP-referrer restriction breaks
> server-side calls like this one, and runner IPs are dynamic so an IP
> restriction can't work either. This is the most common way this setup dies.
> The key never ships to the browser, so it isn't exposed by being unrestricted
> in that sense.

5. Add it to the repo: **Settings → Secrets and variables → Actions → New
   repository secret**, named `GOOGLE_CALENDAR_API_KEY`.
   Or: `gh secret set GOOGLE_CALENDAR_API_KEY`.

### c. Install the Apps Script trigger

This is what makes edits show up in minutes instead of within 6 hours.

**Do this signed in as `osuaiclub@gmail.com`, not a personal account.** An
installable trigger belongs to whoever installed it and stops firing when that
person loses calendar access — a trigger installed by a senior dies at
graduation.

The trigger watches **AIC Public Calendar** — `CALENDAR_ID` at the top of
`Code.gs`.

1. [script.google.com](https://script.google.com) → **New project**, name it
   "AI Club — Calendar to Website".
2. Paste in `scripts/apps-script/Code.gs` from this repo.
3. Create a **fine-grained personal access token** on GitHub:
   repository access = this repo only; Repository permissions →
   **Contents: Read and write**; expiry 1 year.
4. Apps Script → **Project Settings → Script properties** → add
   `GITHUB_TOKEN` with that value. Never paste it into the code.
5. Run `installTrigger()` once and approve the permissions prompt.
6. Run `testDispatch()` and confirm a run appears in the repo's Actions tab.

---

## 4. When the site is out of date

Work down this list.

1. **Is the event on AIC Public Calendar?** That is the only calendar the site
   reads, and an event added somewhere else will never appear.
2. **Check the "Synced …" line** under the calendar on the Events page. That's
   when the site last rebuilt.
3. **Actions tab — is the latest run green?** If it's red, open it and read the
   *Sync events from Google Calendar* step. It prints the reason and a summary
   table (events kept, per category, what was skipped and why).
4. **Is the workflow disabled?** GitHub disables scheduled workflows after 60
   days of repository inactivity — which happens most summers. The Actions tab
   shows a banner with an **Enable workflow** button.
5. **Apps Script → Executions.** Did `onCalendarChange` run? A 401 or 403 means
   the PAT expired (they last a year). Apps Script emails the owning account
   when a trigger throws.
6. **Is the calendar still public?** See §3a. A build failing with 403 usually
   means someone tightened the sharing settings.
7. **Force a rebuild:** Actions → *Deploy to GitHub Pages* → **Run workflow**,
   or `gh workflow run "Deploy to GitHub Pages"`.

### Running the sync locally

```bash
export GOOGLE_CALENDAR_API_KEY='AIza...'
npm run sync:calendar -- --dry-run   # print what it would write, change nothing
npm run sync:calendar                # write src/data/events.generated.json
git diff src/data/events.generated.json
```

Without the key it warns and exits 0, keeping whatever snapshot is on disk — so
`npm run dev` works on a fresh clone, it just shows an empty Events page until
you run a sync with a key.

---

## 5. Maintenance

### Rotating the API key

Create a new key (§3b), update the `GOOGLE_CALENDAR_API_KEY` secret, run the
workflow manually to confirm it's green, then delete the old key.

### Rotating the GitHub PAT

Fine-grained tokens expire after at most a year, and the trigger silently stops
working when they do — the 6-hourly cron keeps the site updating, so the symptom
is "changes take hours" rather than "changes never appear". Create a new token
(§3c step 3) and update the `GITHUB_TOKEN` script property.

### Annual handover checklist

- [ ] `GOOGLE_CALENDAR_ID` in `src/data/general.ts` still points at
      **AIC Public Calendar**
- [ ] The Apps Script project is owned by `osuaiclub@gmail.com`, and
      `installTrigger()` was run from that account
- [ ] `GITHUB_TOKEN` in the Apps Script properties hasn't expired
- [ ] `GOOGLE_CALENDAR_API_KEY` still works — check a recent Actions run
- [ ] The calendar is still public with *See all event details*
- [ ] The deploy workflow isn't disabled from summer inactivity
- [ ] The new officers know that events go in Google Calendar, not in code

### Adding a category

Add a row to `EVENT_CATEGORIES` in `src/data/event-categories.ts` with a unique
`accent` and a `googleColorIds` list, then add a case to `categoryAccentClass`,
`categoryDotClass` and `categoryBadgeClass` in `src/utils/events.ts`, and a
token in `src/index.css` if the accent is new. Update the color table in §1.
