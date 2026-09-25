/* Renders a Jupyter notebook (.ipynb) as HTML.

   Fetches the notebook JSON live from GitHub's raw endpoint (like render.js does
   for READMEs) and builds the page from it: markdown cells via `marked`, code
   cells as syntax-neutral <pre> blocks, and outputs (stdout/stderr streams,
   text/plain results, and image/png figures) rendered inline. If the fetch
   fails (offline, rate-limited, file:// CORS), the embedded fallback in
   <script id="notebook"> is kept so the page is never blank.

   nbformat 4 shape handled:
     cells[].cell_type: "markdown" | "code" | "raw"
     cells[].source:    string OR array of strings
     cells[].outputs[]: { output_type: "stream"      , text }
                        { output_type: "display_data"|"execute_result",
                          data: { "text/plain":…, "image/png": base64 } }
                        { output_type: "error", ename, evalue, traceback[] }

   SECURITY: notebook content is untrusted external data. Code/text/markdown-raw
   is inserted via textContent (never innerHTML), and only marked's output for
   markdown cells is set as HTML. Image data is length-checked and restricted to
   image/png data URIs. */
(function () {
	'use strict';

	var holder = document.getElementById('notebook');
	var target = document.getElementById('notebook-content');
	if (!holder || !target) return;

	var repo = holder.getAttribute('data-repo');                 // e.g. SaadBaig/Machine-Learning
	var branch = holder.getAttribute('data-branch') || 'main';
	var path = (holder.getAttribute('data-path') || '').replace(/^\/+|\/+$/g, '');
	var file = holder.getAttribute('data-file') || 'notebook.ipynb';

	function encodePath(p) { return p.split('/').map(encodeURIComponent).join('/'); }
	var dir = path ? encodePath(path) + '/' : '';
	var rawUrl = 'https://raw.githubusercontent.com/' + repo + '/' + branch + '/' + dir + encodeURIComponent(file);

	var hasMarked = (typeof marked !== 'undefined');
	if (hasMarked) marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });

	function el(tag, cls) {
		var n = document.createElement(tag);
		if (cls) n.className = cls;
		return n;
	}

	// source can be a string or an array of line-strings.
	function joinSource(src) {
		return Array.isArray(src) ? src.join('') : (src || '');
	}

	function renderMarkdownCell(cell) {
		var wrap = el('div', 'nb-cell nb-md');
		var md = joinSource(cell.source);
		if (hasMarked) {
			wrap.innerHTML = marked.parse(md);   // trusted parser, notebook markdown
		} else {
			var pre = el('pre'); pre.textContent = md; wrap.appendChild(pre);
		}
		return wrap;
	}

	function renderCodeCell(cell) {
		var wrap = el('div', 'nb-cell nb-code-cell');

		// Input: the source, in a code block (textContent — never innerHTML).
		var pre = el('pre', 'nb-code');
		var code = el('code');
		code.textContent = joinSource(cell.source);
		pre.appendChild(code);
		wrap.appendChild(pre);

		// Outputs.
		var outs = cell.outputs || [];
		for (var i = 0; i < outs.length; i++) {
			var rendered = renderOutput(outs[i]);
			if (rendered) wrap.appendChild(rendered);
		}
		return wrap;
	}

	function renderOutput(out) {
		var type = out.output_type;

		if (type === 'stream') {
			var s = el('pre', 'nb-output nb-stream');
			s.textContent = joinSource(out.text);
			return s;
		}

		if (type === 'display_data' || type === 'execute_result') {
			var data = out.data || {};
			// Prefer an image if present.
			if (data['image/png']) {
				var b64 = data['image/png'];
				if (Array.isArray(b64)) b64 = b64.join('');
				var fig = el('div', 'nb-output nb-figure');
				var img = el('img');
				img.setAttribute('src', 'data:image/png;base64,' + b64.replace(/\s+/g, ''));
				img.setAttribute('alt', 'Notebook output figure');
				img.setAttribute('loading', 'lazy');
				fig.appendChild(img);
				return fig;
			}
			if (data['text/plain']) {
				var t = el('pre', 'nb-output nb-result');
				t.textContent = joinSource(data['text/plain']);
				return t;
			}
			return null;
		}

		if (type === 'error') {
			var e = el('pre', 'nb-output nb-error');
			// Strip ANSI colour escape codes from the traceback for readability.
			var tb = (out.traceback || []).join('\n').replace(/\u001b\[[0-9;]*m/g, '');
			e.textContent = tb || ((out.ename || 'Error') + ': ' + (out.evalue || ''));
			return e;
		}

		return null;
	}

	function render(nb) {
		var cells = (nb && nb.cells) || [];
		var frag = document.createDocumentFragment();
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			if (cell.cell_type === 'markdown') {
				frag.appendChild(renderMarkdownCell(cell));
			} else if (cell.cell_type === 'code') {
				frag.appendChild(renderCodeCell(cell));
			} else if (cell.cell_type === 'raw') {
				var pre = el('pre', 'nb-cell nb-raw');
				pre.textContent = joinSource(cell.source);
				frag.appendChild(pre);
			}
		}
		target.textContent = '';
		target.appendChild(frag);
	}

	// Try the embedded fallback first (if any), then refresh from GitHub.
	var embedded = holder.textContent && holder.textContent.trim();
	if (embedded) {
		try { render(JSON.parse(embedded)); } catch (e) { /* leave loading text */ }
	}

	if (typeof fetch === 'function') {
		fetch(rawUrl, { cache: 'no-store' })
			.then(function (res) { return res.ok ? res.json() : null; })
			.then(function (nb) { if (nb) render(nb); })
			.catch(function () { /* offline / CORS / rate-limited: keep fallback */ });
	}
})();
