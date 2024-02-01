This is the AI Club website redesign. We will be working in NextJS.

## Running in a Dev Environment
1. Install the latest LTS version of NodeJS on your computer. https://nodejs.org/en
2. Clone the repository.
3. In a command line, cd to this folder and run "npm i". This will install all dependencies automatically.
4. To test dependencies, run "npm run dev". You should see something similar to this:
```
> next dev

    Next.js 14.1.0
    - Local:    http://localhost:3000
```
Go to the URL located next to "Local: ". The port may be different (I know on macOS, Airplay sometimes takes up port 3000).

## Folder Structure
- NextJS uses Filesystem Routing. Within the foler named "app", the folder structure follows the URL structure of the website.
- Any file named "page.jsx" is the main page for the URL implied by the folder. Edit this file to change the contents of the page.
- NextJS supports a few other page types, including "loading.jsx" and "error.jsx" in each subdirectory. We will use these as needed.
- Do NOT put React components within subfolders in the app directory. Use the global components folder.
- We will add new subdirectories as needed. Add any extra pages that you add to the following list before marking your task as finished.
<a />
app/page.jsx: Home Page \
app/meetings/page.jsx: Meetings Page \
app/meetings/archive/page.jsx: Meetings Archives Pages \
app/hackai/page.jsx: HackAI Page \
app/researchexpo/page.jsx: Research Expo Page \
app/resources/page.jsx: Student Resources Page \
app/sponsors/page.jsx: Sponsors Page \

public/: Website Resources Directory (Try to keep it organized) \
app/components/: Components Directory \