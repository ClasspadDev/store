<script>
	import { downloadApp } from '$lib/downloadStore.js';
	import { getImageUrl } from '$lib/utils.js';
	import { fade, scale } from 'svelte/transition';

	function close() {
		$downloadApp = null;
	}
	let ts = $state(Date.now());
	let hasVoted = $state(false);
	let ratingMode = $state('idle');
	let activeStar = $state(0);

	let slideIndex = $state(0);
	/** @type {ReturnType<typeof setInterval> | null} */
	let slideInterval = null;

	function resetInterval() {
		if (slideInterval) clearInterval(slideInterval);
		slideInterval = setInterval(() => {
			slideIndex = (slideIndex + 1) % steps.length;
		}, 3000);
	}

	/** @param {number} i */
	function setSlide(i) {
		if (slideIndex !== i) {
			slideIndex = i;
			resetInterval();
		}
	}

	$effect(() => {
		if ($downloadApp) {
			ts = Date.now();
			const lastVote = localStorage.getItem(`voted_${$downloadApp.slug}`);
			if (lastVote) {
				const days = (Date.now() - parseInt(lastVote, 10)) / (1000 * 60 * 60 * 24);
				hasVoted = days < 7;
			} else {
				hasVoted = false;
			}
			ratingMode = 'idle';
			activeStar = 0;

			slideIndex = 0;
			resetInterval();
			return () => {
				if (slideInterval) clearInterval(slideInterval);
			};
		}
	});

	/**
	 * @param {number} rating
	 */
	function rateApp(rating) {
		if (!$downloadApp || ratingMode !== 'idle') return;
		ratingMode = 'voting';
		fetch(`https://stats.classpad.dev/rate/${$downloadApp.slug}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ rating })
		})
			.then(() => {
				ratingMode = 'done';
				localStorage.setItem(`voted_${$downloadApp.slug}`, Date.now().toString());
				setTimeout(() => {
					hasVoted = true;
				}, 1500);
			})
			.catch((e) => {
				ratingMode = 'idle';
				console.error(e);
			});
	}

	const fileName = $derived(
		$downloadApp?.downloadUrl ? $downloadApp.downloadUrl.split('/').pop() : ''
	);
	const isZip = $derived(fileName.endsWith('.zip'));
	const isPy = $derived(
		$downloadApp?.format?.endsWith('.py') ||
			$downloadApp?.type === 'python' ||
			fileName.endsWith('.py')
	);

	const steps = $derived.by(() => {
		if (!$downloadApp) return [];
		const s = [];
		const copyText = isZip
			? `Extract <strong>${fileName}</strong> and copy its contents to your calculator's storage`
			: `Copy <strong>${fileName || $downloadApp?.format || (isPy ? '.py' : '.hh3')}</strong> to your calculator's storage`;

		s.push({
			text: `1. Connect via USB. ${copyText}. Go to Main menu and select "System".`,
			img: getImageUrl('images/_guide/step1_system.png')
		});
		s.push({
			text: `2. Open top-left "System" menu, then run "Hollyhock Launcher".`,
			img: getImageUrl('images/_guide/step2_launcher.png')
		});

		if (isPy) {
			s.push({
				text: `3. Pick PythonExtra from the list and click "Run".`,
				img: getImageUrl('images/_guide/step3_pe.png')
			});
			s.push({
				text: `4. In PythonExtra, pick your app from the list.`,
				img: getImageUrl('images/_guide/step4_pe.png')
			});
			s.push({
				text: `5. Enjoy!`,
				img: $downloadApp?.image ? getImageUrl($downloadApp.image) : ''
			});
		} else {
			s.push({
				text: `3. Pick the app from the list and click "Run".`,
				img: getImageUrl('images/_guide/step3_yal.png')
			});
			s.push({
				text: `4. Enjoy!`,
				img: $downloadApp?.image ? getImageUrl($downloadApp.image) : ''
			});
		}

		return s;
	});
</script>

{#if $downloadApp}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="popup-overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		transition:fade={{ duration: 150 }}
		onclick={close}
		onkeydown={null}
	>
		<div
			class="popup-modal"
			role="presentation"
			transition:scale={{ duration: 250, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={null}
		>
			<img
				src="https://stats.classpad.dev/pixel/download/{$downloadApp?.slug}?t={ts}"
				width="24"
				height="24"
				alt=""
				style="position: absolute; opacity: 0.1; pointer-events: none;"
			/>

			<div class="popup-content-split">
				<div class="popup-left">
					<h2>Downloading {$downloadApp?.name}...</h2>
					<div class="popup-instructions">
						<p>Your download should begin shortly.</p>
						<p><strong>To install:</strong></p>

						{#if isPy}
							<div class="python-banner">
								<em
									>Note: You must have <a
										href="https://classpaddev.github.io/python/#download"
										target="_blank"
										rel="noopener noreferrer">PythonExtra installed</a
									> to run this app.</em
								>
							</div>
						{/if}

						<ul class="steps-list">
							{#each steps as step, i}
								<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
								<li
									class:active-step={i === slideIndex}
									onmouseenter={() => setSlide(i)}
									onclick={() => setSlide(i)}
									role="button"
									tabindex="0"
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											setSlide(i);
										}
									}}
								>
									{@html step.text}
								</li>
							{/each}
						</ul>
					</div>
					<button
						class="btn btn-primary"
						onclick={close}
						style="width: 100%; justify-content: center; padding: 0.8rem; font-size: 1rem;"
					>
						Got it!
					</button>
				</div>
				<div class="popup-right">
					<!-- <h3 class="app-title-big">{$downloadApp?.name}</h3> -->
					<div
						class="popup-icon"
						style={steps[slideIndex]?.img ? `background-image:url('${steps[slideIndex].img}')` : ''}
					>
						{#if !steps[slideIndex]?.img && !$downloadApp?.image}
							<span class="placeholder">{$downloadApp?.name[0]}</span>
						{/if}
					</div>

					{#if !hasVoted}
						<div class="rating-box">
							<p>Rate this app</p>
							<div
								class="stars"
								onmouseleave={() => {
									if (ratingMode === 'idle') activeStar = 0;
								}}
								role="group"
								aria-label="Rate"
							>
								{#each [1, 2, 3, 4, 5] as star}
									<button
										class="star-btn"
										class:active={star <= activeStar}
										onmouseenter={() => {
											if (ratingMode === 'idle') activeStar = star;
										}}
										onclick={() => rateApp(star)}
										disabled={ratingMode !== 'idle'}
										aria-label="Rate {star} stars"
									>
										{#if star <= activeStar}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												height="36"
												viewBox="0 -960 960 960"
												width="36"
												fill="currentColor"
												><path
													d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"
												/></svg
											>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												height="36"
												viewBox="0 -960 960 960"
												width="36"
												fill="currentColor"
												><path
													d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"
												/></svg
											>
										{/if}
									</button>
								{/each}
							</div>
							{#if ratingMode === 'done'}
								<div class="rating-thanks">Thanks for rating!</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.popup-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(3px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}
	.popup-modal {
		background: #1e2124;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 2rem;
		max-width: 800px;
		width: 100%;
		text-align: left;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
	}
	h2 {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		color: var(--cp-white);
	}
	.popup-content-split {
		display: flex;
		gap: 2.5rem;
		align-items: center;
	}
	.popup-left {
		flex: 1;
	}
	.popup-right {
		width: 280px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		border-left: 1px solid rgba(255, 255, 255, 0.1);
		padding-left: 2.5rem;
	}
	.rating-box {
		width: 100%;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.5rem;
		padding: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.rating-box p {
		margin: 0 0 1rem;
		font-size: 1.1rem;
		color: var(--cp-text);
		font-weight: 600;
	}
	.stars {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}
	.star-btn {
		background: none;
		border: none;
		padding: 0;
		color: rgba(255, 255, 255, 0.2);
		cursor: pointer;
		transition:
			color 0.15s,
			transform 0.15s;
	}
	.star-btn:hover {
		transform: scale(1.1);
	}
	.star-btn.active {
		color: #ffd166;
	}
	.star-btn[disabled] {
		cursor: default;
		pointer-events: none;
	}
	.rating-thanks {
		margin-top: 0.75rem;
		font-size: 0.85rem;
		color: #22c55e;
		font-weight: bold;
		animation: fadein 0.3s;
	}
	@keyframes fadein {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (max-width: 600px) {
		.popup-content-split {
			flex-direction: column-reverse;
		}
		.popup-right {
			width: 100%;
			border-left: none;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			padding-left: 0;
			padding-bottom: 1.5rem;
			margin-bottom: 1.5rem;
		}
	}
	.popup-icon {
		width: 200px;
		height: 330px;
		margin: 0 auto 1.5rem;
		border-radius: 0.25rem;
		background-size: cover;
		background-position: center;
		background-color: #2a2d30;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
	}
	.python-banner {
		background: rgba(255, 165, 0, 0.15);
		border-left: 3px solid #ffa500;
		padding: 0.75rem;
		margin-bottom: 1rem;
		border-radius: 0 0.5rem 0.5rem 0;
		font-size: 0.9rem;
		color: #ffd166;
	}

	.popup-instructions {
		color: var(--cp-text);
		font-size: 0.95rem;
		line-height: 1.6;
		margin-bottom: 2rem;
		text-align: left;
	}
	.popup-instructions p {
		margin: 0 0 0.5rem;
	}
	.steps-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.steps-list li {
		margin-bottom: 0.5rem;
		padding: 0.75rem 1rem 0.75rem 1rem;
		border-left: 3px solid transparent;
		opacity: 0.5;
		transition: all 0.3s;
		position: relative;
		cursor: pointer;
		outline: none;
	}
	.steps-list li::before {
		content: '';
		position: absolute;
		left: -3px;
		top: 0;
		width: 3px;
		height: 100%;
		background: transparent;
		transform-origin: top;
	}
	.steps-list li.active-step {
		opacity: 1;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0 0.5rem 0.5rem 0;
	}
	.steps-list li.active-step::before {
		background: var(--cp-accent);
		animation: progress-slide 3s linear forwards;
	}
	@keyframes progress-slide {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}
</style>
