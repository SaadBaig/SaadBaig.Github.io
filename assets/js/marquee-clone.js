/* Marquee loop-clone generator.

   The proof marquees (speaking + certifications) scroll seamlessly by holding
   TWO identical sets of logo tiles: the real set, then an aria-hidden duplicate.
   Both the CSS keyframe (translateX(-50%)) and the JS scroll driver
   (wrap at scrollWidth/2) assume the track is exactly two identical halves.

   Previously that duplicate was hand-copied in the HTML — every logo written
   twice, and easy to desync. Now each tile is authored ONCE (the real set) and
   this script generates the aria-hidden clone from it, guaranteeing the two
   halves stay byte-identical.

   PROGRESSIVE ENHANCEMENT: the visible (real) tiles live in the HTML, so
   view-source and no-JS users still see every logo. This only adds the
   decorative loop copy. It also derives each band's count number
   (.proof-num) from the authored tile count so the label can't drift.

   ORDERING: this must run BEFORE main.js's initProofMarquee (which measures
   scrollWidth and takes over the scroll). Both are `defer` scripts; defer
   preserves document order, so this file is included before main.js. */
(function () {
	'use strict';

	function cloneBand(track) {
		// The authored (real) tiles are everything currently in the track. Any
		// tile already marked as a generated clone is skipped so re-runs are
		// idempotent.
		var reals = [];
		var kids = track.children;
		for (var i = 0; i < kids.length; i++) {
			if (kids[i].getAttribute('data-clone') !== 'true') reals.push(kids[i]);
		}
		if (!reals.length) return 0;

		// Remove any previously generated clones (idempotent re-run safety).
		var existing = track.querySelectorAll('[data-clone="true"]');
		for (var j = 0; j < existing.length; j++) existing[j].remove();

		// Build the aria-hidden duplicate set: deep-clone each real tile, strip
		// it from the accessibility tree, drop its title tooltip and img alt
		// (the real copy already conveys these), and tag it as a clone.
		var frag = document.createDocumentFragment();
		for (var k = 0; k < reals.length; k++) {
			var clone = reals[k].cloneNode(true);
			clone.setAttribute('aria-hidden', 'true');
			clone.setAttribute('data-clone', 'true');
			clone.removeAttribute('title');
			var img = clone.querySelector('img');
			if (img) img.setAttribute('alt', '');
			frag.appendChild(clone);
		}
		track.appendChild(frag);
		return reals.length;
	}

	function updateCount(band, count) {
		var num = band.querySelector('.proof-num');
		// Only overwrite a purely-numeric label so we never clobber custom text.
		if (num && /^\s*\d+\s*$/.test(num.textContent)) {
			num.textContent = String(count);
		}
	}

	function run() {
		var tracks = document.querySelectorAll('.proof-track');
		for (var i = 0; i < tracks.length; i++) {
			var track = tracks[i];
			var count = cloneBand(track);
			var band = track.closest ? track.closest('.proof-band') : null;
			if (band && count) updateCount(band, count);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run);
	} else {
		run();
	}
})();
