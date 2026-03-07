<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import Header from '$lib/Header.svelte';
	import AppCard from '$lib/AppCard.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const ALL_TAGS = [
		{ label: 'All', value: 'all' },
		{ label: 'Games', value: 'Game' },
		{ label: 'Action', value: 'Action' },
		{ label: 'Puzzle', value: 'Puzzle' },
		{ label: 'Classic', value: 'Classic' },
		{ label: 'Strategy', value: 'Strategy' },
		{ label: 'RPG', value: 'RPG' },
		{ label: 'Emulators', value: 'Emulator' },
		{ label: 'Programming', value: 'Programming' },
		{ label: 'Utilities', value: 'Utility' },
		{ label: 'Education', value: 'Education' },
		{ label: 'Math', value: 'Math' },
		{ label: 'AI', value: 'AI' },
		{ label: 'Graphics', value: 'Graphics' }
	];

	// Active filter — starts as 'all', overridden client-side from ?tag= param
	let activeFilter = $state('all');

	onMount(() => {
		const param = new URLSearchParams(window.location.search).get('tag');
		if (param) activeFilter = param;
	});

	/** @param {string} value */
	function setFilter(value) {
		activeFilter = value;
		const url = new URL(window.location.href);
		if (value === 'all') {
			url.searchParams.delete('tag');
		} else {
			url.searchParams.set('tag', value);
		}
		history.replaceState(null, '', url.toString());
	}

	const filtered = $derived(
		activeFilter === 'all'
			? data.apps
			: data.apps.filter((a) =>
					(a.tags ?? []).some((t) => t.toLowerCase() === activeFilter.toLowerCase())
				)
	);

	const hh3Apps = $derived(filtered.filter((app) => !app.format?.endsWith('.py')));
	const pyApps = $derived(filtered.filter((app) => app.format?.endsWith('.py')));
</script>

<svelte:head>
	<title>App Store | HollyHock on ClassPad II</title>
	<meta
		name="description"
		content="Discover and install apps for your Casio ClassPad II calculator."
	/>
</svelte:head>

<Header variant="home" />

<div class="container section">
	<div class="filter-container">
		<div style="width:100%">
			<div class="filter-label">Categories</div>
			<div class="filter-group">
				{#each ALL_TAGS as tag}
					<button
						class="filter-btn"
						class:active={activeFilter === tag.value}
						onclick={() => setFilter(tag.value)}
					>
						{tag.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div id="apps-container">
		{#if hh3Apps.length === 0 && pyApps.length === 0}
			<div style="text-align:center;padding:3rem;color:#888">No apps found in this category.</div>
		{:else}
			{#if hh3Apps.length > 0}
				<div class="app-grid">
					{#each hh3Apps as app (app.id)}
						<AppCard {app} />
					{/each}
				</div>
			{/if}

			<div class="python-banner">
				<h3>Python Apps</h3>
				<p>
					These apps require the <strong>PythonExtra</strong> engine installed on your calculator to run
					properly.
				</p>
				<a
					href="https://classpaddev.github.io/python/"
					target="_blank"
					rel="noopener"
					class="btn btn-primary"
					style="margin-top:0.5rem">Learn More</a
				>
			</div>

			{#if pyApps.length > 0}
				<div class="app-grid">
					{#each pyApps as app (app.id)}
						<AppCard {app} />
					{/each}
				</div>
			{:else}
				<div style="text-align:center;padding:1.5rem;color:#888;font-size:0.9rem">
					No Python apps in this category.
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.python-banner {
		background: rgba(8, 126, 255, 0.1);
		border-left: 4px solid var(--cp-accent);
		padding: 1.5rem 2rem;
		margin: 3rem 0;
		border-radius: 0.5rem;
	}
	.python-banner h3 {
		margin: 0 0 0.5rem;
		color: var(--cp-accent);
		font-size: 1.25rem;
	}
	.python-banner p {
		margin: 0 0 1rem;
		color: rgba(255, 255, 255, 0.85);
	}
</style>
