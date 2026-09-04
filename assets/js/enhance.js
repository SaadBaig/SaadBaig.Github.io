/* ==========================================================================
   enhance.js — progressive enhancements layered on top of the base site:
   terminal-style hero intro, easter eggs, and PWA service-worker
   registration. All features degrade gracefully.
   ========================================================================== */
(function () {
	'use strict';

	var reduceMotion = window.matchMedia
		&& window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ----------------------------------------------------------------------
	   1. Terminal-style typewriter hero intro
	   ---------------------------------------------------------------------- */
	// Type a single element's data-text into it, character by character.
	// Cancels any in-progress typing on that element first.
	function typeInto(el, startDelay) {
		var text = el.getAttribute('data-text') || '';

		// Cancel a previous run on this element.
		if (el._typeTimer) { window.clearTimeout(el._typeTimer); }

		if (reduceMotion) {
			el.textContent = text;
			return;
		}

		var i = 0;
		function tick() {
			el.textContent = text.slice(0, i);
			i++;
			if (i <= text.length) {
				el._typeTimer = window.setTimeout(tick, 70 + Math.random() * 45);
			} else {
				el._typeTimer = null;
			}
		}
		el.textContent = '';
		el._typeTimer = window.setTimeout(tick, startDelay || 0);
	}

	function typeTerminal() {
		var slides = document.querySelectorAll('#bg > article');
		if (!slides.length) return;

		// Reduced motion: fill every caption in immediately and stop.
		if (reduceMotion) {
			document.querySelectorAll('.caption-terminal .type-target').forEach(function (el) {
				el.textContent = el.getAttribute('data-text');
			});
			return;
		}

		function targetIn(slide) {
			return slide.querySelector('.caption-terminal .type-target');
		}

		// Clear every caption up front, then type the initially-visible slide
		// once the page settles.
		var first = document.querySelector('#bg > article.visible') || slides[0];
		slides.forEach(function (slide) {
			var t = targetIn(slide);
			if (t && slide !== first) t.textContent = '';
		});
		var firstTarget = targetIn(first);
		if (firstTarget) typeInto(firstTarget, 450);

		// Track which slide we last typed so the observer only fires on a real
		// change to a newly-visible slide (avoids re-typing on unrelated
		// class toggles like 'top'/'instant').
		var lastVisible = first;

		slides.forEach(function (slide) {
			var observer = new MutationObserver(function () {
				var target = targetIn(slide);
				if (!target) return;
				var isVisible = slide.classList.contains('visible');
				if (isVisible && slide !== lastVisible) {
					lastVisible = slide;
					typeInto(target, 250);
				} else if (!isVisible) {
					if (target._typeTimer) { window.clearTimeout(target._typeTimer); target._typeTimer = null; }
					target.textContent = '';
				}
			});
			observer.observe(slide, { attributes: true, attributeFilter: ['class'] });
		});
	}

	/* ----------------------------------------------------------------------
	   2. Easter eggs
	   ---------------------------------------------------------------------- */
	function consoleGreeting() {
		try {
			var title = 'color:#c98fc0;font-size:20px;font-weight:bold;';
			var body = 'color:#9ad;font-size:13px;';
			var hint = 'color:#7a7a7a;font-size:12px;font-style:italic;';
			console.log('%cSaad Baig // Security Engineer', title);
			console.log('%cPoking around the console? I like you already.', body);
			console.log('%cPsst — try typing "pwned", or the Konami code (↑ ↑ ↓ ↓ ← → ← → B A).', hint);
		} catch (e) { /* no console */ }
	}

	var eggFired = false;

	// Two ways in: the Konami code, or simply typing "pwned". Both drop you
	// into the /root terminal after a brief "ACCESS GRANTED" flash.
	function easterEggs() {
		// Konami: ↑ ↑ ↓ ↓ ← → ← → B A
		var konamiSeq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
		var konamiPos = 0;

		// "pwned" typed anywhere.
		var word = 'pwned';
		var typed = '';

		window.addEventListener('keydown', function (e) {
			// Ignore when typing into a field.
			var t = e.target;
			if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

			// Konami tracking.
			konamiPos = (e.keyCode === konamiSeq[konamiPos]) ? konamiPos + 1 : (e.keyCode === konamiSeq[0] ? 1 : 0);
			if (konamiPos === konamiSeq.length) { konamiPos = 0; enterRoot(); }

			// "pwned" tracking (letters only).
			if (e.key && e.key.length === 1 && /[a-z]/i.test(e.key)) {
				typed = (typed + e.key.toLowerCase()).slice(-word.length);
				if (typed === word) enterRoot();
			}
		});
	}

	function enterRoot() {
		if (eggFired) return;   // guard against double-trigger
		eggFired = true;

		var flash = document.createElement('div');
		flash.className = 'egg-flash';
		flash.textContent = '> ACCESS GRANTED';
		document.body.appendChild(flash);

		var go = function () { window.location.href = 'root/index.html'; };

		if (reduceMotion) { go(); return; }
		window.setTimeout(go, 900);
	}

	/* ----------------------------------------------------------------------
	   3. PWA service-worker registration
	   ---------------------------------------------------------------------- */
	function registerSW() {
		if (!('serviceWorker' in navigator)) return;
		// file:// can't host a service worker; only register over http(s).
		if (location.protocol !== 'https:' && location.protocol !== 'http:') return;
		window.addEventListener('load', function () {
			navigator.serviceWorker.register('sw.js').catch(function () {
				/* registration failed — site still works, just no offline cache */
			});
		});
	}

	/* ---------------------------------------------------------------------- */
	function init() {
		typeTerminal();
		consoleGreeting();
		easterEggs();
		registerSW();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
