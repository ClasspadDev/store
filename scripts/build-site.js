#!/usr/bin/env node
/**
 * build-site.js
 * Reads meta.json + _parts/ templates + common.css, then:
 *  1. Generates  p/<slug>.html  for every app (detail pages)
 *  2. Rewrites   index.html     with a baked-in app grid (no runtime fetch needed)
 *
 * Compatible with: Node.js >= 18, Bun
 *
 * Usage:
 *   node scripts/build-site.js
 *   bun scripts/build-site.js
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

//  helpers 

const file = (...p) => readFile(join(ROOT, ...p), "utf8");
const esc = (s = "") => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

//  shared shell 

function shell({ title, rootPrefix, head = "", body, footer }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${rootPrefix}common.css" type="text/css" />
${head}
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="${rootPrefix}index.html" class="logo">ClassPad<span>.Dev</span></a>
                <a href="${rootPrefix}index.html" class="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    ${title.startsWith("App Store") ? "Back to ClassPad" : "\u2190 All Apps"}
                </a>
            </div>
        </div>
    </header>

${body}

${footer}
</body>
</html>`;
}

//  card HTML (for index page grid) 

function appCardHtml(app, rootPrefix = "") {
    const imgUrl = app.image || `https://placehold.co/240x396/1f2325/00dc68?text=${encodeURIComponent(app.name)}`;
    const pos = app.position ? `background-position:${app.position}` : "";
    const tags = (app.tags || []).map(t => `<span class="app-tag">${esc(t)}</span>`).join("");
    const detailHref = `${rootPrefix}p/${app.slug}.html`;

    return `
    <div class="app-card" data-tags="${esc((app.tags || []).join(","))}">
        <div class="app-header">
            <div>
                <div class="app-title">${esc(app.name)}</div>
                <div class="app-author">by ${esc(app.author)}</div>
            </div>
        </div>
        <div class="app-body">
            <div class="app-image" style="background-image:url('${imgUrl}');${pos}"></div>
            <div class="app-details">
                <div class="app-tags">${tags}</div>
                <p class="app-description">${esc(app.description)}</p>
                <div class="app-actions">
                    <a href="${esc(app.downloadUrl)}" class="btn btn-primary app-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
                            <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"></path>
                        </svg>
                        Download
                    </a>
                    <a href="${esc(detailHref)}" class="btn btn-secondary app-btn">Details</a>
                </div>
            </div>
        </div>
    </div>`;
}

//  per-app detail page 

function appDetailPage(app, footer) {
    const slides = app.screenshots?.length
        ? app.screenshots
        : (app.image ? [app.image] : []);

    const coverPos = app.position || "center";

    const slidesHtml = slides.map((src, i) => `
        <div class="carousel-slide${i === 0 ? " active" : ""}" data-index="${i}">
            <div class="carousel-img" style="background-image:url('${src}');background-position:${i === 0 && !app.screenshots?.length ? coverPos : "center"}"></div>
        </div>`).join("");

    const thumbsHtml = slides.length > 1 ? `
    <div class="carousel-thumbs">
        ${slides.map((src, i) => `
        <button class="carousel-thumb${i === 0 ? " active" : ""}" data-index="${i}"
            style="background-image:url('${src}');background-position:${i === 0 && !app.screenshots?.length ? coverPos : "center"}"
            aria-label="Screenshot ${i + 1}"></button>`).join("")}
    </div>` : "";

    const tags = (app.tags || []).map(t => `<span class="app-tag">${esc(t)}</span>`).join("");

    const body = `
    <div class="app-detail-page">
        <div class="container">
            <div class="detail-layout">

                <!-- LEFT: carousel -->
                <div class="detail-media">
                    <div class="carousel" id="carousel">
                        <div class="carousel-track">${slidesHtml}
                        </div>
                        ${slides.length > 1 ? `
                        <button class="carousel-arrow carousel-prev" aria-label="Previous">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <button class="carousel-arrow carousel-next" aria-label="Next">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>` : ""}
                    </div>
                    ${thumbsHtml}
                </div>

                <!-- RIGHT: info panel -->
                <div class="detail-panel">
                    <div class="detail-cover" style="background-image:url('${app.image || ""}');background-position:${coverPos}"></div>
                    <div class="detail-info">
                        <h1 class="detail-title">${esc(app.name)}</h1>
                        <p class="detail-author">by <strong>${esc(app.author)}</strong></p>
                        <div class="app-tags detail-tags">${tags}</div>
                        <span class="detail-format">${esc(app.format || ".hh3")}</span>
                        <p class="detail-description">${esc(app.description)}</p>
                        <div class="detail-actions">
                            <a href="${esc(app.downloadUrl)}" class="btn btn-primary detail-download-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"></path>
                                </svg>
                                Download ${esc(app.format || ".hh3")}
                            </a>
                            <a href="${esc(app.detailsUrl)}" class="btn btn-secondary" target="_blank" rel="noopener">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                Source / Details
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script>
    (function() {
        const track  = document.querySelector('.carousel-track');
        const slides = document.querySelectorAll('.carousel-slide');
        const thumbs = document.querySelectorAll('.carousel-thumb');
        let current = 0;

        function goTo(n) {
            slides[current].classList.remove('active');
            if (thumbs[current]) thumbs[current].classList.remove('active');
            current = (n + slides.length) % slides.length;
            slides[current].classList.add('active');
            if (thumbs[current]) thumbs[current].classList.add('active');
        }

        document.querySelector('.carousel-prev')?.addEventListener('click', () => goTo(current - 1));
        document.querySelector('.carousel-next')?.addEventListener('click', () => goTo(current + 1));
        thumbs.forEach(t => t.addEventListener('click', () => goTo(+t.dataset.index)));

        // Keyboard
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  goTo(current - 1);
            if (e.key === 'ArrowRight') goTo(current + 1);
        });

        // Touch/swipe
        let startX = 0;
        track?.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
        track?.addEventListener('touchend',   e => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
        });
    })();
    </script>`;

    return shell({
        title: `${app.name} | ClassPad.Dev Store`,
        rootPrefix: "../",
        footer,
        head: `    <meta name="description" content="${esc(app.description)}">
    <style>
        /*  detail page layout  */
        .app-detail-page { padding: 2rem 0 4rem; }
        .detail-layout {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 2.5rem;
            align-items: start;
        }
        @media(max-width:860px) {
            .detail-layout { grid-template-columns: 1fr; }
        }

        /* carousel */
        .detail-media { position: sticky; top: 1rem; }
        .carousel { position: relative; border-radius: 1rem; overflow: hidden; background: #111; aspect-ratio: 16/10; }
        .carousel-track { width: 100%; height: 100%; }
        .carousel-slide { position: absolute; inset: 0; opacity: 0; transition: opacity .35s ease; }
        .carousel-slide.active { opacity: 1; }
        .carousel-img { width: 100%; height: 100%; background-size: cover; background-position: center; }
        .carousel-arrow {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: rgba(0,0,0,.55); border: none; border-radius: 50%;
            width: 40px; height: 40px; cursor: pointer; color: #fff;
            display: flex; align-items: center; justify-content: center;
            transition: background .2s;
        }
        .carousel-arrow:hover { background: rgba(0,220,104,.7); color: #000; }
        .carousel-prev { left: .75rem; }
        .carousel-next { right: .75rem; }

        /* thumbnails */
        .carousel-thumbs {
            display: flex; gap: .5rem; margin-top: .75rem;
            overflow-x: auto; padding-bottom: .25rem;
        }
        .carousel-thumb {
            flex-shrink: 0; width: 80px; height: 54px;
            border-radius: 6px; border: 2px solid transparent;
            background-size: cover; background-position: center;
            cursor: pointer; transition: border-color .2s, opacity .2s;
            opacity: .6;
        }
        .carousel-thumb.active, .carousel-thumb:hover { border-color: var(--cp-accent); opacity: 1; }

        /* right panel */
        .detail-panel {
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 1rem; padding: 1.5rem;
            display: flex; flex-direction: column; gap: 1rem;
        }
        .detail-cover {
            width: 100%; aspect-ratio: 3/2;
            border-radius: .6rem; background-size: cover;
            background-position: center; background-color: #2a2d30;
        }
        .detail-title  { font-size: 1.6rem; margin: 0; }
        .detail-author { color: var(--cp-text); margin: 0; font-size: .9rem; }
        .detail-tags   { gap: .4rem; }
        .detail-format {
            display: inline-block; padding: .2rem .6rem;
            background: rgba(0,220,104,.15); color: var(--cp-accent);
            border: 1px solid rgba(0,220,104,.3); border-radius: 4px;
            font-family: monospace; font-size: .8rem;
        }
        .detail-description {
            color: var(--cp-text); font-size: .95rem; line-height: 1.7;
            margin: 0; white-space: pre-wrap;
        }
        .detail-actions { display: flex; flex-direction: column; gap: .6rem; }
        .detail-download-btn { font-size: 1rem; padding: .85rem 1.5rem; justify-content: center; }
    </style>`,
        body,
        footer,
    });
}

//  index page body 

function indexPageBody(apps) {
    const cards = apps.map(a => appCardHtml(a, "")).join("\n");

    return `
    <div class="container section">
        <div class="filter-container">
            <div style="width:100%">
                <div class="filter-label">Categories</div>
                <div class="filter-group" id="filter-categories">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="Game">Games</button>
                    <button class="filter-btn" data-filter="Action">Action</button>
                    <button class="filter-btn" data-filter="Strategy">Strategy</button>
                    <button class="filter-btn" data-filter="RPG">RPG</button>
                    <button class="filter-btn" data-filter="Puzzle">Puzzle</button>
                    <button class="filter-btn" data-filter="Classic">Classic</button>
                    <button class="filter-btn" data-filter="Education">Education</button>
                    <button class="filter-btn" data-filter="Math">Math</button>
                    <button class="filter-btn" data-filter="Physics_Chemistry">Physics/Chemistry</button>
                    <button class="filter-btn" data-filter="AI">AI</button>
                    <button class="filter-btn" data-filter="Utility">Utilities</button>
                    <button class="filter-btn" data-filter="Graphics">Graphics</button>
                    <button class="filter-btn" data-filter="Emulator">Emulators</button>
                    <button class="filter-btn" data-filter="Programming">Programming</button>
                </div>
            </div>
        </div>

        <div id="apps-container">
            <div class="app-grid" id="apps-grid">
${cards}
            </div>
        </div>
    </div>

    <script>
    (function() {
        const grid  = document.getElementById('apps-grid');
        const cards = Array.from(grid.querySelectorAll('.app-card'));

        function setFilter(filter) {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.filter === filter);
            });
            let visible = 0;
            cards.forEach(c => {
                const tags = (c.dataset.tags || '').toLowerCase().split(',');
                const show = filter === 'all' || tags.includes(filter.toLowerCase());
                c.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            // empty state
            let msg = grid.querySelector('.no-results');
            if (visible === 0) {
                if (!msg) { msg = document.createElement('div'); msg.className = 'no-results'; msg.style = 'text-align:center;padding:3rem;color:#888;grid-column:1/-1'; grid.appendChild(msg); }
                msg.textContent = 'No apps found in this category.';
            } else if (msg) msg.remove();
        }

        document.querySelectorAll('.filter-btn').forEach(btn =>
            btn.addEventListener('click', () => setFilter(btn.dataset.filter))
        );

        // URL param
        const p = new URLSearchParams(location.search).get('type');
        if (p) setFilter(p.charAt(0).toUpperCase() + p.slice(1));
    })();
    </script>`;
}

//  main 

async function main() {
    const [meta, footer] = await Promise.all([
        file("meta.json").then(JSON.parse),
        file("_parts", "footer.html"),
    ]);

    // 1. Per-app detail pages → p/<slug>.html
    const pDir = join(ROOT, "p");
    await mkdir(pDir, { recursive: true });

    for (const app of meta) {
        if (!app.slug) { console.warn(`[build-site] \u26a0 skipping app without slug: ${app.name}`); continue; }
        const html = appDetailPage(app, footer);
        await writeFile(join(pDir, `${app.slug}.html`), html, "utf8");
        console.log(`[build-site] \u2713 p/${app.slug}.html  (${app.screenshots?.length ?? 0} screenshots)`);
    }

    // 2. Regenerate index.html
    const indexHtml = shell({
        title: "App Store | HollyHock on ClassPad II",
        rootPrefix: "./",
        body: indexPageBody(meta),
        footer,
    });
    await writeFile(join(ROOT, "index.html"), indexHtml, "utf8");
    console.log(`\n[build-site] \u2713 index.html  (${meta.length} apps)`);
    console.log(`[build-site] Done.`);
}

main().catch(e => { console.error(e); process.exit(1); });
