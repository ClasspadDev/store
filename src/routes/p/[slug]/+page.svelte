<script>
	import { base } from '$app/paths';

	let { data } = $props();
	const app = $derived(data.app);
	const longDescriptionHtml = $derived(data.longDescriptionHtml);
	const related = $derived(data.related ?? []);

	import RelCard from '$lib/RelCard.svelte';
	import { getImageUrl } from '$lib/utils.js';

	const slides = $derived(app.screenshots?.length ? app.screenshots : app.image ? [app.image] : []);

	const isPy = $derived(app.format?.endsWith('.py') ?? false);
	const hasSupport = $derived(!!(app.website || app.contact || app.privacy));
	const hasStats = $derived(!!(app.rating || app.downloads));

	//  Breadcrumb helpers
	/** Derive type slug from format */
	const typeSlug = $derived(isPy ? 'python' : app.format?.includes('hh2') ? 'hh2' : 'hh3');
	const typeLabel = $derived(typeSlug);

	const GAME_TAGS = new Set(['Game', 'Action', 'Puzzle', 'Classic', 'Strategy', 'RPG', 'Arcade']);
	const appTags = $derived(new Set(app.tags ?? []));
	const categorySlug = $derived([...appTags].some((t) => GAME_TAGS.has(t)) ? 'game' : 'utility');
	const categoryLabel = $derived(categorySlug === 'game' ? 'Game' : 'Utility');

	//  Filmstrip scroll
	let filmstrip = $state(/** @type {HTMLElement|null} */ (null));
	let filmCanScrollLeft = $state(false);
	let filmCanScrollRight = $state(false);

	function updateScrollState() {
		if (!filmstrip) return;
		filmCanScrollLeft = filmstrip.scrollLeft > 4;
		filmCanScrollRight = filmstrip.scrollLeft + filmstrip.clientWidth < filmstrip.scrollWidth - 4;
	}

	/** @param {number} dir */
	function scrollFilmstrip(dir) {
		filmstrip?.scrollBy({ left: dir * 230, behavior: 'smooth' });
	}

	function onKeydown(/** @type {KeyboardEvent} */ e) {
		if (e.key === 'ArrowLeft') scrollFilmstrip(-1);
		if (e.key === 'ArrowRight') scrollFilmstrip(1);
		if (e.key === 'Escape') closeLightbox();
	}

	//  Lightbox
	let lightboxIndex = $state(/** @type {number|null} */ (null));
	const lightboxOpen = $derived(lightboxIndex !== null);

	/** @param {number} i */
	function openLightbox(i) {
		lightboxIndex = i;
	}
	function closeLightbox() {
		lightboxIndex = null;
	}
	function lightboxNext() {
		if (lightboxIndex !== null) lightboxIndex = (lightboxIndex + 1) % slides.length;
	}
	function lightboxPrev() {
		if (lightboxIndex !== null) lightboxIndex = (lightboxIndex - 1 + slides.length) % slides.length;
	}

	let lbTouchX = 0;
	function lbTouchStart(/** @type {TouchEvent} */ e) {
		lbTouchX = e.touches[0].clientX;
	}
	function lbTouchEnd(/** @type {TouchEvent} */ e) {
		const dx = e.changedTouches[0].clientX - lbTouchX;
		if (Math.abs(dx) > 50) dx < 0 ? lightboxNext() : lightboxPrev();
	}
</script>

<svelte:head>
	<title>{app.name} | ClassPad.Dev Store</title>
	<meta name="description" content={app.description} />
</svelte:head>
<svelte:window onkeydown={onKeydown} />

<div class="app-detail-page">
	<div class="container">
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

			<a href="{base}/type/{typeSlug}" class="bc-crumb">{typeLabel}</a>
			<span class="bc-sep">/</span>
			<a href="{base}/category/{categorySlug}" class="bc-crumb">{categoryLabel}</a>
			<span class="bc-sep">/</span>
			<span class="bc-current">{app.name}</span>
		</nav>

		<!--  App header: title + author + stats  -->
		<div class="store-header">
			<div class="store-header-left">
				<h1 class="app-title-detail">{app.name}</h1>
				<a href="{base}/dev/{app.author}" class="app-developer">{app.author}</a>
			</div>

			{#if hasStats}
				<div class="app-stats">
					{#if app.rating}
						<div class="stat-pill">
							<span class="stat-value">{app.rating}★</span>
							{#if app.ratingCount}
								<span class="stat-label">{app.ratingCount} ratings</span>
							{/if}
						</div>
						<div class="stat-sep"></div>
					{/if}
					{#if app.downloads}
						<div class="stat-pill">
							<span class="stat-value">{app.downloads}</span>
							<span class="stat-label">Downloads</span>
						</div>
						<div class="stat-sep"></div>
					{/if}
					<div class="stat-pill">
						<span class="stat-format">{app.format ?? '.hh3'}</span>
						<span class="stat-label">Format</span>
					</div>
				</div>
			{/if}
		</div>

		<!--  Main row: left (flex) + sticky sidebar  -->
		<div class="detail-layout">
			<!-- ══ LEFT ══ -->
			<div class="detail-main">
				<!-- Filmstrip -->
				<div class="filmstrip-wrapper">
					{#if slides.length > 1}
						<button
							class="film-arrow film-prev"
							class:visible={filmCanScrollLeft}
							onclick={() => scrollFilmstrip(-1)}
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
						class:fade-right={filmCanScrollRight}
						class:fade-left={filmCanScrollLeft}
						bind:this={filmstrip}
						onscroll={updateScrollState}
						role="list"
						aria-label="Screenshots"
					>
						{#each slides as src, i}
							<button
								class="film-slide"
								onclick={() => openLightbox(i)}
								aria-label="Open screenshot {i + 1} in full view"
							>
								<img
									class="film-img"
									src={getImageUrl(src)}
									alt="Screenshot {i + 1} of {app.name}"
									loading={i === 0 ? 'eager' : 'lazy'}
								/>
							</button>
						{/each}
					</div>

					{#if slides.length > 1}
						<button
							class="film-arrow film-next"
							class:visible={filmCanScrollRight}
							onclick={() => scrollFilmstrip(1)}
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

				<!-- Tags below filmstrip (clickable → /?tag=X) -->
				{#if app.tags?.length}
					<div class="tags-row">
						<span class="tags-label">Tags</span>
						<div class="tags-list">
							{#each app.tags as tag}
								<a href="{base}/?tag={tag}" class="app-tag app-tag-link">{tag}</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Long description -->
				{#if longDescriptionHtml}
					<section class="long-description">
						<h2 class="long-desc-title">About this app</h2>
						<div class="long-desc-body">
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html longDescriptionHtml}
						</div>
					</section>
				{/if}

				<!-- Related apps -->
				{#if related.length > 0}
					<section class="related-section">
						<h2 class="related-title">More apps like this</h2>
						<div class="rel-list">
							{#each related as rel}
								<RelCard app={rel} />
							{/each}
						</div>
					</section>
				{/if}
			</div>

			<!-- ══ STICKY SIDEBAR ══ -->
			<aside class="detail-sidebar">
				<div class="sidebar-card">
					{#if app.image}
						<div
							class="sidebar-cover"
							style="background-image:url('{getImageUrl(
								app.image
							)}');background-position:{app.position ?? 'center'}"
						></div>
					{/if}

					<p class="sidebar-description">{app.description}</p>
					<span class="detail-format">{app.format ?? '.hh3'}</span>

					{#if isPy}
						<div class="py-disclaimer">
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
								/>
								<line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
							</svg>
							<span
								>Requires <strong>PythonExtra</strong>. <a href="{base}/p/python">Get it →</a></span
							>
						</div>
					{/if}

					<div class="sidebar-actions">
						<a href={app.downloadUrl} class="btn btn-primary sidebar-download-btn">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="20"
								viewBox="0 -960 960 960"
								width="20"
								fill="currentColor"
							>
								<path
									d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"
								/>
							</svg>
							Download {app.format ?? '.hh3'}
						</a>
						{#if app.detailsUrl}
							<a href={app.detailsUrl} class="btn btn-secondary" target="_blank" rel="noopener">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
									/>
								</svg>
								Source / Details
							</a>
						{/if}
					</div>
				</div>

				{#if hasSupport}
					<div class="support-card">
						<h2 class="support-title">
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
								<line x1="12" y1="17" x2="12.01" y2="17" />
							</svg>
							App support
						</h2>
						<ul class="support-list">
							{#if app.website}
								<li class="support-item">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
										<path
											d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
										/>
									</svg>
									<a href={app.website} target="_blank" rel="noopener" class="support-link"
										>Website</a
									>
								</li>
							{/if}
							{#if app.contact}
								<li class="support-item">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
										/>
										<polyline points="22,6 12,13 2,6" />
									</svg>
									<div>
										<span class="support-sublabel">Support email</span>
										<a href="mailto:{app.contact}" class="support-email">{app.contact}</a>
									</div>
								</li>
							{/if}
							{#if app.privacy}
								<li class="support-item">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
									</svg>
									<a href={app.privacy} target="_blank" rel="noopener" class="support-link"
										>Privacy Policy</a
									>
								</li>
							{/if}
						</ul>
					</div>
				{/if}
			</aside>
		</div>
	</div>
</div>

<!--  Lightbox  -->
{#if lightboxOpen && lightboxIndex !== null}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="lightbox-overlay"
		onclick={closeLightbox}
		ontouchstart={lbTouchStart}
		ontouchend={lbTouchEnd}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="Screenshot viewer"
	>
		<!-- Stop propagation so clicking the image itself doesn't close -->
		<div class="lightbox-inner" role="presentation" onclick={(e) => e.stopPropagation()}>
			<img
				class="lightbox-img"
				src={getImageUrl(slides[lightboxIndex])}
				alt="Screenshot {lightboxIndex + 1} of {app.name}"
			/>

			{#if slides.length > 1}
				<button class="lb-arrow lb-prev" onclick={lightboxPrev} aria-label="Previous">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"><polyline points="15 18 9 12 15 6" /></svg
					>
				</button>
				<button class="lb-arrow lb-next" onclick={lightboxNext} aria-label="Next">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg
					>
				</button>
				<div class="lb-counter">{lightboxIndex + 1} / {slides.length}</div>
			{/if}
		</div>

		<button class="lb-close" onclick={closeLightbox} aria-label="Close">
			<svg
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
			>
		</button>
	</div>
{/if}

<style>
	/*  Page  */
	.app-detail-page {
		padding: 0 0 5rem;
	}

	/*  Store header (renamed from .app-header to avoid common.css conflict)  */
	.store-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 0.5rem 0 1.25rem;
		flex-wrap: wrap;
	}
	.store-header-left {
		flex: 1 1 auto;
		min-width: 0;
	}
	.app-title-detail {
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 700;
		margin: 0 0 0.2rem;
		line-height: 1.1;
		color: var(--cp-white);
	}
	.app-developer {
		display: inline-block;
		font-size: 0.92rem;
		color: var(--cp-accent);
		margin: 0;
		font-weight: 500;
		text-decoration: none;
		transition:
			opacity 0.15s,
			text-decoration 0.15s;
	}
	.app-developer:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	/* Stats */
	.app-stats {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}
	.stat-pill {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.3rem 1rem;
		text-align: center;
	}
	.stat-sep {
		width: 1px;
		height: 2rem;
		background: rgba(255, 255, 255, 0.12);
	}
	.stat-value {
		font-size: 1rem;
		font-weight: 700;
		color: var(--cp-white);
		line-height: 1.2;
	}
	.stat-format {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--cp-accent);
		font-family: monospace;
		line-height: 1.2;
	}
	.stat-label {
		font-size: 0.72rem;
		color: var(--cp-text);
		margin-top: 0.1rem;
	}

	/*  Main flex row  */
	.detail-layout {
		display: flex;
		align-items: flex-start;
	}
	.detail-main {
		flex: 1 1 0;
		min-width: 0;
	}

	/* ══ FILMSTRIP ══ */
	.filmstrip-wrapper {
		position: relative;
	}

	.filmstrip {
		display: flex;
		gap: 0.6rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		/* No fade by default — added via classes when scrollable */
	}
	.filmstrip::-webkit-scrollbar {
		display: none;
	}

	/* Conditional fade — only applied when content is scrolled */
	.filmstrip.fade-left {
		-webkit-mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 100%);
		mask-image: linear-gradient(to right, transparent 0, #000 6%, #000 100%);
	}
	.filmstrip.fade-right {
		-webkit-mask-image: linear-gradient(to right, #000 0%, #000 94%, transparent 100%);
		mask-image: linear-gradient(to right, #000 0%, #000 94%, transparent 100%);
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
		border-radius: 0.75rem;
		overflow: hidden;
		background: #080808;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		cursor: zoom-in;
		transition:
			transform 0.18s,
			box-shadow 0.18s;
	}
	.film-slide:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
	}

	.film-img {
		display: block;
		height: clamp(200px, 40vw, 300px);
		width: auto;
		max-width: min(100%, 260px);
		object-fit: contain;
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
		pointer-events: none;
		transition:
			opacity 0.2s,
			background 0.18s;
	}
	.film-arrow.visible {
		opacity: 1;
		pointer-events: auto;
	}
	.film-arrow:hover {
		background: rgba(0, 220, 104, 0.8);
		color: #000;
		border-color: transparent;
	}
	.film-prev {
		left: -0.25rem;
	}
	.film-next {
		right: -0.25rem;
	}

	/* Tags row */
	.tags-row {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		flex-wrap: wrap;
		margin-top: 1.1rem;
	}
	.tags-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-weight: 600;
		color: var(--cp-text);
		flex-shrink: 0;
	}
	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.app-tag-link {
		text-decoration: none;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.app-tag-link:hover {
		background: var(--cp-accent);
		color: var(--cp-text-black);
	}

	/* Long description */
	.long-description {
		margin-top: 2rem;
		padding-top: 1.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.07);
	}
	.long-desc-title {
		font-size: 1.15rem;
		font-weight: 600;
		margin: 0 0 1rem;
		color: var(--cp-white);
	}
	.long-desc-body {
		color: var(--cp-text);
		font-size: 0.93rem;
		line-height: 1.8;
		max-width: 68ch;
	}
	.long-desc-body :global(h2),
	.long-desc-body :global(h3) {
		color: var(--cp-white);
		margin: 1.5em 0 0.5em;
		font-weight: 600;
	}
	.long-desc-body :global(h2) {
		font-size: 1.05rem;
	}
	.long-desc-body :global(h3) {
		font-size: 0.95rem;
	}
	.long-desc-body :global(p) {
		margin: 0 0 0.8em;
	}
	.long-desc-body :global(ul),
	.long-desc-body :global(ol) {
		padding-left: 1.5rem;
		margin: 0 0 0.8em;
	}
	.long-desc-body :global(li) {
		margin: 0.3em 0;
	}
	.long-desc-body :global(code) {
		font-family: monospace;
		font-size: 0.86em;
		background: rgba(255, 255, 255, 0.08);
		padding: 0.1em 0.4em;
		border-radius: 3px;
		color: var(--cp-accent);
	}
	.long-desc-body :global(pre) {
		background: rgba(0, 0, 0, 0.45);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		margin: 0 0 0.8em;
	}
	.long-desc-body :global(pre code) {
		background: none;
		padding: 0;
		color: var(--cp-white);
	}
	.long-desc-body :global(a) {
		color: var(--cp-accent);
	}
	.long-desc-body :global(blockquote) {
		border-left: 3px solid var(--cp-accent);
		margin: 0 0 0.8em;
		padding: 0.4em 1em;
		color: #999;
	}
	.long-desc-body :global(strong) {
		color: var(--cp-white);
		font-weight: 600;
	}
	.long-desc-body :global(hr) {
		border: none;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		margin: 1.5em 0;
	}

	/*  Related apps  */
	.related-section {
		margin-top: 2.5rem;
		padding-top: 1.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.07);
	}
	.related-title {
		font-size: 1.15rem;
		font-weight: 600;
		margin: 0 0 1.1rem;
		color: var(--cp-white);
	}

	/* ═══════════════════════════════════════════════════
	   STICKY SIDEBAR
	═══════════════════════════════════════════════════ */
	.detail-sidebar {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		width: 100%;
		margin-top: 1.5rem;
		position: sticky;
		top: 1.25rem;
		align-self: flex-start;
	}
	@media (min-width: 768px) {
		.detail-sidebar {
			width: 256px;
			margin-top: 0;
			margin-left: 32px;
		}
	}
	@media (min-width: 1024px) {
		.detail-sidebar {
			width: 260px;
			margin-left: 20px;
		}
	}
	@media (min-width: 1280px) {
		.detail-sidebar {
			width: 320px;
			margin-left: 64px;
		}
	}

	.sidebar-card,
	.support-card {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 0.875rem;
		padding: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.sidebar-cover {
		width: 100%;
		aspect-ratio: 3 / 2;
		border-radius: 0.45rem;
		background-size: cover;
		background-position: center;
		background-color: #1e2124;
	}
	.sidebar-description {
		color: var(--cp-text);
		font-size: 0.87rem;
		line-height: 1.6;
		margin: 0;
	}
	.detail-format {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		background: rgba(0, 220, 104, 0.1);
		color: var(--cp-accent);
		border: 1px solid rgba(0, 220, 104, 0.25);
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.76rem;
		align-self: flex-start;
	}
	.py-disclaimer {
		display: flex;
		align-items: flex-start;
		gap: 0.4rem;
		padding: 0.5rem 0.7rem;
		background: rgba(250, 180, 0, 0.09);
		border: 1px solid rgba(250, 180, 0, 0.28);
		border-radius: 7px;
		font-size: 0.81rem;
		color: #e3bc3a;
		line-height: 1.45;
	}
	.py-disclaimer svg {
		flex-shrink: 0;
		margin-top: 0.1rem;
	}
	.py-disclaimer a {
		color: #e3bc3a;
		font-weight: 700;
	}
	.sidebar-actions {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.sidebar-download-btn {
		font-size: 0.95rem;
		padding: 0.75rem 1rem;
		justify-content: center;
		width: 100%;
	}

	.support-title {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.92rem;
		font-weight: 600;
		margin: 0;
		color: var(--cp-white);
	}
	.support-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.support-item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.86rem;
		color: var(--cp-text);
	}
	.support-item svg {
		flex-shrink: 0;
		margin-top: 0.1rem;
		opacity: 0.6;
	}
	.support-link {
		color: var(--cp-white);
		text-decoration: none;
		font-size: 0.86rem;
		transition: color 0.2s;
	}
	.support-link:hover {
		color: var(--cp-accent);
	}
	.support-sublabel {
		display: block;
		font-size: 0.77rem;
		color: var(--cp-text);
	}
	.support-email {
		color: var(--cp-text);
		font-size: 0.77rem;
		text-decoration: none;
	}
	.support-email:hover {
		color: var(--cp-accent);
	}

	/* ══════════════════════════════════
	   LIGHTBOX
	══════════════════════════════════ */
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.92);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: lb-fade 0.2s ease;
	}
	@keyframes lb-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lightbox-inner {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 92vw;
		max-height: 92vh;
	}

	.lightbox-img {
		display: block;
		max-width: 92vw;
		max-height: 92vh;
		object-fit: contain;
		border-radius: 0.75rem;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
		animation: lb-zoom 0.2s ease;
	}
	@keyframes lb-zoom {
		from {
			transform: scale(0.94);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.lb-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #fff;
		transition: background 0.18s;
		z-index: 2;
	}
	.lb-arrow:hover {
		background: var(--cp-accent);
		color: #000;
	}
	.lb-prev {
		left: -3.5rem;
	}
	.lb-next {
		right: -3.5rem;
	}

	.lb-counter {
		position: absolute;
		bottom: -2rem;
		left: 50%;
		transform: translateX(-50%);
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.8rem;
	}

	.lb-close {
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 50%;
		width: 42px;
		height: 42px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #fff;
		transition: background 0.18s;
		z-index: 1001;
	}
	.lb-close:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
