<script>
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import Header from '$lib/Header.svelte';
	import RelCard from '$lib/RelCard.svelte';

	const status = $derived($page.status);

	//  Snake game
	let canvas = $state(/** @type {HTMLCanvasElement|null} */ (null));
	let animId = 0;

	const CELL = 8;
	let COLS = 40,
		ROWS = 66;

	let snake = /** @type {{x:number,y:number}[]} */ ([]);
	let dir = { x: 1, y: 0 };
	let food = { x: 20, y: 20 };
	let score = 0;
	let dead = false;
	let restartPending = false; // prevent multiple setTimeout calls while dead
	let lastTime = 0;
	const SPEED_MS = 90; // ms per step

	function randFood() {
		let f;
		do {
			f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
		} while (snake.some((s) => s.x === f.x && s.y === f.y));
		return f;
	}

	function initGame() {
		if (!canvas) return;
		COLS = Math.floor(canvas.width / CELL);
		ROWS = Math.floor(canvas.height / CELL);
		const cx = Math.floor(COLS / 2),
			cy = Math.floor(ROWS / 2);
		snake = [
			{ x: cx, y: cy },
			{ x: cx - 1, y: cy },
			{ x: cx - 2, y: cy }
		];
		dir = { x: 1, y: 0 };
		food = randFood();
		score = 0;
		dead = false;
		restartPending = false;
	}

	/** Simple auto-pilot: aim for food, dodge walls + body */
	function autoMove() {
		const head = snake[0];
		const dx = food.x - head.x;
		const dy = food.y - head.y;

		const candidates = [];
		if (Math.abs(dx) >= Math.abs(dy)) {
			if (dx !== 0) candidates.push({ x: Math.sign(dx), y: 0 });
			if (dy !== 0) candidates.push({ x: 0, y: Math.sign(dy) });
		} else {
			if (dy !== 0) candidates.push({ x: 0, y: Math.sign(dy) });
			if (dx !== 0) candidates.push({ x: Math.sign(dx), y: 0 });
		}
		// fallbacks: keep going, turn left, turn right
		candidates.push({ x: dir.x, y: dir.y });
		candidates.push({ x: -dir.y, y: dir.x });
		candidates.push({ x: dir.y, y: -dir.x });
		candidates.push({ x: -dir.x, y: -dir.y }); // reverse (last resort)

		for (const c of candidates) {
			if (c.x === 0 && c.y === 0) continue;
			const nx = head.x + c.x,
				ny = head.y + c.y;
			if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
			if (snake.slice(0, -1).some((s) => s.x === nx && s.y === ny)) continue;
			dir = c;
			return;
		}
	}

	function step() {
		if (dead) {
			// Schedule exactly one restart
			if (!restartPending) {
				restartPending = true;
				setTimeout(() => initGame(), 1800);
			}
			return;
		}
		autoMove();
		const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
		if (
			head.x < 0 ||
			head.x >= COLS ||
			head.y < 0 ||
			head.y >= ROWS ||
			snake.some((s) => s.x === head.x && s.y === head.y)
		) {
			dead = true;
			return;
		}
		snake = [head, ...snake];
		if (head.x === food.x && head.y === food.y) {
			score++;
			food = randFood();
		} else snake.pop();
	}

	let tick = 0;
	function draw() {
		const ctx = canvas?.getContext('2d');
		if (!ctx || !canvas) return;
		const W = canvas.width,
			H = canvas.height;

		// Background — dark calculator screen
		ctx.fillStyle = '#080f06';
		ctx.fillRect(0, 0, W, H);

		// Subtle scanlines
		ctx.fillStyle = 'rgba(0,0,0,0.15)';
		for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1);

		// Food — pulsing dot
		const pulse = 0.7 + 0.3 * Math.sin(tick * 0.15);
		ctx.fillStyle = `rgba(255,${Math.floor(80 + 60 * pulse)},80,1)`;
		const fr = Math.max(2, CELL * 0.4 * pulse);
		ctx.beginPath();
		ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, fr, 0, Math.PI * 2);
		ctx.fill();

		// Snake
		for (let i = 0; i < snake.length; i++) {
			const t = 1 - (i / snake.length) * 0.55;
			ctx.fillStyle = `rgba(0,${Math.floor(210 * t + 20)},${Math.floor(68 * t + 10)},1)`;
			const s = snake[i];
			if (i === 0) {
				// head — slightly brighter square
				ctx.fillRect(s.x * CELL, s.y * CELL, CELL, CELL);
				// eyes
				ctx.fillStyle = '#000';
				const ex = dir.x,
					ey = dir.y;
				ctx.fillRect(
					s.x * CELL + CELL / 2 + ex * 2 + ey * 1,
					s.y * CELL + CELL / 2 + ey * 2 - ex * 1,
					2,
					2
				);
				ctx.fillRect(
					s.x * CELL + CELL / 2 + ex * 2 - ey * 1,
					s.y * CELL + CELL / 2 + ey * 2 + ex * 1,
					2,
					2
				);
			} else {
				ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
			}
		}

		// Score overlay
		ctx.fillStyle = 'rgba(0,220,104,0.55)';
		ctx.font = `bold ${CELL + 2}px "Courier New", monospace`;
		ctx.fillText(`♥ ${score}`, 4, CELL + 3);

		if (dead) {
			ctx.fillStyle = 'rgba(0,0,0,0.72)';
			ctx.fillRect(0, 0, W, H);
			ctx.fillStyle = '#00dc68';
			ctx.font = `bold ${CELL * 2}px "Courier New", monospace`;
			ctx.textAlign = 'center';
			ctx.fillText('GAME OVER', W / 2, H / 2 - CELL);
			ctx.font = `${CELL + 1}px monospace`;
			ctx.fillStyle = 'rgba(0,220,104,0.7)';
			ctx.fillText(`Score: ${score}`, W / 2, H / 2 + CELL * 1.5);
			ctx.fillText('Restarting…', W / 2, H / 2 + CELL * 3);
			ctx.textAlign = 'left';
		}

		tick++;
	}

	function gameLoop(ts = 0) {
		animId = requestAnimationFrame(gameLoop);
		if (ts - lastTime > SPEED_MS) {
			step();
			draw();
			lastTime = ts;
		}
	}

	onMount(() => {
		initGame();
		// Seed lastTime so the first step fires after one proper SPEED_MS interval,
		// not immediately on frame 0.
		lastTime = performance.now();
		animId = requestAnimationFrame(gameLoop);
	});

	onDestroy(() => {
		if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(animId);
	});

	const FEATURED = [
		{
			name: 'CP Doom',
			slug: 'cp-doom',
			image: `${base}/images/cover/CPDoom.png`,
			tags: ['FPS · Game'],
			description: 'Doom on your calculator'
		},
		{
			name: 'CPBoy',
			slug: 'cpboy',
			image: `${base}/images/cover/CPBoy.png`,
			tags: ['Emulator · Game'],
			description: 'Game Boy emulator'
		},
		{
			name: 'Python',
			slug: 'python',
			image: `${base}/images/cover/Python.png`,
			tags: ['Programming'],
			description: 'Run Python scripts'
		},
		{
			name: 'Tetris',
			slug: 'tetris',
			image: `${base}/images/cover/Tetris.png`,
			tags: ['Puzzle · Classic'],
			description: 'The classic block game'
		}
	];
</script>

<svelte:head>
	<title>{status} | ClassPad.Dev Store</title>
</svelte:head>

<Header variant="back" backLabel="Back to All" backHref="{base}/" />

<div class="error-page container">
	<div class="error-split">
		<!--  LEFT: ClassPad with Snake  -->
		<div class="device-col">
			<div class="device-wrapper">
				<img
					class="device-img"
					src="https://classpaddev.github.io/img/cp.svg"
					alt="ClassPad II device"
					draggable="false"
				/>
				<div class="screen-overlay">
					<canvas bind:this={canvas} width="232" height="382" class="snake-canvas"></canvas>
					<div class="screen-label">AUTO-SNAKE.BIN</div>
				</div>
			</div>
		</div>

		<!--  RIGHT: 404 content  -->
		<div class="content-col">
			<div class="error-number">{status}</div>
			<h1 class="error-title">
				{#if status === 404}
					Page not found
				{:else}
					Something went wrong
				{/if}
			</h1>
			<p class="error-sub">
				{#if status === 404}
					The page you're looking for doesn't exist — but your calculator does, and there's plenty
					to run on it.
				{:else}
					An unexpected error occurred. Try heading back to the store.
				{/if}
			</p>

			<a href="{base}/" class="btn btn-primary error-home-btn">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
					<polyline points="9 22 9 12 15 12 15 22" />
				</svg>
				Back to the store
			</a>

			{#if status === 404}
				<div class="featured-section">
					<p class="featured-label">Featured apps to try</p>
					<div class="rel-grid">
						{#each FEATURED as f}
							<RelCard app={f} />
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.error-page {
		padding: 2rem 1.5rem 6rem;
		min-height: 75vh;
		display: flex;
		align-items: center;
	}

	.error-split {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5rem;
		width: 100%;
		flex-wrap: wrap;
	}

	/*  Device column  */
	.device-col {
		flex-shrink: 0;
		display: flex;
		justify-content: center;
	}

	.device-wrapper {
		position: relative;
		width: 240px;
		/* natural height follows the SVG aspect ratio of the cp.svg (~390×830) */
	}

	.device-img {
		display: block;
		width: 100%;
		height: auto;
		/* Don't let SVG events steal pointer focus */
		pointer-events: none;
		user-select: none;
	}

	/* Position the canvas over the screen area of the cp.svg.
	   These values are tuned to the classpaddev cp.svg device graphic.
	   The screen occupies roughly: left≈9%, top≈10%, width≈82%, height≈47.5% */
	.screen-overlay {
		position: absolute;
		top: 7.5%;
		left: 13%;
		width: 74%;
		/* Keep 320:528 ≈ 0.6061 ratio */
		aspect-ratio: 232 / 382;
		border-radius: 2px;
		overflow: hidden;
		background: #000;
		/* Subtle screen glow */
		box-shadow:
			0 0 18px rgba(0, 220, 104, 0.35),
			inset 0 0 12px rgba(0, 0, 0, 0.6);
	}

	.snake-canvas {
		display: block;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
	}

	.screen-label {
		position: absolute;
		bottom: 3px;
		right: 5px;
		font-size: 7px;
		font-family: monospace;
		color: rgba(0, 220, 104, 0.35);
		letter-spacing: 0.5px;
		pointer-events: none;
	}

	/*  Content column  */
	.content-col {
		flex: 1 1 340px;
		max-width: 480px;
	}

	.error-number {
		font-size: clamp(5rem, 14vw, 9rem);
		font-weight: 900;
		line-height: 1;
		color: transparent;
		/* Green outline number */
		-webkit-text-stroke: 3px var(--cp-accent);
		letter-spacing: -4px;
		margin-bottom: 0.25rem;
		/* Subtle glow */
		filter: drop-shadow(0 0 16px rgba(0, 220, 104, 0.3));
	}

	.error-title {
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		color: var(--cp-white);
		margin: 0 0 0.75rem;
	}

	.error-sub {
		font-size: 1rem;
		color: var(--cp-text);
		line-height: 1.7;
		margin: 0 0 2rem;
		max-width: 40ch;
	}

	.error-home-btn {
		display: inline-flex;
		margin-bottom: 2.5rem;
	}

	/* Featured apps — 2×2 rel-card grid */
	.featured-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		font-weight: 600;
		color: var(--cp-text);
		margin: 0 0 0.75rem;
	}

	/* Responsive */
	@media (max-width: 680px) {
		.error-page {
			align-items: flex-start;
			padding-top: 1.5rem;
		}
		.error-split {
			gap: 2rem;
		}
		.device-wrapper {
			width: 180px;
		}
		.error-number {
			font-size: 5rem;
		}
	}
	@media (max-width: 480px) {
		.device-col {
			display: none;
		}
	}
</style>
