import { base } from '$app/paths';

/**
 * Normalizes a URL, ensuring it correctly respects the SvelteKit base path,
 * while stripping duplicate or conflicting `/store` prefixes.
 * @param {string} url
 * @returns {string}
 */
export function getImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    let path = url;
    if (path.startsWith('/store/')) path = path.slice(6);
    else if (path.startsWith('store/')) path = '/' + path.slice(6);
    else if (!path.startsWith('/')) path = '/' + path;

    return base + path;
}
