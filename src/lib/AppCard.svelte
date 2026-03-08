<script>
	import { base } from '$app/paths';
	import { getImageUrl } from '$lib/utils.js';

	/** @type {{ app: any }} */
	let { app } = $props();
</script>

<div class="app-card" class:python-card={app.format === '.py'}>
	<div class="app-header">
		<div class="app-header-text">
			<div class="app-title">{app.name}</div>
			<div class="app-author">by {app.author}</div>
		</div>
		{#if app.format === '.py'}
			<div class="app-format-icon" title="Python App">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
					><g fill="none"
						><g fill="currentColor" clip-path="url(#SVGXv8lpc2Y)"
							><path
								d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969s3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.202S18.28 0 11.913 0M8.708 1.85c.578 0 1.046.47 1.046 1.052c0 .581-.468 1.051-1.046 1.051s-1.046-.47-1.046-1.051c0-.582.467-1.052 1.046-1.052"
							/><path
								d="M12.087 24c6.092 0 5.712-2.656 5.712-2.656l-.007-2.752h-5.814v-.826h8.123s3.9.445 3.9-5.735s-3.404-5.96-3.404-5.96h-2.03v2.867s.109 3.42-3.35 3.42H9.452s-3.24-.052-3.24 3.148v5.292S5.72 24 12.087 24m3.206-1.85c-.579 0-1.046-.47-1.046-1.052c0-.581.467-1.051 1.046-1.051c.578 0 1.046.47 1.046 1.051c0 .582-.468 1.052-1.046 1.052"
							/></g
						><defs
							><clipPath id="SVGXv8lpc2Y"><path fill="#fff" d="M0 0h24v24H0z" /></clipPath></defs
						></g
					></svg
				>
			</div>
		{/if}
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
