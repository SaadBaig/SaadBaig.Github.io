/* Pointer-tracking 3D tilt — shared across project detail pages.

   Binds every element matching a selector so it leans toward the cursor (the
   same cinematic effect as the home page project cards). Sets --rx/--ry on the
   element and toggles the .is-tilting class; the page's CSS turns those into a
   transform. Skipped for reduced-motion users and coarse (touch) pointers.
   Self-contained; no dependencies.

   Configuration (optional) via the script tag's data attributes:
     data-tilt-selector  CSS selector of elements to bind (default
                          ".proj-hero-image")
     data-tilt-max        max rotation in degrees at the edges (default 6)

   Example:
     <script src="hero-tilt.js"
             data-tilt-selector=".glow-card" data-tilt-max="7"></script>

   This replaces the near-identical inline tilt scripts that previously lived on
   the hero pages, the write-up grid, and the reverse-engineering card. */
(function () {
	'use strict';

	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var fine = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	if (reduce || !fine) return;

	// Read config from this script's own tag. document.currentScript is null
	// for deferred scripts (they run after parsing), so locate the tag by its
	// src instead. Falls back to the hero image + a subtle 6deg tilt.
	var self = document.currentScript;
	if (!self) {
		var scripts = document.querySelectorAll('script[src]');
		for (var s = 0; s < scripts.length; s++) {
			if (/hero-tilt\.js(\?|$)/.test(scripts[s].getAttribute('src') || '')) { self = scripts[s]; break; }
		}
	}
	var selector = (self && self.getAttribute('data-tilt-selector')) || '.proj-hero-image';
	var max = parseFloat(self && self.getAttribute('data-tilt-max')) || 6;

	var els = document.querySelectorAll(selector);
	if (!els.length) return;

	function bind(el) {
		var frame = null;

		el.addEventListener('mouseenter', function () { el.classList.add('is-tilting'); });

		el.addEventListener('mousemove', function (e) {
			var r = el.getBoundingClientRect();
			var dx = (e.clientX - r.left) / r.width - 0.5;
			var dy = (e.clientY - r.top) / r.height - 0.5;
			if (frame) return;
			frame = window.requestAnimationFrame(function () {
				frame = null;
				el.style.setProperty('--ry', (dx * max).toFixed(2) + 'deg');
				el.style.setProperty('--rx', (-dy * max).toFixed(2) + 'deg');
			});
		});

		el.addEventListener('mouseleave', function () {
			if (frame) { window.cancelAnimationFrame(frame); frame = null; }
			el.classList.remove('is-tilting');
			el.style.removeProperty('--rx');
			el.style.removeProperty('--ry');
		});
	}

	for (var i = 0; i < els.length; i++) bind(els[i]);
})();
