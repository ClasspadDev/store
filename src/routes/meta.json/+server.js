import { json } from '@sveltejs/kit';
import { loadApps } from '$lib/meta.js';

// Prerender this endpoint so adapter-static writes build/meta.json
export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export function GET() {
    const apps = loadApps();
    return json(apps, {
        headers: {
            'Cache-Control': 'public, max-age=300',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
