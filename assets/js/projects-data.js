/* Canonical project list — single source of truth for project CARDS.

   Both the homepage "Featured Projects" grid and the full archive on
   projects.html show the same cards; this array is the one place their data
   lives so the two pages can never drift.

   PROGRESSIVE ENHANCEMENT: the archive on projects.html is authored as static
   HTML too (so view-source / no-JS / crawlers see every project). This data
   mirrors that archive and lets the homepage derive its featured subset, and
   lets projects.html re-render from one source. If JS is off, the static cards
   remain and nothing is lost.

   Field reference per project:
     title    card heading (also used as the img alt fallback)
     href     link target — a local .html path or an external GitHub URL
     glow     "R, G, B" accent triple (drives --glow: hover, border, tags)
     img      card image, relative to the page that renders it (see basePath)
     alt      image alt text (SEO + a11y); falls back to a title-based string
     desc     one-line description
     tags     array of short tag chips
     featured whether it appears in the homepage Featured grid
     order    sort order WITHIN the featured grid (lower = earlier)

   Image paths are stored WITHOUT a leading directory prefix (e.g.
   "projects/pqcscan.webp"); each renderer prepends the right base ("images/"
   on the homepage, "../images/" would be used from inside /projects/). Right
   now only same-origin root pages render cards, so base is "images/". */
(function (global) {
	'use strict';

	var PROJECTS = [
		{
			title: 'PQCScan',
			href: 'projects/pqcscan.html',
			glow: '240, 154, 58',
			img: 'projects/pqcscan.webp',
			alt: 'PQCScan project banner: a stylized quantum computer',
			desc: 'A scanner for post-quantum cryptography — checks systems for quantum-resistant readiness.',
			tags: ['Post-Quantum Cryptography', 'Rust', 'Open Source'],
			featured: true,
			order: 1
		},
		{
			title: 'DEFCON 2026 DDoS CTF',
			href: 'projects/ddos-defcon-2026.html',
			glow: '9, 174, 191',
			img: 'projects/ddos.webp',
			alt: 'DEFCON 2026 DDoS CTF banner with a circuit-board motif',
			desc: 'A DDoS-themed capture-the-flag challenge built for DEFCON 2026.',
			tags: ['CTF', 'Networking', 'Security'],
			featured: true,
			order: 2
		},
		{
			title: 'Pentesting Methodology',
			href: 'projects/pentesting-methodology.html',
			glow: '46, 191, 145',
			img: 'projects/pentesting.webp',
			alt: 'Penetration testing methodology banner',
			desc: 'My repeatable methodology and checklists for approaching engagements end to end.',
			tags: ['Methodology', 'Recon', 'Exploitation'],
			featured: true,
			order: 3
		},
		{
			title: 'Hack The Box CPTS',
			href: 'projects/cpts.html',
			glow: '138, 92, 209',
			img: 'projects/cpts.webp',
			alt: 'Hack The Box Academy — Certified Penetration Testing Specialist banner',
			desc: 'Working toward the HTB Certified Penetration Testing Specialist — methodology, CTF walkthroughs, and flags.',
			tags: ['Pentesting', 'CTF', 'HTB'],
			featured: true,
			order: 4
		},
		{
			title: 'TryHackMe',
			href: 'projects/writeups.html',
			glow: '112, 157, 191',
			img: 'projects/tryhackme.webp',
			alt: 'TryHackMe walkthroughs banner',
			desc: 'Detailed walkthroughs of TryHackMe boxes, documenting each step and takeaway.',
			tags: ['Write-ups', 'Linux', 'Web'],
			featured: false
		},
		{
			title: 'Python Penetration Testing',
			href: 'https://github.com/SaadBaig/Python-Pentesting-Practice',
			glow: '20, 202, 113',
			img: 'projects/pythondev.webp',
			alt: 'Python penetration testing tools banner',
			desc: 'A collection of home-baked Python tools for offensive security tasks.',
			tags: ['Python', 'Automation', 'Tooling'],
			featured: false
		},
		{
			title: 'Reverse Engineering',
			href: 'projects/reverse-engineering.html',
			glow: '0, 218, 234',
			img: 'projects/RE.webp',
			alt: 'Reverse engineering banner',
			desc: 'Taking binaries apart to understand how they work — notes, tools, and challenges.',
			tags: ['Ghidra', 'Assembly', 'Binary'],
			featured: false
		},
		{
			title: 'Exploit Development',
			href: 'https://github.com/SaadBaig/Basic-Exploitation-Practice',
			glow: '191, 0, 107',
			img: 'projects/exploitdev.webp',
			alt: 'Exploit development banner',
			desc: 'Hands-on practice writing my own exploits, from buffer overflows upward.',
			tags: ['C', 'Memory', 'Shellcode'],
			featured: false
		},
		{
			title: 'Machine Learning',
			href: 'projects/machine-learning.html',
			glow: '0, 139, 191',
			img: 'projects/ML.webp',
			alt: 'Machine learning banner',
			desc: 'Practicing something outside of security — experiments and models in ML.',
			tags: ['Python', 'ML', 'Data'],
			featured: false
		}
	];

	// Featured subset, sorted by the explicit `order` field.
	function featured() {
		return PROJECTS.filter(function (p) { return p.featured; })
			.slice()
			.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
	}

	global.SiteData = global.SiteData || {};
	global.SiteData.projects = PROJECTS;
	global.SiteData.featuredProjects = featured;
})(window);
