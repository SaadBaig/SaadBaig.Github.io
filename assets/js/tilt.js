/* Pointer-tracking 3D tilt — the single, site-wide tilt implementation.

   Used by every tilting element on the site (home project cards, About panel,
   proof-marquee logo tiles, the "View all projects" button, project-page hero
   images, write-up/RE cards, and the floating nav controls). Each page includes
   this script once per intensity tier / selector; there is no other tilt code.

   Binds every element matching a selector so it leans toward the cursor and
   physically shifts a touch that way (the same cinematic effect as the home
   page project cards and logo tiles). Sets --rx/--ry (rotation) and --tx/--ty
   (shift) on each element and toggles .is-tilting; the page's CSS turns those
   into a transform. Skipped for reduced-motion users and coarse (touch)
   pointers. Self-contained; no dependencies.

   Configuration via the including <script> tag's data attributes:
     data-tilt-selector  CSS selector of elements to bind (default
                          ".proj-hero-image")
     data-tilt-max        max rotation in degrees at the edges (default 6)
     data-tilt-shift      max physical shift in px toward the cursor (default 0)

   A page may include this script MORE THAN ONCE with different selectors (e.g.
   the hero image AND the nav controls). Each include claims its own tag (they
   are marked as consumed), so their configs don't collide even under defer
   (where document.currentScript is null).

   Example:
     <script src="assets/js/tilt.js" defer
             data-tilt-selector=".reading-nav a"
             data-tilt-max="10" data-tilt-shift="4"></script> */
(function () {
	'use strict';

	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var fine = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	if (reduce || !fine) return;

	// Find THIS script's tag. document.currentScript is null for deferred
	// scripts, so fall back to the first tilt.js tag not yet claimed by an
	// earlier run — this lets a page include the script multiple times with
	// different configs.
	var self = document.currentScript;
	if (!self) {
		var scripts = document.querySelectorAll('script[src]');
		for (var s = 0; s < scripts.length; s++) {
			var src = scripts[s].getAttribute('src') || '';
			if (/tilt\.js(\?|$)/.test(src) && !scripts[s].hasAttribute('data-tilt-claimed')) {
				self = scripts[s];
				break;
			}
		}
	}
	if (self) self.setAttribute('data-tilt-claimed', '');

	var selector = (self && self.getAttribute('data-tilt-selector')) || '.proj-hero-image';
	var max = parseFloat(self && self.getAttribute('data-tilt-max')) || 6;
	var shift = parseFloat(self && self.getAttribute('data-tilt-shift')) || 0;

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
				if (shift) {
					el.style.setProperty('--tx', (dx * shift).toFixed(1) + 'px');
					el.style.setProperty('--ty', (dy * shift).toFixed(1) + 'px');
				}
			});
		});

		el.addEventListener('mouseleave', function () {
			if (frame) { window.cancelAnimationFrame(frame); frame = null; }
			el.classList.remove('is-tilting');
			el.style.removeProperty('--rx');
			el.style.removeProperty('--ry');
			el.style.removeProperty('--tx');
			el.style.removeProperty('--ty');
		});
	}

	// Bind after the DOM is ready so dynamically-rendered targets (e.g. the
	// homepage project cards built by render-cards.js on DOMContentLoaded) are
	// present. Config above was resolved synchronously so each script tag
	// claims its own attributes in order, even with multiple invocations.
	function bindAll() {
		var els = document.querySelectorAll(selector);
		for (var i = 0; i < els.length; i++) bind(els[i]);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bindAll);
	} else {
		bindAll();
	}
})();
