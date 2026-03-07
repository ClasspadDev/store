<script>
	import { base } from '$app/paths';
	import Header from '$lib/Header.svelte';
	import AppCard from '$lib/AppCard.svelte';
	let { data } = $props();
	const title = $derived(
		`${data.type ? data.type.toUpperCase() : ''} ${data.category ? (data.category === 'game' ? 'Games' : 'Utilities') : ''} | ClassPad.Dev Store`.trim()
	);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<Header variant="back" backLabel="Back to All" backHref="{base}/" />

<div class="container section">
	<nav class="filter-breadcrumb">
		<a href="{base}/" class="home-icon" aria-label="Home">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				class="icon"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
				<polyline points="9 22 9 12 15 12 15 22"></polyline>
			</svg>
		</a>
		<span class="bc-sep">/</span>
		<a href="{base}/">All apps</a>
		<span>/</span>
		<span>{data.type}</span>
	</nav>

	<h1 class="filter-title">{title}</h1>

	{#if data.apps.length === 0}
		<p style="color:#888;padding:2rem 0">No apps found.</p>
	{:else}
		<div class="app-grid" style="margin-top:1.5rem">
			{#each data.apps as app (app.id ?? app.slug)}
				<AppCard {app} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.filter-breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 0 0.5rem;
		font-size: 0.85rem;
		color: var(--cp-text);
	}
	.filter-breadcrumb a {
		color: var(--cp-text);
		text-decoration: none;
	}
	.filter-breadcrumb a:hover {
		color: var(--cp-accent);
	}
	.filter-title {
		font-size: clamp(1.5rem, 3vw, 2rem);
		color: var(--cp-white);
		margin-bottom: 0.5rem;
	}
</style>
