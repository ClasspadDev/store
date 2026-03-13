<script>
	import '$lib/common.css';
	import Footer from '$lib/Footer.svelte';
	import DownloadPopup from '$lib/DownloadPopup.svelte';

	let { children } = $props();

	const orgSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': 'https://store.classpad.dev/',
		name: 'ClassPad.Dev Store',
		url: 'https://store.classpad.dev/',
		logo: 'https://classpaddev.github.io/favicon.ico',
		sameAs: [
			'https://github.com/ClasspadDev',
			'https://classpaddev.github.io/',
			'https://classpad.dev/'
		],
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://store.classpad.dev/?tag={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="https://classpaddev.github.io/favicon.ico" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${orgSchema}</script>`}
</svelte:head>

{@render children()}
<Footer />
<DownloadPopup />
