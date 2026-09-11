/* Pointer-tracking 3D tilt for a project page's hero image (.proj-hero-image).
   The image leans toward the cursor — the same cinematic effect as the home
   page project cards. Sets --rx/--ry (rotation) on the wrapper and toggles the
   .is-tilting class. Skipped for reduced-motion users and coarse (touch)
   pointers. Self-contained; no dependencies. */
(function () {
	'use strict';

	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var fine = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	if (reduce || !fine) return;

	var el = document.querySelector('.proj-hero-image');
	if (!el) return;

	var MAX_TILT = 6; // degrees — subtle, since the image is large
	var frame = null;

	el.addEventListener('mouseenter', function () { el.classList.add('is-tilting'); });

	el.addEventListener('mousemove', function (e) {
		var r = el.getBoundingClientRect();
		var dx = (e.clientX - r.left) / r.width - 0.5;
		var dy = (e.clientY - r.top) / r.height - 0.5;
		if (frame) return;
		frame = window.requestAnimationFrame(function () {
			frame = null;
			el.style.setProperty('--ry', (dx * MAX_TILT).toFixed(2) + 'deg');
			el.style.setProperty('--rx', (-dy * MAX_TILT).toFixed(2) + 'deg');
		});
	});

	el.addEventListener('mouseleave', function () {
		if (frame) { window.cancelAnimationFrame(frame); frame = null; }
		el.classList.remove('is-tilting');
		el.style.removeProperty('--rx');
		el.style.removeProperty('--ry');
	});
})();
