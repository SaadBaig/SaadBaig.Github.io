# Project map — Saad Baig portfolio

Static GitHub Pages site. Vanilla HTML/CSS/JS only — **no build step, no
frameworks, no third-party runtime dependencies**. Fonts are self-hosted
(Poppins woff2 in `assets/fonts/poppins/`). Respect `prefers-reduced-motion`
in any motion work.

> This file is the source of truth for what exists in the workspace. The
> session-start file tree can be stale — trust this map (and a fresh
> `list_directory` when in doubt) over memory of earlier sessions.

## Top-level pages (repo root)
- `index.html` — homepage: hero banner → About → Proof (stat labels + two
  auto-scrolling logo marquees) → Featured Projects grid → footer.
- `projects.html` — full project archive: 8 cards, each a `.proj-card` wrapper
  around an `a.box` link. Routing worth noting: the "TryHackMe" card links to
  `projects/writeups.html`, "Reverse Engineering" links to
  `projects/reverse-engineering.html`, and Python/Exploit-dev/ML cards link
  straight out to GitHub.

## Project / detail pages (`projects/`)
- `pqcscan.html`, `ddos-defcon-2026.html`, `pentesting-methodology.html`,
  `tryhackme.html` — project detail pages.
- `reverse-engineering.html` — RE landing page (hero + a WannaCry `.re-card`
  that links to `wannacry.html`).
- `wannacry.html` — renders the WannaCry write-up markdown via `render.js`.
- `writeups.html` — grid of TryHackMe write-up cards (`.wu-card`) linking to:
- `writeup-blog.html`, `writeup-lazyadmin.html`, `writeup-ps-empire.html`,
  `writeup-reversing-elf.html`, `writeup-blue.html`.
- Shared: `project.css` (detail-page shell styles), `render.js` (fetches a
  README from GitHub raw + renders markdown; supports `data-repo`,
  `data-branch`, `data-path` subfolder, `data-file`), `marked.min.js`,
  `hero-tilt.js` (pointer-tracking 3D tilt).
- `hero-tilt.js` is loaded on ONLY three detail pages: `pqcscan.html`,
  `ddos-defcon-2026.html`, `pentesting-methodology.html`. It is NOT on
  `reverse-engineering.html` (that page has its OWN inline tilt script for its
  `.re-card`), nor on `wannacry.html`, `tryhackme.html`, or the `writeup-*`
  pages.
- The `writeup-*` pages + `wannacry.html` all render via `render.js` from the
  `SaadBaig/TryHackMe` (branch `master`) or `SaadBaig/Reverse-Engineering`
  repos using `data-path` subfolders (e.g. `Blue`, `LazyAdmin`, `PS Empire`,
  `Reversing ELF`, `Blog`, `WannaCry`).

## Scripts / styles
- `assets/css/main.css` — all homepage + shared styles.
- `assets/js/main.js` — homepage behavior. Init functions include the slider,
  scroll-reveal, dot-nav, proof marquee (`initProofMarquee`), a project scroll
  cue (`initProjScrollCue`), and card tilt (`initCardTilt`). The tilt binds
  `a.box, .proof-tile, .glass-panel` and is skipped for reduced-motion / coarse
  pointers.
- `assets/js/enhance.js` — progressive enhancements (console greeting, easter
  eggs). **Contains `unregisterSW()` which is called on load.**

## IMPORTANT: no service worker
There is **no `sw.js`** and no offline cache. The service worker was removed;
`enhance.js` actively unregisters any previously-registered SW. **Do not
recreate `sw.js` or "bump a cache version" — that step no longer exists.** If
cache-busting is ever needed, do it via asset query strings or filenames.

## Image folders (`images/`)
`backgrounds/`, `banner/`, `certlogo/`, `projects/`, `speaklogo/`, `writeups/`.
- Banner slides → `banner/`; cert logos → `certlogo/`; speaking logos →
  `speaklogo/`; project card art → `projects/`; write-up art → `writeups/`;
  decorative section backgrounds → `backgrounds/`.
- There is **no** `images/logo/` or `images/logos/` folder — never reference one.

## Root static assets
`favicon.svg`, `icon-180.png`, `icon-192.png`, `icon-512.png`, `CNAME`,
`readme.md`, and `root/index.html`. There is **no** `manifest.webmanifest`
(and no `sw.js`) — do not reference or recreate them.

## Verification (no server framework)
Serve locally with `python3 -m http.server` (run as a background process, not
a blocking bash call). Sanity checks used: `curl` for HTTP status, brace
balance on CSS (`grep -o '{' | wc -l` vs `}`), `node --check` on JS files.
