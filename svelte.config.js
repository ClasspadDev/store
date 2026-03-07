import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
		}),
		paths: {
			base: '/store',
		},
		prerender: {
			// /admin/ is a static Sveltia CMS folder — not a SvelteKit route
			handleHttpError: ({ path, referrer, message }) => {
				if (path.startsWith('/store/admin') || path.startsWith('/admin')) return;
				throw new Error(message);
			},
		},
	}
};

export default config;
