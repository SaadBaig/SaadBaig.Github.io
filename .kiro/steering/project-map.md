# Project map — Saad Baig portfolio

Static GitHub Pages site. Vanilla HTML/CSS/JS only — **no build step, no
frameworks, no third-party runtime dependencies**. Fonts are self-hosted
(Poppins woff2 in `assets/fonts/poppins/`). Respect `prefers-reduced-motion`
in any motion work.

> This file is the source of truth for what exists in the workspace. The
> session-start file tree can be stale — trust this map (and a fresh
> `list_directory` when in doubt) over memory of earlier sessions.

## Data-driven / define-once-call patterns (IMPORTANT)
Repeated UI is generated from a single source, not hand-copied. When adding or
editing repeated elements, extend the source — do not paste duplicates.
- **Project cards** — one canonical list in `assets/js/projects-data.js`;
  `assets/js/render-cards.js` builds the card markup; `assets/js/render-init.js`
  fills grids marked `[data-cards="featured"|"archive"]`. Static cards remain in
  the HTML as the crawlable/no-JS fallback and are replaced at runtime.
- **Proof marquee** — each logo tile authored ONCE; `assets/js/marquee-clone.js`
  generates the `aria-hidden` loop-duplicate + derives the count numbers.
- **Tilt** — SINGLE implementation `assets/js/tilt.js`. Included once per
  selector/intensity via `data-tilt-selector` + `data-tilt-max` +
  `data-tilt-shift` (a page may include it multiple times; each `<script>` tag
  claims its own config). There is no other tilt code (`initCardTilt` and the
  old inline/`hero-tilt.js` copies are gone).
- **Reading-progress nav** — `assets/css/reading-nav.css` (shared styles) +
  `assets/js/reading-nav.js` (injects the top rail + the GitHub SVG, and drives
  the rail fill on scroll). The back/GitHub `<a>` links stay in the HTML.
- **Footer** — every page: `Built by <span class="built-name">Saad Baig</span>`
  (detail pages) or `.copyright-name` (index/projects). The name is coloured
  `rgb(var(--glow))` so it matches each page's accent; no inline hexes.

## Top-level pages (repo root)
- `index.html` — homepage: hero banner → About → Proof (two auto-scrolling logo
  marquees) → Featured Projects grid → footer. Loads `main.css`. Featured cards
  render from the shared data. Has the dot-nav + hero scroll-cue (NOT the
  reading-nav). Footer `--glow` = `201, 143, 192`.
- `projects.html` — full project archive: 9 cards in ONE `.grid-style`
  (`data-cards="archive"`, `.proj-card` wrappers around `a.box`). Loads
  `main.css` + `reading-nav.css`. Uses the floating reading-nav (Home button
  only, no repo). Footer `--glow` = `0, 218, 234`. Routing: "TryHackMe" →
  `projects/writeups.html`, "Reverse Engineering" →
  `projects/reverse-engineering.html`; Python/Exploit-dev/ML link out to GitHub
  (open in a new tab).

## Project / detail pages (`projects/`)
- README-render pages (via `render.js`): `pqcscan.html`,
  `ddos-defcon-2026.html`, `pentesting-methodology.html`, `cpts.html`,
  `tryhackme.html`, `wannacry.html`, and `writeup-{blog,lazyadmin,ps-empire,
  reversing-elf,blue}.html`.
- `reverse-engineering.html` — RE landing page (hero + a WannaCry card using the
  shared `.glow-card`, with a red accent scoped via `.re-card-wrap`).
- `writeups.html` — grid of TryHackMe write-up cards using the shared
  `.glow-card` (`.wu-grid` adds the 16:9 image band inline).
- Every detail page links `project.css` + `reading-nav.css`, shows the floating
  reading-nav (back button + GitHub button), and sets its own `:root --glow`.
- Shared detail-page assets: `project.css` (shell + `.glow-card` + `.proj-hero`
  + footer), `render.js` (fetches a README from GitHub raw + renders markdown;
  `data-repo`, `data-branch`, `data-path`, `data-file`), `marked.min.js`.
- Detail-page --glow accents: pqcscan `240,154,58`; ddos `9,174,191`;
  pentesting `46,191,145`; cpts `138,92,209`; tryhackme/writeup-blog/blue
  `112,157,191`; wannacry/reverse-engineering/writeup-reversing-elf `0,218,234`;
  writeup-lazyadmin `46,202,113`; writeup-ps-empire `191,0,107`.
- README subfolders: `writeup-*` + `wannacry.html` render from
  `SaadBaig/TryHackMe` (branch `master`) or `SaadBaig/Reverse-Engineering` via
  `data-path` (e.g. `Blue`, `LazyAdmin`, `PS Empire`, `Reversing ELF`, `Blog`,
  `WannaCry`). pqcscan/ddos/pentesting/cpts use branch `main`, no subfolder.

## Shared scripts / styles
- `assets/css/main.css` — homepage + projects.html + shared base styles.
- `assets/css/reading-nav.css` — the floating nav + progress rail (linked by
  projects.html + all 12 detail pages; NOT index.html).
- `projects/project.css` — detail-page shell, `.glow-card`, `.proj-hero`,
  `.proj-footer` (+ `.built-name`).
- `assets/js/main.js` — homepage behavior: slider, caption fade, scroll-reveal
  (`[data-reveal]`), dot-nav, proof marquee (`initProofMarquee`). (Tilt is NOT
  here anymore — it's `tilt.js`.)
- `assets/js/enhance.js` — progressive enhancements (console greeting, easter
  eggs incl. `enterRoot()` → `root/index.html`). **Contains `unregisterSW()`
  called on load.**
- `assets/js/{projects-data,render-cards,render-init,marquee-clone,tilt}.js` and
  `assets/js/reading-nav.js` — the shared modules described above.
- `projects/marked.min.js` — markdown parser, loaded only by README-render pages.

## Links / new tabs
External links (GitHub, LinkedIn) open in a new tab (`target="_blank"
rel="noopener"`); internal links navigate in place.

## IMPORTANT: no service worker
There is **no `sw.js`** and no offline cache. `enhance.js` actively unregisters
any previously-registered SW. **Do not recreate `sw.js` or "bump a cache
version."** If cache-busting is ever needed, use asset query strings/filenames.

## Image folders (`images/`)
`backgrounds/`, `banner/`, `certlogo/`, `projects/`, `speaklogo/`, `writeups/`.
- Banner slides → `banner/`; cert logos → `certlogo/`; speaking logos →
  `speaklogo/`; project card art → `projects/`; write-up art → `writeups/`;
  decorative section backgrounds → `backgrounds/`.
- Decorative backdrops are downscaled to 1920×1080; banners are kept at full
  quality. All image files are genuine WebP (a couple were fixed from
  PNG/JPEG-in-webp-clothing).
- There is **no** `images/logo/` or `images/logos/` folder — never reference one.

## Root static assets
`favicon.svg`, `icon-180.png`, `icon-192.png`, `icon-512.png`, `CNAME`,
`readme.md`, and `root/index.html` (reached via the enhance.js easter egg).
There is **no** `manifest.webmanifest` (and no `sw.js`) — do not recreate them.

## Verification (no server framework)
Serve locally with `python3 -m http.server` (as a background process, not a
blocking bash call). Sanity checks: `curl` for HTTP status, CSS brace balance
(`grep -o '{' | wc -l` vs `}`), `node --check` on JS files.
