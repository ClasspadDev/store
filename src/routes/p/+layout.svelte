<script>
	import '$lib/common.css';
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="https://classpaddev.github.io/favicon.ico" />
</svelte:head>

<Header variant="back" backLabel="Back to Apps" backHref="{base}/" />
{@render children()}
