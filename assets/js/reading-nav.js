/* Reading-progress nav — builder + rail driver (single source).

   The floating back/GitHub nav appears on 13 pages. Rather than hand-copying
   the top rail element and the (large) GitHub SVG into every page, this script:

     1. Injects the top progress rail once (the .reading-nav's sibling), so the
        rail markup isn't duplicated 13×.
     2. Injects the shared GitHub octocat SVG into the .nav-repo control, so the
        ~600-char path isn't duplicated ~11×.
     3. Drives the rail fill as the visitor scrolls (was progress-nav.js).

   PROGRESSIVE ENHANCEMENT: the nav's back + GitHub links are real <a> elements
   in the HTML (crawlable, work with JS off). This only adds the decorative rail
   and the icon glyph. rAF-throttled + passive scroll; self-contained; defer-safe
   (runs its build immediately since the nav is parsed above it, and updates on
   DOMContentLoaded/scroll). */
(function () {
	'use strict';

	// GitHub "octocat" mark — defined once here instead of inline on every page.
	var GH_PATH = 'M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z';
	var SVG_NS = 'http://www.w3.org/2000/svg';

	var nav = document.querySelector('.reading-nav');
	if (!nav) return;

	// 1. Inject the progress rail once, before the nav, unless already present.
	var rail = document.querySelector('.reading-rail');
	if (!rail) {
		rail = document.createElement('div');
		rail.className = 'reading-rail';
		rail.setAttribute('aria-hidden', 'true');
		var fillEl = document.createElement('div');
		fillEl.className = 'reading-rail-fill';
		rail.appendChild(fillEl);
		nav.parentNode.insertBefore(rail, nav);
	}

	// 2. Inject the GitHub icon into the repo control (if it lacks one).
	var repo = nav.querySelector('.nav-repo');
	if (repo && !repo.querySelector('svg')) {
		var svg = document.createElementNS(SVG_NS, 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('aria-hidden', 'true');
		svg.setAttribute('focusable', 'false');
		var path = document.createElementNS(SVG_NS, 'path');
		path.setAttribute('d', GH_PATH);
		svg.appendChild(path);
		repo.appendChild(svg);
	}

	// 3. Drive the rail fill on scroll (0% at top → 100% at bottom).
	var fill = rail.querySelector('.reading-rail-fill');
	if (!fill) return;

	var ticking = false;

	function update() {
		var doc = document.documentElement;
		var scrollable = (doc.scrollHeight - doc.clientHeight) || 0;
		var pct = scrollable > 0
			? Math.min(100, Math.max(0, (window.pageYOffset / scrollable) * 100))
			: 0;
		fill.style.setProperty('--scroll-progress', pct.toFixed(2) + '%');
		ticking = false;
	}

	function onScroll() {
		if (!ticking) {
			ticking = true;
			window.requestAnimationFrame(update);
		}
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	update();
})();
