import { loadApps, loadDevs } from '$lib/meta.js';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
    const apps = loadApps();
    const authors = new Set(apps.map((a) => a.author).filter(Boolean));
    const devs = loadDevs();
    for (const d of devs) authors.add(d.id);

    return Array.from(authors).map((author) => ({ dev: author }));
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const devId = params.dev;

    const devs = loadDevs();
    const devProfile = devs.find((d) => d.id === devId) || { id: devId, name: devId, headline: null, featuredApp: null };

    const apps = loadApps();
    const devApps = apps.filter((a) => a.author === devId);

    if (devApps.length === 0 && !devProfile.headline && devProfile.name === devId) {
        // Technically an unknown dev with no apps
        error(404, 'Developer not found');
    }

    let featuredAppEntry = null;
    if (devProfile.featuredApp) {
        featuredAppEntry = devApps.find((a) => a.slug === devProfile.featuredApp) || apps.find((a) => a.slug === devProfile.featuredApp) || null;
    } else if (devApps.length > 0) {
        // Fallback to highest rated or highest downloaded
        featuredAppEntry = [...devApps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))[0];
    }

    return {
        dev: devProfile,
        apps: devApps,
        featuredApp: featuredAppEntry
    };
}
