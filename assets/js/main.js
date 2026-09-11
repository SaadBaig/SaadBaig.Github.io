/* ==========================================================================
   main.js — vanilla JS (no jQuery / no skel).
   Handles: the full-page background slideshow, the hero caption/scroll-cue
   fade, scroll-reveal, and the scroll-spy dot navigation.
   Original slideshow concept: "Hielo" by TEMPLATED (CC BY 3.0).
   ========================================================================== */
(function () {
	'use strict';

	var SLIDE_SPEED = 1500;   // cross-fade duration (must match CSS transition)
	var SLIDE_DELAY = 5000;   // time each slide is shown

	var reduceMotion = window.matchMedia
		&& window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ----------------------------------------------------------------------
	   Background slideshow (#bg > article). Sets each slide's background image
	   from its child <img>, then cross-fades between them by toggling classes.
	   ---------------------------------------------------------------------- */
	function initSlider(root) {
		var slides = Array.prototype.slice.call(root.querySelectorAll('article'));
		if (!slides.length) return;

		// Prime each slide's background-image from its <img src>.
		slides.forEach(function (slide) {
			var img = slide.querySelector('img');
			if (img) {
				slide.style.backgroundImage = 'url("' + img.getAttribute('src') + '")';
				slide.style.backgroundPosition = slide.getAttribute('data-position') || 'center';
			}
		});

		var pos = 0;
		var locked = false;

		slides[pos].classList.add('visible', 'top');
		if (slides.length === 1) return;

		function switchTo(next) {
			if (locked || next === pos) return;
			locked = true;

			var last = pos;
			pos = next;

			slides[last].classList.remove('top');
			slides[pos].classList.add('visible', 'top');

			window.setTimeout(function () {
				slides[last].classList.add('instant');
				slides[last].classList.remove('visible');
				window.setTimeout(function () {
					slides[last].classList.remove('instant');
					locked = false;
				}, 100);
			}, SLIDE_SPEED);
		}

		var current = 0;
		window.setInterval(function () {
			current = (current + 1) % slides.length;
			switchTo(current);
		}, SLIDE_DELAY);
	}

	/* ----------------------------------------------------------------------
	   Hero caption + scroll-cue fade. Sets --caption-opacity on :root so it
	   inherits to both #bg's caption and the .hero's scroll-cue.
	   ---------------------------------------------------------------------- */
	function initCaptionFade() {
		var bg = document.getElementById('bg');
		if (!bg) return;
		var ticking = false;

		function update() {
			var vh = window.innerHeight;
			var scroll = window.pageYOffset;
			var progress = vh > 0 ? Math.min(1, scroll / (vh * 0.6)) : 0;
			// Caption scrolls UP and away: translate it upward by up to 50% of
			// the viewport height as the hero scrolls past. A light opacity
			// fade near the end keeps it from clipping abruptly at the top.
			var shift = -(progress * vh * 0.5);
			var fade = Math.max(0, 1 - progress * progress);
			document.documentElement.style.setProperty('--caption-shift', shift.toFixed(1) + 'px');
			document.documentElement.style.setProperty('--caption-opacity', fade.toFixed(3));
			ticking = false;
		}

		window.addEventListener('scroll', function () {
			if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
		}, { passive: true });
		window.addEventListener('resize', update);
		update();
	}

	/* ----------------------------------------------------------------------
	   Scroll-reveal: fade/rise elements in as they enter view.
	   ---------------------------------------------------------------------- */
	function initReveal() {
		var items = document.querySelectorAll('[data-reveal]');
		if (!items.length) return;

		if (reduceMotion || !('IntersectionObserver' in window)) {
			for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
			return;
		}

		// Reversible reveal: toggle .is-visible on enter/leave so elements
		// animate OUT the same way they came in when scrolled back past. The
		// observer keeps watching (no unobserve) so it works in both directions.
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					// Stagger items that enter together (e.g. a row of project
					// cards) so they cascade in rather than popping at once.
					// The delay resets shortly after each batch settles and is
					// stored on the element so the exit animation reuses it.
					var delay = staggerIndex * 90;
					entry.target.style.setProperty('--reveal-delay', delay + 'ms');
					staggerIndex++;
					window.clearTimeout(staggerReset);
					staggerReset = window.setTimeout(function () { staggerIndex = 0; }, 220);

					entry.target.classList.add('is-visible');
				} else {
					// Scrolled out of view — animate back to the hidden state.
					entry.target.classList.remove('is-visible');
				}
			});
		}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

		var staggerIndex = 0;
		var staggerReset;

		// IMPORTANT: don't start observing until the body's `is-loading` class
		// is gone. While `is-loading` is set, ALL transitions are disabled
		// (`body.is-loading * { transition: none }`), so any element already in
		// view at load (e.g. the top row of project cards) would get
		// `.is-visible` added with transitions off and snap in without
		// animating. startObserving() is invoked by init() after is-loading is
		// removed, guaranteeing a clean animated reveal in both directions.
		function startObserving() {
			for (var j = 0; j < items.length; j++) observer.observe(items[j]);
		}

		if (document.body.classList.contains('is-loading')) {
			var wait = setInterval(function () {
				if (!document.body.classList.contains('is-loading')) {
					clearInterval(wait);
					startObserving();
				}
			}, 50);
		} else {
			startObserving();
		}
	}

	/* ----------------------------------------------------------------------
	   Projects page: fade the "Scroll" cue out once the visitor scrolls down.
	   ---------------------------------------------------------------------- */
	function initProjScrollCue() {
		var cue = document.querySelector('.proj-scroll-cue');
		if (!cue) return;

		function onScroll() {
			cue.classList.toggle('is-hidden', window.pageYOffset > 40);
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* ----------------------------------------------------------------------
	   Scroll-spy dot navigation: reveal past the hero + mark the active section.
	   ---------------------------------------------------------------------- */
	function initDotNav() {
		var nav = document.querySelector('.dot-nav');
		if (!nav) return;

		var links = {};
		nav.querySelectorAll('a[data-section]').forEach(function (a) {
			links[a.getAttribute('data-section')] = a;
		});

		var sections = Object.keys(links)
			.map(function (id) { return document.getElementById(id); })
			.filter(Boolean);
		if (!sections.length) return;

		function setActive(id) {
			for (var key in links) links[key].classList.toggle('is-active', key === id);
		}

		function onScroll() {
			document.body.classList.toggle('past-hero', window.pageYOffset > window.innerHeight * 0.6);
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		onScroll();

		if ('IntersectionObserver' in window) {
			var spy = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) setActive(entry.target.id);
				});
			}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
			sections.forEach(function (s) { spy.observe(s); });
		}
	}

	/* ----------------------------------------------------------------------
	   Pointer-tracking 3D tilt for project cards + proof-marquee logo tiles.
	   As the mouse moves over one it rotates slightly toward the cursor, giving
	   an interactive, cinematic feel. Skipped for reduced-motion users and
	   coarse (touch) pointers.
	   ---------------------------------------------------------------------- */
	function initCardTilt() {
		var cards = document.querySelectorAll('a.box, .proof-tile, .glass-panel');
		if (!cards.length || reduceMotion) return;

		// Only for devices with a fine pointer (mouse/trackpad), not touch.
		if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

		var MAX_TILT = 3.5;  // degrees of rotation at the card edges (project cards)
		var MAX_SHIFT = 5;   // px the card physically shifts toward the cursor

		function bindCard(card) {
			var frame = null; // rAF handle so we only update once per frame
			// Marquee tiles get a stronger, more playful reaction than the
			// larger project cards. The About panel uses the same feel as the
			// project cards.
			var isTile = card.classList.contains('proof-tile');
			var tilt = isTile ? 11 : MAX_TILT;
			var shift = isTile ? 11 : MAX_SHIFT;

			function onMove(e) {
				var rect = card.getBoundingClientRect();
				// Pointer position within the card, 0..1 on each axis.
				var px = (e.clientX - rect.left) / rect.width;
				var py = (e.clientY - rect.top) / rect.height;
				// Convert to a -1..1 offset from centre.
				var dx = px - 0.5;
				var dy = py - 0.5;

				if (frame) return;
				frame = window.requestAnimationFrame(function () {
					frame = null;
					// Rotate toward the cursor: moving right tilts the right
					// edge back (negative rotateY), moving down tilts the
					// bottom back (positive rotateX). Also physically shift the
					// card toward the cursor for a more pronounced reaction.
					card.style.setProperty('--ry', (dx * tilt).toFixed(2) + 'deg');
					card.style.setProperty('--rx', (-dy * tilt).toFixed(2) + 'deg');
					card.style.setProperty('--tx', (dx * shift).toFixed(1) + 'px');
					card.style.setProperty('--ty', (dy * shift).toFixed(1) + 'px');
				});
			}

			function onEnter() { card.classList.add('is-tilting'); }

			function onLeave() {
				if (frame) { window.cancelAnimationFrame(frame); frame = null; }
				// Remove the class so the base transition eases the card back,
				// then clear the vars once at rest.
				card.classList.remove('is-tilting');
				card.style.removeProperty('--rx');
				card.style.removeProperty('--ry');
				card.style.removeProperty('--tx');
				card.style.removeProperty('--ty');
			}

			card.addEventListener('mouseenter', onEnter);
			card.addEventListener('mousemove', onMove);
			card.addEventListener('mouseleave', onLeave);
		}

		for (var i = 0; i < cards.length; i++) bindCard(cards[i]);
	}

	/* ----------------------------------------------------------------------
	   Proof marquees: auto-scroll that also supports manual scrolling. The
	   band is natively scrollable (overflow-x), so drag / swipe / wheel /
	   trackpad all work. We drive the auto-scroll by nudging scrollLeft each
	   frame, and pause it briefly whenever the user interacts. The track holds
	   two identical logo sets, so we wrap scrollLeft at the halfway mark for a
	   seamless loop in either direction.
	   ---------------------------------------------------------------------- */
	function initProofMarquee() {
		var marquees = document.querySelectorAll('.proof-marquee');
		if (!marquees.length) return;

		// Reduced motion: leave the CSS static wrapped grid in place, no
		// auto-scroll and no takeover of the track layout.
		if (reduceMotion) return;

		// The JS scrollLeft driver (drag / wheel / hover-pause) is a
		// desktop enhancement. On touch devices and narrow viewports it's
		// unreliable — and taking over the track (animation:none) there left
		// the band as a static row. So on touch / small screens we DON'T take
		// over: the pure-CSS keyframe transform animation runs instead, which
		// scrolls smoothly and reliably everywhere.
		var finePointer = !window.matchMedia ||
			window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		var wideEnough = window.innerWidth > 736;
		if (!finePointer || !wideEnough) return;

		var SPEED = 0.4; // px per frame (~24px/s at 60fps)

		marquees.forEach(function (marquee) {
			var track = marquee.querySelector('.proof-track');
			if (!track) return;

			// Take over from the CSS keyframe animation (desktop only).
			track.style.animation = 'none';
			track.style.webkitAnimation = 'none';

			// track-b scrolls the opposite direction (right-to-left visually).
			var dir = track.classList.contains('proof-track-b') ? -1 : 1;

			// Half of the scrollable width = one full logo set.
			function half() { return marquee.scrollWidth / 2; }

			// For the reverse band, start in the middle so it has room to move
			// left before wrapping.
			if (dir < 0) marquee.scrollLeft = half();

			// Keep a floating-point scroll position. scrollLeft is rounded to an
			// integer by the browser, so adding a sub-pixel step (< 1px) each
			// frame would round back to 0 and never advance. We accumulate the
			// exact position here and assign the rounded value.
			var pos = marquee.scrollLeft;

			var paused = false;
			var idle = null;

			function pause() {
				paused = true;
				window.clearTimeout(idle);
			}
			function resumeSoon() {
				window.clearTimeout(idle);
				idle = window.setTimeout(function () { paused = false; }, 1200);
			}
			function resumeNow() {
				window.clearTimeout(idle);
				paused = false;
			}

			// Pause on hover; resume immediately when the pointer leaves.
			marquee.addEventListener('mouseenter', pause);
			marquee.addEventListener('mouseleave', resumeNow);

			// Mouse wheel over the band scrolls it horizontally. A mouse only
			// emits vertical delta (deltaY), which the browser would apply to
			// the PAGE (leaving the horizontal band untouched) — so we map the
			// dominant delta onto the band's scrollLeft ourselves and stop the
			// page from scrolling. Trackpads emit deltaX for horizontal swipes;
			// we honor that too. Not passive, so preventDefault can take effect.
			marquee.addEventListener('wheel', function (e) {
				// Use whichever axis the user pushed harder on.
				var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
				if (!delta) return;
				marquee.scrollLeft += delta;
				pos = marquee.scrollLeft;   // keep auto-scroll in sync
				pause();
				resumeSoon();
				e.preventDefault();          // don't also scroll the page
			}, { passive: false });
			marquee.addEventListener('touchstart', pause, { passive: true });
			marquee.addEventListener('touchend', resumeSoon, { passive: true });

			// Click-and-drag to scroll with a mouse.
			var down = false, startX = 0, startScroll = 0, moved = false;
			marquee.addEventListener('mousedown', function (e) {
				down = true; moved = false;
				startX = e.pageX;
				startScroll = marquee.scrollLeft;
				marquee.classList.add('is-dragging');
				pause();
				e.preventDefault();
			});
			window.addEventListener('mousemove', function (e) {
				if (!down) return;
				var dx = e.pageX - startX;
				if (Math.abs(dx) > 3) moved = true;
				marquee.scrollLeft = startScroll - dx;
			});
			window.addEventListener('mouseup', function () {
				if (!down) return;
				down = false;
				marquee.classList.remove('is-dragging');
				resumeSoon();
			});
			// Suppress the tile's click (navigation) if the user was dragging.
			marquee.addEventListener('click', function (e) {
				if (moved) { e.preventDefault(); e.stopPropagation(); }
			}, true);

			function step() {
				if (!paused) {
					var h = half();
					if (h > 0) {
						pos += SPEED * dir;
						// Seamless wrap in both directions.
						if (pos >= h) pos -= h;
						else if (pos < 0) pos += h;
						marquee.scrollLeft = pos;
					}
				} else {
					// While paused (hover / manual scroll), keep the float
					// position in sync with wherever the user left it so the
					// auto-scroll resumes smoothly without a jump.
					pos = marquee.scrollLeft;
				}
				window.requestAnimationFrame(step);
			}
			window.requestAnimationFrame(step);
		});
	}

	/* ---------------------------------------------------------------------- */
	function init() {
		// Disable animations until loaded (matches the template's .is-loading).
		// While `is-loading` is set, `body.is-loading * { transition: none }`
		// disables ALL transitions — including the #bg slide cross-fade.
		document.body.classList.add('is-loading');
		var loaded = false;
		function clearLoading() {
			if (loaded) return;
			loaded = true;
			document.body.classList.remove('is-loading');
		}
		// Normally clear shortly after full load. But on mobile the 7 large
		// banner WebPs can make `window.load` fire very late (or after several
		// slide-cycle ticks), which would keep transitions disabled so the
		// background appears not to cross-fade / cycle. So also clear on a hard
		// timeout after DOMContentLoaded, whichever comes first.
		window.addEventListener('load', function () {
			window.setTimeout(clearLoading, 100);
		});
		window.setTimeout(clearLoading, 1200);

		var bg = document.getElementById('bg');
		if (bg) initSlider(bg);
		initCaptionFade();
		initReveal();
		initDotNav();
		initProjScrollCue();
		initCardTilt();
		initProofMarquee();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
