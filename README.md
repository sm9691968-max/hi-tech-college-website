# Hi-Tech College Website

Static marketing site for Hi-Tech College, built with plain HTML, CSS, and JavaScript. No build step, no dependencies.

**Live site:** https://sm9691968-max.github.io/hi-tech-college-website/

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Landing page with program, research, and campus teasers |
| Study | `courses.html` | Filterable program catalogue |
| Research | `research.html` | Research themes and groups |
| Events | `events.html` | Campus events, with `.ics` calendar export |
| Updates | `updates.html` | News and announcements |
| Campus life | `campus.html` | Photo gallery, student services, community |
| About | `about.html` | College overview |
| Admissions | `admissions.html` | Application steps and FAQ |
| Login | `login.html` | Demo student portal sign-in |
| Portal preview | `portal.html` | Static preview of the student dashboard |

## Tech notes

- `styles.css` holds all styling, including a dark theme driven by `:root[data-theme="dark"]`.
- `script.js` is loaded with `defer` on every page and guards each feature so pages without a given element do not throw.
- Theme choice and UI state persist in `localStorage` under the `hitech-theme` key.
- Images are hot-linked from Unsplash and fonts from Google Fonts, so the site needs a network connection to render fully.
- `.ics` files (`hi-tech-campus-events.ics`) are generated client-side from the events page for calendar download.

## Demo limitation

`login.html` is a front-end demonstration only. It has no backend, stores nothing on a server, and does not authenticate anyone. Do not enter a real password.

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying

Hosted via GitHub Pages, deployed from the `main` branch root.

To publish a change:

```powershell
git add -A
git commit -m "Describe the change"
git push
```

Pages rebuilds automatically, usually within a minute. Check the live URL afterwards.

## Contact

admissions@hitechcollege.edu
