/* Renders a project's README as HTML.

   Fetches the LATEST README live from GitHub's raw endpoint so the page always
   reflects the current repo. If the fetch fails (offline, rate-limited, or a
   file:// CORS restriction), it falls back to the copy embedded in
   <script id="readme" type="text/markdown"> so the page always has content.

   Relative image/link paths in the README are rewritten to absolute GitHub
   URLs so they resolve from this site. */
(function () {
	'use strict';

	var holder = document.getElementById('readme');
	var target = document.getElementById('readme-content');
	if (!holder || !target || typeof marked === 'undefined') return;

	var repo = holder.getAttribute('data-repo');        // e.g. SaadBaig/pqcscan
	var branch = holder.getAttribute('data-branch') || 'main';
	var rawBase = 'https://raw.githubusercontent.com/' + repo + '/' + branch + '/';
	var blobBase = 'https://github.com/' + repo + '/blob/' + branch + '/';
	var readmeUrl = rawBase + 'README.md';

	var embedded = holder.textContent;

	marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });

	function isRelative(url) {
		return url && !/^(https?:)?\/\//i.test(url) && !/^(#|mailto:|data:)/i.test(url);
	}

	// GitHub-style heading slug: lowercase, strip punctuation (keep letters,
	// numbers, spaces, hyphens — including unicode), spaces -> hyphens. This
	// matches the anchor targets a README's Table of Contents links to.
	function slugify(text) {
		return text.toLowerCase().trim()
			.replace(/[^\w\u00C0-\uFFFF \-]/g, '')  // drop punctuation & emoji
			.replace(/\s+/g, '-');
	}

	function render(md) {
		var tmp = document.createElement('div');
		tmp.innerHTML = marked.parse(md);

		// marked v12 no longer auto-generates heading IDs, so add them here
		// (deduping repeats) so in-page Table-of-Contents links resolve.
		var seen = {};
		tmp.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(function (h) {
			var base = slugify(h.textContent || '');
			if (!base) return;
			var id = base;
			if (seen[base] != null) { seen[base]++; id = base + '-' + seen[base]; }
			else { seen[base] = 0; }
			h.id = id;
		});

		// Images -> raw content URL.
		tmp.querySelectorAll('img[src]').forEach(function (img) {
			var src = img.getAttribute('src');
			if (isRelative(src)) img.setAttribute('src', rawBase + src.replace(/^\.?\//, ''));
			img.setAttribute('loading', 'lazy');
		});

		// Links -> repo blob URL (skip in-page anchors). Open externally.
		tmp.querySelectorAll('a[href]').forEach(function (a) {
			var href = a.getAttribute('href');
			if (isRelative(href)) a.setAttribute('href', blobBase + href.replace(/^\.?\//, ''));
			if (/^https?:/i.test(a.getAttribute('href'))) {
				a.setAttribute('target', '_blank');
				a.setAttribute('rel', 'noopener');
			}
		});

		// Wrap tables so they can scroll horizontally on small screens.
		tmp.querySelectorAll('table').forEach(function (t) {
			if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('table-wrap')) return;
			var wrap = document.createElement('div');
			wrap.className = 'table-wrap';
			t.parentNode.insertBefore(wrap, t);
			wrap.appendChild(t);
		});

		target.innerHTML = tmp.innerHTML;
	}

	// Render the embedded copy immediately so there's never a blank page, then
	// try to refresh with the live version from GitHub.
	if (embedded && embedded.trim()) render(embedded);

	if (typeof fetch === 'function') {
		fetch(readmeUrl, { cache: 'no-store' })
			.then(function (res) { return res.ok ? res.text() : null; })
			.then(function (md) {
				if (md && md.trim()) render(md);   // fresh content from GitHub
			})
			.catch(function () { /* offline / CORS / rate-limited: keep embedded */ });
	}
})();
