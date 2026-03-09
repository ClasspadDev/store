<script>
	import { base } from '$app/paths';
	import Header from '$lib/Header.svelte';
	import AppCard from '$lib/AppCard.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const dev = $derived(data.dev);
	const apps = $derived(data.apps);
	const featuredApp = $derived(data.featuredApp);

	const featuredSlides = $derived(
		featuredApp?.screenshots?.length
			? featuredApp.screenshots
			: featuredApp?.image
				? [featuredApp.image]
				: []
	);

	import { getImageUrl } from '$lib/utils.js';
	// Filmstrip scroll
	/** @type {HTMLElement|null} */
	let filmstrip = $state(null);
	let filmCanScrollLeft = $state(false);
	let filmCanScrollRight = $state(false);

	function updateScrollState() {
		if (!filmstrip) return;
		filmCanScrollLeft = filmstrip.scrollLeft > 4;
		filmCanScrollRight = filmstrip.scrollLeft + filmstrip.clientWidth < filmstrip.scrollWidth - 4;
	}

	/**
	 * @param {number} dir
	 */
	function scrollFilmstrip(dir) {
		filmstrip?.scrollBy({ left: dir * 230, behavior: 'smooth' });
	}

	import { onMount, tick } from 'svelte';
	onMount(async () => {
		await tick();
		updateScrollState();
	});

	const devSchema = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'ProfilePage',
			mainEntity: {
				'@type': 'Person',
				name: dev.name,
				url: `https://store.classpad.dev/dev/${dev.name}`,
				description: dev.headline || 'Developer on ClassPad.Dev Store'
			}
		})
	);
</script>

<svelte:head>
	<title>{dev.name} - ClassPad Store</title>
	<meta property="url" content={`https://store.classpad.dev/dev/${dev.name}`} />
	<meta property="og:url" content={`https://store.classpad.dev/dev/${dev.name}`} />
	<meta property="og:site_name" content="ClassPad.Dev Store" />
	<meta property="og:title" content={`${dev.name} - ClassPad Store`} />
	<meta property="og:description" content={dev.headline || 'Developer on ClassPad.Dev Store'} />
	<meta property="og:type" content="profile" />
	<meta property="og:image" content="https://classpaddev.github.io/favicon.ico" />
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:title" content={`${dev.name} - ClassPad Store`} />
	<meta
		property="twitter:description"
		content={dev.headline || 'Developer on ClassPad.Dev Store'}
	/>
	<meta property="twitter:image" content="https://classpaddev.github.io/favicon.ico" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<script type="application/ld+json">
{@html devSchema}
	</script>
</svelte:head>

<Header />

<main class="container">
	<!--  Breadcrumb  -->
	<nav class="breadcrumb" aria-label="Breadcrumb">
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
		<span class="bc-current">{dev.name}</span>
	</nav>

	<section class="dev-profile">
		<div class="dev-info">
			<div class="dev-avatar">
				{dev.name[0]?.toUpperCase()}
			</div>
			<div>
				<h1 class="dev-name">{dev.name}</h1>
				<span class="dev-type">Developer</span>
			</div>
		</div>

		{#if dev.headline}
			<blockquote class="dev-headline">
				{dev.headline}
			</blockquote>
		{/if}
	</section>

	{#if featuredApp}
		<section class="featured-section">
			<h2 class="section-title">✨ Featured Application</h2>
			<div class="featured-card">
				<div class="filmstrip-wrapper">
					{#if featuredSlides.length > 1}
						<button
							class="film-arrow film-prev"
							class:visible={filmCanScrollLeft}
							onclick={(e) => {
								e.preventDefault();
								scrollFilmstrip(-1);
							}}
							aria-label="Scroll left"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"><polyline points="15 18 9 12 15 6" /></svg
							>
						</button>
					{/if}

					<div
						class="filmstrip"
						class:fade-left={filmCanScrollLeft}
						class:fade-right={filmCanScrollRight}
						bind:this={filmstrip}
						onscroll={updateScrollState}
					>
						{#each featuredSlides as slide}
							<div class="film-slide">
								<img
									src={getImageUrl(slide)}
									alt="{featuredApp.name} screenshot"
									class="film-img"
								/>
							</div>
						{/each}
						{#if featuredSlides.length === 0}
							<div class="film-slide placeholder">
								<span class="cover-placeholder">{featuredApp.name[0]}</span>
							</div>
						{/if}
					</div>

					{#if featuredSlides.length > 1}
						<button
							class="film-arrow film-next"
							class:visible={filmCanScrollRight}
							onclick={(e) => {
								e.preventDefault();
								scrollFilmstrip(1);
							}}
							aria-label="Scroll right"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg
							>
						</button>
					{/if}
				</div>

				<div class="featured-body">
					<div class="featured-header">
						<div>
							<span class="featured-tag">{featuredApp.tags?.[0] || 'App'}</span>
							<h3 class="featured-name">{featuredApp.name}</h3>
						</div>
						<a href="{base}/p/{featuredApp.slug}" class="btn btn-primary featured-btn"
							>View Details</a
						>
					</div>
					<p class="featured-desc">{featuredApp.description}</p>
				</div>
			</div>
		</section>
	{/if}

	<section class="all-apps-section">
		<h2 class="section-title">All by {dev.name} ({apps.length})</h2>
		<div class="app-grid">
			{#each apps as app}
				<AppCard {app} />
			{/each}
		</div>
	</section>
</main>

<style>
	/* Breadcrumb (reusing from app detail but specific) */
	.breadcrumb {
		margin-bottom: 1.5rem;
	}

	/* Dev Profile */
	.dev-profile {
		margin-bottom: 3.5rem;
	}
	.dev-info {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}
	.dev-avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(135deg, rgba(0, 220, 104, 0.2), rgba(0, 150, 255, 0.2));
		border: 2px solid var(--cp-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 800;
		color: var(--cp-white);
		box-shadow: 0 0 20px rgba(0, 220, 104, 0.15);
	}
	.dev-name {
		font-size: 2.25rem;
		font-weight: 800;
		margin: 0 0 0.25rem;
		color: var(--cp-white);
	}
	.dev-type {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 2px;
		color: var(--cp-accent);
		font-weight: 700;
	}
	.dev-headline {
		margin: 0;
		padding: 1.25rem 1.5rem;
		background: rgba(255, 255, 255, 0.04);
		border-left: 4px solid var(--cp-accent);
		border-radius: 0 0.5rem 0.5rem 0;
		font-size: 1.15rem;
		line-height: 1.6;
		color: var(--cp-white);
		font-style: italic;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--cp-white);
		margin: 0 0 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Featured App Card with Filmstrip */
	.featured-section {
		margin-bottom: 4rem;
	}
	.featured-card {
		background: var(--cp-card-bg, rgba(255, 255, 255, 0.04));
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 1rem;
		overflow: hidden;
	}
	.filmstrip-wrapper {
		position: relative;
		background: #080808;
		padding: 1.5rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}
	.filmstrip {
		display: flex;
		gap: 0.6rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		padding: 0 1.5rem;
	}
	.filmstrip::-webkit-scrollbar {
		display: none;
	}
	.filmstrip.fade-left {
		-webkit-mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 100%);
		mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 100%);
	}
	.filmstrip.fade-right {
		-webkit-mask-image: linear-gradient(to left, transparent 0, #000 6%, #000 100%);
		mask-image: linear-gradient(to left, transparent 0, #000 6%, #000 100%);
	}
	.filmstrip.fade-left.fade-right {
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0,
			#000 6%,
			#000 94%,
			transparent 100%
		);
		mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%);
	}
	.film-slide {
		flex-shrink: 0;
		scroll-snap-align: start;
		border-radius: 0.5rem;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #111;
	}
	.film-slide.placeholder {
		width: 320px;
		height: 250px;
	}
	.film-img {
		display: block;
		height: 300px;
		width: auto;
		object-fit: contain;
	}
	.cover-placeholder {
		font-size: 3rem;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.1);
	}

	.film-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 3;
		background: rgba(10, 10, 10, 0.75);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #fff;
		opacity: 0;
		transition:
			opacity 0.2s,
			background 0.2s,
			transform 0.2s;
	}
	.film-arrow.visible {
		opacity: 1;
	}
	.film-arrow:hover {
		background: var(--cp-accent);
		color: #000;
		transform: translateY(-50%) scale(1.1);
	}
	.film-prev {
		left: 0.5rem;
	}
	.film-next {
		right: 0.5rem;
	}

	@media (max-width: 600px) {
		.film-arrow {
			display: none;
		}
		.filmstrip.fade-left,
		.filmstrip.fade-right,
		.filmstrip.fade-left.fade-right {
			mask-image: none;
			-webkit-mask-image: none;
		}
	}

	.featured-body {
		padding: 1.5rem;
	}
	.featured-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}
	.featured-tag {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--cp-accent);
		font-weight: 700;
		display: block;
		margin-bottom: 0.4rem;
	}
	.featured-name {
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--cp-white);
		margin: 0;
	}
	.featured-desc {
		color: var(--cp-text);
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0;
	}
	@media (max-width: 640px) {
		.featured-header {
			flex-direction: column;
		}
	}
</style>
