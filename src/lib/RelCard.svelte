<script>
	import { base } from '$app/paths';
	import { getImageUrl } from '$lib/utils.js';

	/** @type {{ app: any }} */
	let { app } = $props();
</script>

<a href="{base}/p/{app.slug}" class="rel-card">
	<div
		class="rel-cover"
		style={app.image ? `background-image:url('${getImageUrl(app.image)}')` : ''}
		role="img"
		aria-label="{app.name} cover"
	>
		{#if !app.image}
			<div class="rel-cover-placeholder">{app.name[0]}</div>
		{/if}
	</div>
	<div class="rel-body">
		<span class="rel-tag">{app.tags?.[0] ?? (app.format || '.hh3')}</span>
		<span class="rel-name">{app.name}</span>
		<span class="rel-desc">{app.description}</span>
	</div>
</a>
