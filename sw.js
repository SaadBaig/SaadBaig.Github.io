/* Service worker: precache core assets, serve cache-first for instant repeat
   loads and offline support. Bump CACHE_VERSION to invalidate old caches. */
var CACHE_VERSION = 'saadbaig-v1';

var CORE_ASSETS = [
	'./',
	'./index.html',
	'./assets/css/main.css',
	'./assets/css/font-awesome.min.css',
	'./assets/js/jquery.min.js',
	'./assets/js/skel.min.js',
	'./assets/js/util.js',
	'./assets/js/main.js',
	'./assets/js/enhance.js',
	'./manifest.webmanifest',
	'./favicon.svg',
	'./images/banner1.webp',
	'./images/banner2.webp',
	'./images/banner3.webp',
	'./images/banner4.webp',
	'./images/banner5.webp',
	'./images/banner6.webp'
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
