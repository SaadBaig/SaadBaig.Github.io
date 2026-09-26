/* Reading-progress nav — builder + rail driver (single source).

   The floating back nav appears on 13 pages. Rather than hand-copying the top
   rail element into every page, this script injects it once (as the
   .reading-nav's sibling) and drives its fill as the visitor scrolls.

   PROGRESSIVE ENHANCEMENT: the nav's back link is a real <a> in the HTML
   (crawlable, works with JS off); this only adds the decorative rail.
   rAF-throttled + passive scroll; self-contained; defer-safe. */
(function () {
	'use strict';

	var nav = document.querySelector('.reading-nav');
	if (!nav) return;

	// Inject the progress rail once, before the nav, unless already present.
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

	// Drive the rail fill on scroll (0% at top → 100% at bottom).
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
