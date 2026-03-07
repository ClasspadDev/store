import { loadApps } from '$lib/meta.js';

export const prerender = true;

const GAME_TAGS = new Set(['Game', 'Action', 'Puzzle', 'Classic', 'Strategy', 'RPG', 'Arcade']);

/** @type {import('./$types').EntryGenerator} */
export function entries() {
    return ['game', 'utility'].map((cat) => ({ cat }));
}

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
    const all = loadApps();
    const apps = all.filter((a) => {
        const isGame = (a.tags ?? []).some((/** @type {string} */ t) => GAME_TAGS.has(t));
        return params.cat === 'game' ? isGame : !isGame;
    });
    return { apps, category: params.cat };
}
