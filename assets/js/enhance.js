/* ==========================================================================
   enhance.js — progressive enhancements layered on top of the base site:
   terminal-style hero intro, live GitHub "last updated" stamps, easter eggs,
   and PWA service-worker registration. All features degrade gracefully.
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
	   2. Live GitHub "last updated" per project card
	   ---------------------------------------------------------------------- */
	function relativeTime(iso) {
		var then = new Date(iso).getTime();
		if (isNaN(then)) return null;
		var secs = Math.max(0, (Date.now() - then) / 1000);
		var units = [
			['year', 31536000],
			['month', 2592000],
			['week', 604800],
			['day', 86400],
			['hour', 3600],
			['minute', 60]
		];
		for (var i = 0; i < units.length; i++) {
			var n = Math.floor(secs / units[i][1]);
			if (n >= 1) return n + ' ' + units[i][0] + (n > 1 ? 's' : '') + ' ago';
		}
		return 'just now';
	}

	function loadRepoStamps() {
		var cards = document.querySelectorAll('.box[data-repo]');
		if (!cards.length || typeof fetch !== 'function') return;

		cards.forEach(function (card) {
			var repo = card.getAttribute('data-repo');
			var slot = card.querySelector('.updated');
			if (!repo || !slot) return;

			fetch('https://api.github.com/repos/' + repo, {
				headers: { 'Accept': 'application/vnd.github+json' }
			})
				.then(function (res) { return res.ok ? res.json() : null; })
				.then(function (data) {
					if (!data || !data.pushed_at) return;
					var rel = relativeTime(data.pushed_at);
					if (!rel) return;
					slot.textContent = 'Updated ' + rel;
					slot.removeAttribute('aria-hidden');
					slot.classList.add('is-shown');
				})
				.catch(function () { /* rate-limited or offline: leave blank */ });
		});
	}

	/* ----------------------------------------------------------------------
	   3. Easter eggs
	   ---------------------------------------------------------------------- */
	function consoleGreeting() {
		try {
			var title = 'color:#c98fc0;font-size:20px;font-weight:bold;';
			var body = 'color:#9ad;font-size:13px;';
			var hint = 'color:#7a7a7a;font-size:12px;font-style:italic;';
			console.log('%cSaad Baig // Security Engineer', title);
			console.log('%cPoking around the console? I like you already.', body);
			console.log('%cTry the Konami code on the page. ↑ ↑ ↓ ↓ ← → ← → B A', hint);
		} catch (e) { /* no console */ }
	}

	function konami() {
		var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
		var pos = 0;
		window.addEventListener('keydown', function (e) {
			pos = (e.keyCode === seq[pos]) ? pos + 1 : (e.keyCode === seq[0] ? 1 : 0);
			if (pos === seq.length) {
				pos = 0;
				activateHackerMode();
			}
		});
	}

	function activateHackerMode() {
		document.body.classList.toggle('hacker-mode');
		// Brief on-screen "access granted" flash.
		var flash = document.createElement('div');
		flash.className = 'egg-flash';
		flash.textContent = document.body.classList.contains('hacker-mode')
			? '> ACCESS GRANTED'
			: '> SESSION CLOSED';
		document.body.appendChild(flash);
		window.setTimeout(function () {
			flash.classList.add('is-gone');
			window.setTimeout(function () {
				if (flash.parentNode) flash.parentNode.removeChild(flash);
			}, 600);
		}, 1200);
	}

	/* ----------------------------------------------------------------------
	   4. PWA service-worker registration
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
		loadRepoStamps();
		consoleGreeting();
		konami();
		registerSW();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
