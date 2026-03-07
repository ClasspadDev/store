<script>
	import { base } from '$app/paths';
	import { getImageUrl } from '$lib/utils.js';

	/** @type {{ app: any }} */
	let { app } = $props();
</script>

<div class="app-card">
	<div class="app-header">
		<div>
			<div class="app-title">{app.name}</div>
			<div class="app-author">by {app.author}</div>
		</div>
	</div>
	<div class="app-body">
		<div
			class="app-image"
			style="background-image:url('{getImageUrl(app.image)}');{app.position
				? `background-position:${app.position}`
				: ''}"
			role="img"
			aria-label="{app.name} cover"
		>
			{#if !app.image}
				<div class="cover-placeholder">{app.name[0]}</div>
			{/if}
		</div>
		<div class="app-details">
			<div class="app-tags">
				{#each app.tags ?? [] as tag}
					<a href="{base}/?tag={tag}" class="app-tag app-tag-link">{tag}</a>
				{/each}
			</div>
			<p class="app-description">{app.description}</p>
			<div class="app-actions">
				<a href={app.downloadUrl} class="btn btn-primary app-btn">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height="18"
						viewBox="0 -960 960 960"
						width="18"
						fill="currentColor"
					>
						<path
							d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"
						/>
					</svg>
					Download
				</a>
				{#if app.slug}
					<a href="{base}/p/{app.slug}" class="btn btn-secondary app-btn">Details</a>
				{:else if app.detailsUrl}
					<a href={app.detailsUrl} class="btn btn-secondary app-btn" target="_blank" rel="noopener"
						>Details</a
					>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* Make tags on the home grid clickable */
	.app-tag-link {
		text-decoration: none;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.app-tag-link:hover {
		background: var(--cp-accent);
		color: #080808;
	}
</style>
