import { loadApps } from '$lib/meta.js';

/** @type {import('./$types').PageServerLoad} */
export function load() {
    return { apps: loadApps() };
}
