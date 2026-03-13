<script>
	import { base } from '$app/paths';
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import { downloadApp } from '$lib/downloadStore.js';

	// We'll mimic the utility function locally to ensure standalone functionality
	function getImageUrl(url) {
		if (!url) return '';
		if (url.startsWith('/')) return `https://classpaddev.github.io${url}`;
		return url;
	}

	// Hardcoded fallback snapshot just in case all fetches fail
	const FALLBACK_STATS = [
		{ appId: 'cp-doom', views: 31, downloads: 72, ratingCount: 1, averageScore: 5 },
		{ appId: 'cptime', views: 15, downloads: 28, ratingCount: 0, averageScore: 0 },
		{ appId: 'doodlepad', views: 4, downloads: 21, ratingCount: 0, averageScore: 0 },
		{ appId: 'cpboy', views: 10, downloads: 14, ratingCount: 0, averageScore: 0 },
		{ appId: 'cp-flappy-bird', views: 8, downloads: 13, ratingCount: 0, averageScore: 0 },
		{ appId: 'ced', views: 4, downloads: 12, ratingCount: 0, averageScore: 0 },
		{ appId: 'falling-sand-sim', views: 23, downloads: 9, ratingCount: 0, averageScore: 0 },
		{ appId: 'cinput', views: 3, downloads: 8, ratingCount: 0, averageScore: 0 },
		{ appId: 'snake-game', views: 12, downloads: 8, ratingCount: 1, averageScore: 3 },
		{ appId: 'minesnail', views: 3, downloads: 7, ratingCount: 0, averageScore: 0 },
		{ appId: 'python', views: 31, downloads: 7, ratingCount: 1, averageScore: 5 },
		{ appId: 'cp-pong', views: 5, downloads: 5, ratingCount: 0, averageScore: 0 }
	];

	const FALLBACK_META = {
		'snake-game': { name: 'Snake Game', author: 'The6P4C, SnailMath', image: '/store/images/cover/Snake.png' },
		'python': { name: 'Python', author: 'Lephe, Hollyhock Team', image: 'https://classpaddev.github.io/python/demo1.png' },
		'cp-pong': { name: 'CP Pong', author: 'SnailMath, PyCSharp' }
	};

	let apps = $state([]);
	let loading = $state(true);
	let searchTerm = $state('');
	let sortBy = $state('trending'); // 'trending' | 'downloads' | 'views' | 'rating'
	let scrollY = $state(0); // Track scroll position for morphing header
	let isScrolled = $state(false); // Managed state to prevent flickering

	$effect(() => {
		// Hysteresis logic to prevent scroll flickering. 
		// We wait until 100px to collapse, and only un-collapse when nearly at the top (<20px).
		if (scrollY > 100 && !isScrolled) {
			isScrolled = true;
		} else if (scrollY < 20 && isScrolled) {
			isScrolled = false;
		}
	});

	$effect(() => {
		async function loadData() {
			let metaData = [];
			let liveStats = [...FALLBACK_STATS]; // Start with fallback

			try {
				const response = await fetch('https://classpaddev.github.io/store/meta.json');
				if (response.ok) {
					metaData = await response.json();
				}
			} catch (error) {
				console.warn('Failed to fetch live meta.json, using fallbacks', error);
			}

			// Try to fetch stats, fallback to CORS Proxy if blocked
			try {
				const stats_response = await fetch('https://stats.classpad.dev/report-all-stats-please');
				if (stats_response.ok) {
					liveStats = await stats_response.json();
				} else {
					throw new Error("Direct fetch not ok");
				}
			} catch (error) {
				console.warn('Direct stats fetch failed (likely CORS). Attempting proxy fallback...', error);
				try {
					// Use AllOrigins as a free CORS proxy
					const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://stats.classpad.dev/report-all-stats-please');
					const proxy_response = await fetch(proxyUrl);
					if (proxy_response.ok) {
						liveStats = await proxy_response.json();
					}
				} catch (proxyError) {
					console.error('Proxy fetch also failed. Using hardcoded fallback stats.', proxyError);
				}
			}

			// Base our catalog entirely on the meta.json so we don't miss apps with 0 stats.
			// If meta.json failed to load, fallback to our hardcoded list.
			let baseApps = metaData.length > 0 
				? metaData 
				: Object.keys(FALLBACK_META).map(slug => ({ slug, ...FALLBACK_META[slug] }));

			apps = baseApps.map((meta) => {
				const slug = meta.slug;
				// Find matching live stats, or default to 0s if the app has never been downloaded/viewed
				const stat = liveStats.find((s) => s.appId === slug) || {
					appId: slug,
					downloads: 0,
					views: 0,
					ratingCount: 0,
					averageScore: 0
				};

				const name = meta.name || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

				return {
					id: slug,
					slug: slug,
					name,
					author: meta.author || 'Unknown Developer',
					description: meta.description || 'No description available.',
					image: meta.image,
					format: meta.format || '.hh3',
					tags: meta.tags || [],
					downloads: stat.downloads,
					views: stat.views,
					ratingCount: stat.ratingCount,
					rating: stat.averageScore,
					downloadUrl: meta.downloadUrl || '#',
					detailsUrl: `${base}/p/${slug}`, 
					// Core trending algorithm: Downloads are heavily weighted
					trendingScore: stat.downloads * 10 + stat.views * 2 + stat.averageScore * stat.ratingCount * 5
				};
			});
			loading = false;
		}

		loadData();
	});

	// Smart download logic to only popup for internal installable files
	function handleDownload(e, app) {
		const dlUrl = (app.downloadUrl || '').toLowerCase();
		const fmt = (app.format || '').toLowerCase();
		
		const validExts = ['.hh3', '.py', '.zip'];
		const isSupported = validExts.some(ext => dlUrl.endsWith(ext) || fmt.includes(ext));

		// If it's supported, trigger our internal popup. 
		// If not, we do NOT preventDefault, letting the browser naturally navigate to the URL.
		if (isSupported && dlUrl !== '#') {
			e.preventDefault();
			$downloadApp = app;
		}
	}

	// Svelte 5 Derived State for Sorting & Filtering
	let filteredApps = $derived(
		apps.filter((app) => 
			app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
			app.author.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	let sortedApps = $derived(
		[...filteredApps].sort((a, b) => {
			if (sortBy === 'downloads') return b.downloads - a.downloads;
			if (sortBy === 'views') return b.views - a.views;
			if (sortBy === 'rating') return b.rating * b.ratingCount - a.rating * a.ratingCount;
			return b.trendingScore - a.trendingScore;
		})
	);

	// Only show the top section when not actively searching, ensuring apps don't go missing.
	let showTopSection = $derived(searchTerm === '');
	let topTrending = $derived(showTopSection ? sortedApps.slice(0, 3) : []);
	let restOfApps = $derived(showTopSection ? sortedApps.slice(3) : sortedApps);

</script>

<svelte:head>
	<title>Store Stats | ClassPad.Dev</title>
</svelte:head>

<svelte:window bind:scrollY={scrollY} />

<!-- Morphing Sticky Header replacing standard Nav + Hero + Controls -->
<header class="morphing-header" class:scrolled={isScrolled}>


	<!-- Collapsible Hero Content -->
	<div class="container hero-container">
		<div class="hero-content">
			<h1>ClassPad <span class="accent-text">Store</span></h1>
			<!-- <p>See what the community is playing, building, and downloading right now.</p> -->
		</div>
	</div>

	<!-- Top Nav (Logo + Search) -->
	<div class="container top-nav">
		<a href="{base}/" class="logo">ClassPad<span>.Store</span></a>
		
		<div class="search-wrapper nav-search">
			<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
			<input type="text" bind:value={searchTerm} placeholder="Search apps by name or author..." class="search-input" />
		</div>
	</div>

	<!-- Filter Tags -->
	<div class="container filters-container">
		<div class="filter-group scrollable-tags">
			<!-- <span class="filter-label" class:hidden={isScrolled}>Sort By</span> -->
			<button class="filter-btn" class:active={sortBy === 'trending'} onclick={() => (sortBy = 'trending')}>Trending</button>
			<button class="filter-btn" class:active={sortBy === 'downloads'} onclick={() => (sortBy = 'downloads')}>Downloads</button>
			<button class="filter-btn" class:active={sortBy === 'views'} onclick={() => (sortBy = 'views')}>Views</button>
			<button class="filter-btn" class:active={sortBy === 'rating'} onclick={() => (sortBy = 'rating')}>Rating</button>
		</div>
	</div>
</header>

<main class="container section">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Crunching numbers...</p>
		</div>
	{:else}
		<!-- Top 3 Chart (Dynamic based on sort) -->
		{#if topTrending.length > 0}
			<div class="section-header" style="margin-bottom: 2rem;">
				<h2 class="section-title" style="margin-bottom: 0;">
					Top 3 {sortBy === 'trending' ? 'Chart' : sortBy === 'downloads' ? 'Downloads' : sortBy === 'views' ? 'Most Viewed' : 'Highest Rated'}
				</h2>
			</div>
			<div class="app-grid">
				{#each topTrending as app, i}
					<div class="app-card relative-wrapper" class:python-card={app.format === '.py'} style="overflow: visible;">
						<div class="rank-badge">#{i + 1}</div>
						<div class="app-header" style="padding-left: 2.5rem;">
							<div class="app-header-text">
								<div class="app-title">{app.name}</div>
								<div class="app-author">by <span class="author-link">{app.author}</span></div>
							</div>
						</div>
						<div class="app-body">
							<div class="app-image" style="background-image:url('{getImageUrl(app.image)}');">
								{#if !app.image}
									<div class="cover-placeholder">{app.name[0]}</div>
								{/if}
							</div>
							<div class="app-details">
								<div class="card-stats">
									<span class="stat-item" title="Downloads">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
										{app.downloads}
									</span>
									<span class="stat-item" title="Views">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
										{app.views}
									</span>
									{#if app.rating > 0}
										<span class="stat-item" title="Rating">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
											{app.rating.toFixed(1)}
										</span>
									{/if}
								</div>
								
								<div class="app-tags">
									{#each app.tags.slice(0, 3) as tag}
										<span class="app-tag">{tag}</span>
									{/each}
								</div>
								<p class="app-description">{app.description}</p>
								
								<div class="app-actions">
									<a 
										href={app.downloadUrl} 
										class="btn btn-primary app-btn AhrefsAnalytics-event-download AhrefsAnalytics-prop-app-{app.slug}"
										onclick={(e) => handleDownload(e, app)}
									>
										Download
									</a>
									<a href="{base}/p/{app.slug}" class="btn btn-secondary app-btn">Details</a>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div style="margin: 4rem 0 2rem; border-top: 1px dashed rgba(255,255,255,0.1);"></div>
		{/if}

		<!-- More Popular Apps -->
		<div class="section-header" style="margin-bottom: 2rem;">
			<h2 class="section-title" style="margin-bottom: 0;">
				{showTopSection ? 'More Popular Apps' : 'Search Results'}
			</h2>
		</div>

		<div class="app-grid">
			{#each restOfApps as app, i}
				<div class="app-card" class:python-card={app.format === '.py'}>
					<div class="app-header">
						<div class="app-header-text">
							<div class="app-title">{app.name}</div>
							<div class="app-author">by <span class="author-link">{app.author}</span></div>
						</div>
					</div>
					<div class="app-body">
						<div class="app-image" style="background-image:url('{getImageUrl(app.image)}');">
							{#if !app.image}
								<div class="cover-placeholder">{app.name[0]}</div>
							{/if}
						</div>
						<div class="app-details">
							<!-- Custom Injected Stats Row -->
							<div class="card-stats">
								<span class="stat-item" title="Downloads">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
									{app.downloads}
								</span>
								<span class="stat-item" title="Views">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
									{app.views}
								</span>
								{#if app.rating > 0}
									<span class="stat-item" title="Rating">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
										{app.rating.toFixed(1)}
									</span>
								{/if}
							</div>

							<div class="app-tags">
								{#each app.tags.slice(0, 3) as tag}
									<span class="app-tag">{tag}</span>
								{/each}
							</div>
							<p class="app-description">{app.description}</p>
							<div class="app-actions">
								<a 
									href={app.downloadUrl} 
									class="btn btn-primary app-btn AhrefsAnalytics-event-download AhrefsAnalytics-prop-app-{app.slug}"
									onclick={(e) => handleDownload(e, app)}
								>
									Download
								</a>
								<a href="{base}/p/{app.slug}" class="btn btn-secondary app-btn">Details</a>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="empty-state">
					<p>No apps found matching your criteria.</p>
				</div>
			{/each}
		</div>
	{/if}
</main>


<style>
	/* --------------------------------------
	   MORPHING STICKY HEADER 
	--------------------------------------- */
	.morphing-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: var(--cp-bg);
		padding: 2rem 0 1rem;
		border-bottom: 1px solid transparent;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		
		/* Prevents scroll-anchoring bounce loop when height shrinks */
		overflow-anchor: none; 
	}

	main.container {
		/* Ensures elements beneath don't force unexpected jumps */
		overflow-anchor: none;
	}

	/* We replicate the original .hero background SVG inside the header so it carries the theme seamlessly */
	.morphing-header::before {
		content: "";
		background: linear-gradient(rgba(31, 35, 37, 0) 0%, var(--cp-bg) 100%),
			url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="%2300dc68"/><path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="%2300dc68"/><path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="%2300dc68"/></svg>') center/cover no-repeat;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
		transition: opacity 0.3s ease;
	}

	/* Scrolled State */
	.morphing-header.scrolled {
		padding: 0.75rem 0 0.75rem;
		background: linear-gradient(var(--cp-bg), rgba(31, 35, 37, 0.95) 100%);

		/* backdrop-filter: blur(12px); */
		border-bottom: 1px solid rgba(0, 220, 104, 0.15);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.morphing-header.scrolled::before {
		opacity: 0;
	}

	/* Navigation Layout */
	.top-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		transition: all 0.3s ease;
	}

	.logo {
		font-family: 'Archivo Black', Arial, sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		text-decoration: none;
		color: var(--cp-white);
		transition: font-size 0.3s ease;
		opacity: 0;
		width: 0;
	}
	.logo span { color: var(--cp-accent); }
	
	.morphing-header.scrolled .logo {
		font-size: 1.25rem;
		opacity: 1;
		width: auto;
	}

	/* Morphing Search Bar */
	.nav-search {
		flex: 1 1 100%;
		order: 3;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		max-width: 600px;
		margin: 0 auto;
	}
	
	@media (min-width: 768px) {
		.morphing-header.scrolled .nav-search {
			flex: 0 1 400px;
			order: 2;
			margin: 0;
		}
	}

	.search-wrapper { position: relative; }
	
	.search-icon {
		position: absolute;
		left: 1.2rem;
		top: 50%;
		transform: translateY(-50%);
		width: 18px;
		height: 18px;
		color: var(--cp-text);
	}

	.search-input {
		width: 100%;
		padding: 0.9rem 1.2rem 0.9rem 3rem;
		border-radius: 2rem;
		background: rgba(71, 71, 74, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--cp-white);
		font-family: inherit;
		font-size: 1rem;
		outline: none;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.search-input::placeholder {
		color: var(--cp-text);
	}

	.morphing-header.scrolled .search-input {
		padding: 0.6rem 1rem 0.6rem 2.5rem;
		font-size: 0.9rem;
	}

	.search-input:focus {
		border-color: var(--cp-accent);
		background: rgba(0, 220, 104, 0.03);
	}

	/* Hero Collapse Animation */
	.hero-container {
		max-height: 200px;
		opacity: 1;
		overflow: hidden;
		transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
	}
	.hero-content {
		text-align: center;
		padding: 0.25rem 0 1.5rem;
		max-width: none;
		display: flex;
		align-items: baseline;
		gap: 16px;
	}
	.hero-content h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}
	.hero-content p {
		color: var(--cp-text);
		font-size: 1.1rem;
	}

	.morphing-header.scrolled .hero-container {
		max-height: 0;
		opacity: 0;
	}

	/* Scrollable Tags Container */
	.filters-container {
		margin-top: 1rem;
		transition: margin-top 0.3s ease;
	}

	.morphing-header.scrolled .filters-container {
		margin-top: 0.5rem;
	}

	.scrollable-tags {
		display: flex;
		gap: 0.6rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
		scrollbar-width: none;
		flex-wrap: nowrap !important;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}
	.scrollable-tags::-webkit-scrollbar {
		display: none;
	}

	.morphing-header.scrolled .scrollable-tags {
		justify-content: flex-start;
	}

	@media (max-width: 768px) {
		.scrollable-tags {
			justify-content: flex-start;
		}
	}

	.filter-label.hidden { display: none; }

	.accent-text {
		color: var(--cp-accent);
	}

	/* --------------------------------------
	   App Grid & Stat Adjustments 
	--------------------------------------- */
	.card-stats {
		display: flex;
		gap: 1.2rem;
		margin: 0.2rem 0 1rem 0;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--cp-white);
		font-weight: 600;
	}

	.stat-item svg {
		color: var(--cp-accent);
		opacity: 0.9;
	}

	/* Top Trending Specific Overrides */
	.relative-wrapper {
		position: relative;
	}

	.rank-badge {
		position: absolute;
		top: -12px;
		left: -12px;
		width: 44px;
		height: 44px;
		background: var(--cp-accent);
		color: var(--cp-text-black);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 900;
		font-size: 1.2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		z-index: 10;
		border: 2px solid var(--cp-bg);
	}

	.cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 4rem;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
		text-transform: uppercase;
	}

	/* UI States */
	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 0;
		color: var(--cp-text);
		text-align: center;
	}

	.app-header {
		border-radius: 1rem 1rem 0 0;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(0, 220, 104, 0.2);
		border-top-color: var(--cp-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>