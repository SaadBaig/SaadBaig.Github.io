/* Project card renderer.

   Builds project cards from SiteData.projects and injects them into a target
   grid, so the homepage Featured grid and the projects.html archive both draw
   from one canonical list (see projects-data.js).

   PROGRESSIVE ENHANCEMENT: the target grids already contain static,
   hand-authored cards (crawlable, no-JS friendly). This renderer REPLACES that
   static content with the data-driven version at runtime. Because the static
   fallback is identical to what we render, no-JS users lose nothing and
   crawlers still index the static copy. If SiteData is missing (script failed
   to load), we leave the static cards untouched.

   ORDERING: runs before main.js so the generated `a.box` / `[data-reveal]`
   elements exist when tilt.js / initReveal bind. All are `defer` scripts;
   defer preserves document order.

   Markup emitted (must match the existing CSS/JS hooks exactly):
     <div [class="proj-card"] data-reveal>
       <a href class="box" style="--glow: R, G, B;">
         <div class="image fit"><img src alt loading decoding></div>
         <div class="content">
           <header class="align-center"><h2>Title</h2></header>
           <p>Desc</p>
           <ul class="tags"><li>Tag</li>…</ul>
         </div>
       </a>
     </div>
*/
(function (global) {
	'use strict';

	function el(tag, attrs, text) {
		var node = document.createElement(tag);
		if (attrs) {
			for (var k in attrs) {
				if (attrs.hasOwnProperty(k) && attrs[k] != null) node.setAttribute(k, attrs[k]);
			}
		}
		if (text != null) node.textContent = text;
		return node;
	}

	// Build one card. `wrapperClass` is "proj-card" on the archive page or
	// null on the homepage (which uses a bare <div data-reveal>). `basePath` is
	// prepended to the stored image path ("images/" from a root page).
	function buildCard(project, wrapperClass, basePath) {
		var wrapper = el('div', { 'class': wrapperClass || null, 'data-reveal': '' });

		var link = el('a', {
			href: project.href,
			'class': 'box',
			style: '--glow: ' + project.glow + ';'
		});
		// External links (GitHub repos, anything off-site) open in a new tab so
		// the portfolio stays put; internal pages navigate in place. rel adds
		// the standard security hygiene for target=_blank.
		if (/^https?:\/\//i.test(project.href)) {
			link.setAttribute('target', '_blank');
			link.setAttribute('rel', 'noopener');
		}

		var imageWrap = el('div', { 'class': 'image fit' });
		imageWrap.appendChild(el('img', {
			src: (basePath || '') + project.img,
			alt: project.alt || (project.title + ' banner'),
			loading: 'lazy',
			decoding: 'async'
		}));
		link.appendChild(imageWrap);

		var content = el('div', { 'class': 'content' });
		var header = el('header', { 'class': 'align-center' });
		header.appendChild(el('h2', null, project.title));
		content.appendChild(header);
		content.appendChild(el('p', null, project.desc));

		if (project.tags && project.tags.length) {
			var ul = el('ul', { 'class': 'tags' });
			for (var i = 0; i < project.tags.length; i++) {
				ul.appendChild(el('li', null, project.tags[i]));
			}
			content.appendChild(ul);
		}
		link.appendChild(content);

		wrapper.appendChild(link);
		return wrapper;
	}

	// Render a list of projects into a target element, replacing its contents.
	function renderInto(target, projects, opts) {
		opts = opts || {};
		var wrapperClass = opts.wrapperClass || null;
		var basePath = opts.basePath || 'images/';
		var frag = document.createDocumentFragment();
		for (var i = 0; i < projects.length; i++) {
			frag.appendChild(buildCard(projects[i], wrapperClass, basePath));
		}
		target.textContent = '';       // clear the static fallback
		target.appendChild(frag);
	}

	global.SiteData = global.SiteData || {};
	global.SiteData.renderCards = renderInto;
	global.SiteData.buildCard = buildCard;
})(window);
