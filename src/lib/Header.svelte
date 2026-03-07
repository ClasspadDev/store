<script>
	import { base } from '$app/paths';

	/**
	 * variant:
	 *   'home'  → right side shows "Submit your app" CTA
	 *   'back'  → right side shows a back link
	 *   'none'  → no right-side element (default)
	 */
	let { variant = 'none', backHref = `${base}/`, backLabel = 'Back' } = $props();
</script>

<header>
	<div class="container">
		<div class="header-content">
			<a href="https://classpaddev.github.io/" class="logo">ClassPad<span>.Dev</span></a>

			{#if variant === 'back'}
				<a href={backHref} class="back-button">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="19" y1="12" x2="5" y2="12" />
						<polyline points="12 19 5 12 12 5" />
					</svg>
					{backLabel}
				</a>
			{:else if variant === 'home'}
				<a href="{base}/submit" class="btn btn-primary btn-submit">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					Submit your app
				</a>
			{/if}
		</div>
	</div>
</header>

<style>
	.btn-submit {
		padding: 0.5rem 1.1rem;
		font-size: 0.88rem;
		border-radius: 0.4rem;
		gap: 0.4rem;
	}
</style>
