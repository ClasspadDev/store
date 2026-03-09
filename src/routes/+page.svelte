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

	let activeFilter = $state('all');
	let activeType = $state('all');

	function syncState() {
		const searchParams = new URLSearchParams(window.location.search);
		activeFilter = searchParams.get('tag') || 'all';
		activeType = searchParams.get('type') || 'all';
	}

	onMount(() => {
		syncState();
		window.addEventListener('hashchange', syncState);
		return () => window.removeEventListener('hashchange', syncState);
	});

	function updateUrl() {
		const url = new URL(window.location.href);
		if (activeFilter === 'all') url.searchParams.delete('tag');
		else url.searchParams.set('tag', activeFilter);

		if (activeType === 'all') url.searchParams.delete('type');
		else url.searchParams.set('type', activeType);

		url.hash = 't=' + Date.now();
		window.location.href = url.toString();
	}

	/** @param {string} value */
	function setFilter(value) {
		activeFilter = value;
		updateUrl();
	}

	/** @param {string} value */
	function setType(value) {
		activeType = activeType === value ? 'all' : value;
		updateUrl();
	}

	const baseFiltered = $derived(
		activeFilter === 'all'
			? data.apps
			: data.apps.filter((a) =>
					(a.tags ?? []).some(
						(/** @type {string} */ t) => t.toLowerCase() === activeFilter.toLowerCase()
					)
				)
	);

	const typeFiltered = $derived(
		activeType === 'all'
			? baseFiltered
			: activeType === 'hh3'
				? baseFiltered.filter((app) => !app.format?.endsWith('.py'))
				: baseFiltered.filter((app) => app.format?.endsWith('.py'))
	);

	const hh3Apps = $derived(typeFiltered.filter((app) => !app.format?.endsWith('.py')));
	const pyApps = $derived(typeFiltered.filter((app) => app.format?.endsWith('.py')));
</script>

<svelte:head>
	<title>App Store | HollyHock on ClassPad II</title>
	<link rel="canonical" href="https://store.classpad.dev/" />
	<meta
		name="description"
		content="Discover and install apps for your Casio ClassPad II calculator."
	/>
	<meta property="url" content="https://store.classpad.dev/" />
	<meta property="og:url" content="https://store.classpad.dev/" />
	<meta property="og:site_name" content="ClassPad.Dev Store" />
	<meta property="og:title" content="App Store | HollyHock on ClassPad II" />
	<meta
		property="og:description"
		content="Discover and install apps for your Casio ClassPad II calculator."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://classpaddev.github.io/favicon.ico" />
	<meta property="og:image:alt" content="ClassPad.Dev Store" />
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:title" content="App Store | HollyHock on ClassPad II" />
	<meta
		property="twitter:description"
		content="Discover and install apps for your Casio ClassPad II calculator."
	/>
	<meta property="twitter:image" content="https://classpaddev.github.io/favicon.ico" />
	<meta property="twitter:image:alt" content="ClassPad.Dev Store" />
</svelte:head>

<Header variant="home" />

<div class="container section">
	<h1 class="sr-only">App Store | HollyHock on ClassPad II</h1>
	<div class="filter-container">
		<div style="width:100%">
			<!-- <div class="filter-label">Categories</div> -->
			<div class="filter-group">
				<button
					class="filter-btn type-filter"
					class:active={activeType === 'hh3'}
					onclick={() => setType('hh3')}
				>
					HollyHock (hh3)
				</button>
				<button
					class="filter-btn type-filter python-filter"
					class:active={activeType === 'py'}
					onclick={() => setType('py')}
				>
					Python (.py)
				</button>

				<div class="filter-divider"></div>

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
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

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

	.type-filter {
		border-color: rgba(255, 255, 255, 0.3);
		color: #ddd;
	}
	.type-filter.active {
		background: #fff;
		color: #080808;
	}

	.type-filter.python-filter {
		border-color: rgba(0, 220, 104, 0.4);
		color: var(--cp-accent);
	}
	.type-filter.python-filter.active {
		background: var(--cp-accent);
		color: #080808;
	}

	.filter-divider {
		width: 1px;
		height: 20px;
		background: rgba(255, 255, 255, 0.2);
		margin: 0 0.5rem;
		align-self: center;
	}
</style>
