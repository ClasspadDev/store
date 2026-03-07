<script>
	import '$lib/common.css';
	import Footer from '$lib/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="https://classpaddev.github.io/favicon.ico" />
</svelte:head>

{@render children()}
<Footer />
