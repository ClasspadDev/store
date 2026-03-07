import { loadApps } from '$lib/meta.js';

export const prerender = true;

/** @type {import('./$types').EntryGenerator} */
export function entries() {
    return ['hh3', 'hh2', 'python'].map((type) => ({ type }));
}

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
    const all = loadApps();
    const apps = all.filter((a) => {
        const fmt = (a.format ?? '.hh3').toLowerCase();
        if (params.type === 'python') return fmt.endsWith('.py');
        if (params.type === 'hh2') return fmt.includes('hh2');
        return fmt.includes('hh3');
    });
    return { apps, type: params.type };
}
