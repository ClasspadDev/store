import { loadApps } from '$lib/meta.js';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
    return loadApps()
        .filter((a) => a.slug)
        .map((a) => ({ slug: a.slug }));
}

/**
 * Smart relevance score between candidate and current app.
 * Weighs: tag overlap (heaviest) + rating + download popularity.
 * @param {Record<string,any>} candidate
 * @param {Set<string>} currentTags
 */
function relevanceScore(candidate, currentTags) {
    // Tag overlap — each shared tag counts 10 points
    const tagScore = (candidate.tags ?? [])
        .filter((/** @type {string} */ t) => currentTags.has(t)).length * 10;

    // Rating/5 → 0-2 points
    const ratingScore = parseFloat(candidate.rating ?? 0) / 5 * 2;

    // Downloads: parse "2k+" → 2000, "500+" → 500, raw number → as-is
    const rawDl = String(candidate.downloads ?? '0').replace('+', '');
    const dlNum = rawDl.endsWith('k') ? parseFloat(rawDl) * 1000
        : rawDl.endsWith('m') ? parseFloat(rawDl) * 1_000_000
            : parseFloat(rawDl) || 0;
    // Logarithmic scale → 0-2 points
    const dlScore = dlNum > 0 ? Math.log10(dlNum) / 5 * 2 : 0;

    return tagScore + ratingScore + dlScore;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const allApps = loadApps();
    const app = allApps.find((a) => a.slug === params.slug);
    if (!app) error(404, 'App not found');

    // Render long description markdown server-side
    const longDescriptionHtml = app.longDescription
        ? await marked.parse(app.longDescription, { breaks: true })
        : null;

    // Top-4 related apps: same tags, exclude self, sorted by smart score
    const currentTags = new Set(app.tags ?? []);
    const related = allApps
        .filter((a) => a.slug !== params.slug && (a.tags ?? []).some((/** @type {string} */ t) => currentTags.has(t)))
        .map((a) => ({ app: a, score: relevanceScore(a, currentTags) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((x) => x.app);

    return { app, longDescriptionHtml, related };
}
