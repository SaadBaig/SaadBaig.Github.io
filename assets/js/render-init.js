/* Card render bootstrap.

   Finds grid containers marked with data-cards and fills them from the
   canonical project list. Runs as a progressive enhancement BEFORE main.js so
   the generated cards get tilt/reveal wired up.

   data-cards values:
     "featured"       homepage Featured grid — the featured subset, in order
     "archive-intro"  projects.html first grid — the first two archive cards
                      (kept above the "Moar" scroll cue, preserving that design)
     "archive-more"   projects.html #more grid — the remaining archive cards

   If SiteData isn't available (script failed to load) the static fallback
   markup already in each grid is left in place. */
(function (global) {
	'use strict';

	function run() {
		var data = global.SiteData;
		if (!data || !data.projects || !data.renderCards) return;

		var targets = document.querySelectorAll('[data-cards]');
		if (!targets.length) return;

		var all = data.projects;
		var featured = data.featuredProjects ? data.featuredProjects() : all.filter(function (p) { return p.featured; });

		// How many cards sit in the archive intro grid (above the scroll cue).
		var INTRO_COUNT = 2;

		targets.forEach(function (target) {
			var kind = target.getAttribute('data-cards');
			var wrapperClass = target.getAttribute('data-card-class') || null;
			var basePath = target.getAttribute('data-img-base') || 'images/';
			var list;

			if (kind === 'featured') {
				list = featured;
			} else if (kind === 'archive-intro') {
				list = all.slice(0, INTRO_COUNT);
			} else if (kind === 'archive-more') {
				list = all.slice(INTRO_COUNT);
			} else {
				return;
			}

			data.renderCards(target, list, { wrapperClass: wrapperClass, basePath: basePath });
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run);
	} else {
		run();
	}
})(window);
