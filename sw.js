/* Service worker: precache core assets, serve cache-first for instant repeat
   loads and offline support. Bump CACHE_VERSION to invalidate old caches. */
var CACHE_VERSION = 'saadbaig-v84';

var CORE_ASSETS = [
	'./',
	'./index.html',
	'./projects.html',
	'./assets/css/main.css',
	'./assets/js/main.js',
	'./assets/js/enhance.js',
	'./assets/fonts/poppins/poppins-300.woff2',
	'./assets/fonts/poppins/poppins-400.woff2',
	'./assets/fonts/poppins/poppins-500.woff2',
	'./assets/fonts/poppins/poppins-600.woff2',
	'./assets/fonts/poppins/poppins-700.woff2',
	'./manifest.webmanifest',
	'./favicon.svg',
	'./root/index.html',
	'./images/banner/banner1.webp',
	'./images/banner/banner2.webp',
	'./images/banner/banner3.webp',
	'./images/banner/banner4.webp',
	'./images/banner/banner5.webp',
	'./images/banner/banner6.webp',
	'./images/banner/quantum.webp',
	// Project detail pages + their shared shell (render markdown client-side).
	'./projects/project.css',
	'./projects/render.js',
	'./projects/marked.min.js',
	'./projects/hero-tilt.js',
	'./projects/pqcscan.html',
	'./projects/ddos-defcon-2026.html',
	'./projects/pentesting-methodology.html',
	'./projects/tryhackme.html',
	'./projects/reverse-engineering.html',
	'./projects/wannacry.html',
	'./projects/writeups.html',
	'./projects/writeup-blog.html',
	'./projects/writeup-lazyadmin.html',
	'./projects/writeup-ps-empire.html',
	'./projects/writeup-reversing-elf.html',
	// Project card thumbnails shown on the home grid.
	'./images/projects/pqcscan.webp',
	'./images/projects/ddos.webp',
	'./images/projects/pentesting.webp',
	'./images/projects/tryhackme.webp',
	'./images/projects/pythondev.webp',
	'./images/projects/RE.webp',
	'./images/writeups/wannacry.jpeg',
	'./images/projects/exploitdev.webp',
	'./images/projects/ML.webp',
	// Speaking-section logo marquee.
	'./images/speaklogo/rmisc.png',
	'./images/speaklogo/IEEE.png',
	'./images/speaklogo/bsides.png',
	'./images/speaklogo/owasp.png',
	'./images/speaklogo/ISSA.png',
	'./images/speaklogo/MSU.png',
	'./images/speaklogo/denhac.png',
	// Certifications-section logo marquee.
	'./images/certlogo/pentest.png',
	'./images/certlogo/secplus.png',
	'./images/certlogo/ccna.png',
	'./images/certlogo/nse1.svg',
	'./images/certlogo/nse2.svg',
	'./images/certlogo/nse3.png',
	'./images/certlogo/nse4.svg',
	'./images/certlogo/splunkfun1.png',
	'./images/certlogo/splunkfun2.png'
];

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_VERSION).then(function (cache) {
			// addAll fails the whole install if any request 404s; add individually
			// so a single missing optional asset doesn't break the install.
			return Promise.all(CORE_ASSETS.map(function (url) {
				return cache.add(url).catch(function () { return null; });
			}));
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (key) {
				if (key !== CACHE_VERSION) return caches.delete(key);
			}));
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', function (event) {
	var req = event.request;

	// Only handle GET; never intercept the GitHub API (always fresh).
	if (req.method !== 'GET' || req.url.indexOf('api.github.com') !== -1) return;

	// Same-origin: cache-first, then network (and cache the result).
	// Cross-origin (e.g. fonts CDN): network-first, fall back to cache.
	var sameOrigin = req.url.indexOf(self.location.origin) === 0;

	if (sameOrigin) {
		event.respondWith(
			caches.match(req).then(function (cached) {
				return cached || fetch(req).then(function (res) {
					var copy = res.clone();
					caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
					return res;
				}).catch(function () { return cached; });
			})
		);
	} else {
		event.respondWith(
			fetch(req).then(function (res) {
				var copy = res.clone();
				caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
				return res;
			}).catch(function () { return caches.match(req); })
		);
	}
});
