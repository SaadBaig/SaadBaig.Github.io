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
			var fade = vh > 0 ? Math.max(0, 1 - (scroll / (vh * 0.6))) : 1;
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

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

		for (var j = 0; j < items.length; j++) observer.observe(items[j]);
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

	/* ---------------------------------------------------------------------- */
	function init() {
		// Disable animations until loaded (matches the template's .is-loading).
		document.body.classList.add('is-loading');
		window.addEventListener('load', function () {
			window.setTimeout(function () {
				document.body.classList.remove('is-loading');
			}, 100);
		});

		var bg = document.getElementById('bg');
		if (bg) initSlider(bg);
		initCaptionFade();
		initReveal();
		initDotNav();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
