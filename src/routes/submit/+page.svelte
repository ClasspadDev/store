<script>
	import { base } from '$app/paths';
	import Header from '$lib/Header.svelte';
</script>

<svelte:head>
	<title>Submit Your App | ClassPad.Dev Store</title>
	<meta
		name="description"
		content="Submit your Hollyhock app to the ClassPad.Dev store by opening a pull request on GitHub."
	/>
</svelte:head>

<Header variant="back" backLabel="Back to All" backHref="{base}/" />

<div class="container submit-page">
	<div class="submit-hero">
		<div class="submit-hero-icon">
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path
					d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
				/>
			</svg>
		</div>
		<h1 class="submit-title">Submit Your App</h1>
		<p class="submit-subtitle">
			Apps are published via GitHub pull request. It's free, version-controlled, and takes about 5
			minutes.
		</p>
		<a
			href="https://github.com/classpadDev/store/pulls"
			target="_blank"
			rel="noopener"
			class="btn btn-primary submit-cta"
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path
					d="M13 6h3a2 2 0 0 1 2 2v7"
				/>
				<line x1="6" y1="9" x2="6" y2="21" />
			</svg>
			Open a Pull Request
		</a>
	</div>

	<!-- Steps -->
	<section class="submit-section">
		<h2 class="submit-section-title">How to submit</h2>
		<ol class="submit-steps">
			<li class="submit-step">
				<div class="step-num">1</div>
				<div class="step-body">
					<h3>Fork the repository</h3>
					<p>
						Fork <a href="https://github.com/classpadDev/store" target="_blank" rel="noopener"
							>classpadDev/store</a
						> on GitHub.
					</p>
				</div>
			</li>
			<li class="submit-step">
				<div class="step-num">2</div>
				<div class="step-body">
					<h3>Add your app YAML</h3>
					<p>
						Create a file in the <code>apps/</code> folder named <code>your-app-slug.yml</code>. See
						the template below.
					</p>
				</div>
			</li>
			<li class="submit-step">
				<div class="step-num">3</div>
				<div class="step-body">
					<h3>Add your cover image</h3>
					<p>
						Place a cover image in <code>static/images/cover/YourApp.png</code> and screenshots in
						<code>static/images/your-slug/</code>.
					</p>
				</div>
			</li>
			<li class="submit-step">
				<div class="step-num">4</div>
				<div class="step-body">
					<h3>Open a Pull Request</h3>
					<p>
						Submit your PR against the <code>main</code> branch. A maintainer will review it — usually
						within a few days.
					</p>
				</div>
			</li>
		</ol>
	</section>

	<!-- YAML template -->
	<section class="submit-section">
		<h2 class="submit-section-title">App YAML template</h2>
		<p class="submit-section-desc">
			Copy the snippet below and fill in your details. Required fields are marked <span class="req"
				>*</span
			>.
		</p>

		<div class="yaml-block">
			<button
				class="copy-btn"
				onclick={() => {
					const code = document.querySelector('.yaml-content')?.textContent ?? '';
					navigator.clipboard.writeText(code);
				}}
				aria-label="Copy YAML template"
			>
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" /><path
						d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
					/>
				</svg>
				Copy
			</button>
			<pre
				class="yaml-content">id:          42               # next available integer — check existing files
slug:        my-awesome-app   # *  URL-safe, lowercase, hyphens only
name:        My Awesome App   # *  Display name shown in the store
author:      YourUsername     # *  Your username or real name
description: One-line summary of what your app does.  # *  ≤ 160 chars

# Download — at least one of these is required
downloadUrl: https://github.com/YourRepo/releases/download/v1.0/app.hh3  # *
detailsUrl:  https://github.com/YourRepo                                   # optional

format:  .hh3   # *  one of: .hh3 | .hh2 | .py

# Cover image path (relative to /store/ base)
image:    /store/images/cover/MyAwesomeApp.png   # *  see image guidelines below
position: center   # optional — CSS background-position, e.g. "top center"

# Screenshots (optional — portrait images preferred)
screenshots:
  - /store/images/my-awesome-app/screen1.png
  - /store/images/my-awesome-app/screen2.png

# Tags — pick one or more that apply
tags:          # *  at least one tag required
  - Game       # or: Action | Puzzle | Classic | Strategy | RPG | Arcade
  - Utility    # or: Programming | Education | Math | AI | Graphics | Emulator

# Statistics (optional — leave out if not known)
rating:      4.2    # float 0–5
ratingCount: "18"   # displayed as-is, e.g. "18" or "1.2k"
downloads:   "500+" # displayed as-is

# Developer support links (all optional)
website: https://yoursite.com
contact: yourname@example.com
privacy: https://yoursite.com/privacy

# Long description — Markdown supported, will render on the detail page
longDescription: |
  A longer description of your app.

  ## Features
  - Feature one
  - Feature two

  ## Controls
  | Key | Action |
  |-----|--------|
  | [EXE] | Do thing |
</pre>
		</div>
	</section>

	<!-- Image guidelines -->
	<section class="submit-section">
		<h2 class="submit-section-title">Image guidelines</h2>

		<div class="image-guide-grid">
			<div class="image-guide-card">
				<div class="image-guide-icon">🖼️</div>
				<h3>Cover image</h3>
				<div class="image-guide-specs">
					<div class="spec-row">
						<span class="spec-label">File</span>
						<code>static/images/cover/YourApp.png</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Format</span>
						<code>PNG</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Recommended size</span>
						<code>320 × 528 px</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Aspect ratio</span>
						<code>~0.606 (portrait)</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Max file size</span>
						<code>250 KB</code>
					</div>
				</div>
				<div class="image-guide-note">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
							x1="12"
							y1="16"
							x2="12.01"
							y2="16"
						/>
					</svg>
					<span
						>The cover must be <strong>an original creation or a live screenshot</strong> from the running
						app on the ClassPad. Do not use unofficial artwork, copyrighted material, or AI-generated
						images.</span
					>
				</div>
			</div>

			<div class="image-guide-card">
				<div class="image-guide-icon">📸</div>
				<h3>Screenshots</h3>
				<div class="image-guide-specs">
					<div class="spec-row">
						<span class="spec-label">Folder</span>
						<code>static/images/your-slug/</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Format</span>
						<code>PNG or JPG</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Preferred size</span>
						<code>320 × 528 px (portrait)</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Landscape OK?</span>
						<code>Yes — the carousel adapts</code>
					</div>
					<div class="spec-row">
						<span class="spec-label">Max per app</span>
						<code>8 screenshots</code>
					</div>
				</div>
				<div class="image-guide-note">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
							x1="12"
							y1="16"
							x2="12.01"
							y2="16"
						/>
					</svg>
					<span
						>Screenshots should show the <strong>actual running application</strong>. Scale-up from
						the 320×528 native resolution is fine; composited UI mockups are not.</span
					>
				</div>
			</div>
		</div>
	</section>

	<!-- Review criteria -->
	<section class="submit-section">
		<h2 class="submit-section-title">Review criteria</h2>
		<ul class="review-list">
			<li>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--cp-accent)"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				The app must run on a CASIO ClassPad II (fx-CP400) under Hollyhock-2, Hollyhock-3, or as a PythonExtra
				script.
			</li>
			<li>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--cp-accent)"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				Source code or a release binary must be publicly accessible (GitHub, Gitea, etc.).
			</li>
			<li>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--cp-accent)"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				All images must be original captures from the running app. No copyrighted assets.
			</li>
			<li>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--cp-accent)"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				The YAML file must pass schema validation (the CI pipeline checks this automatically).
			</li>
			<li>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--cp-accent)"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				Apps must not contain malicious code or violate any applicable laws.
			</li>
		</ul>
	</section>

	<!-- Admin link -->
	<section class="admin-box">
		<div class="admin-box-inner">
			<div class="admin-box-icon">🔐</div>
			<div>
				<h3>Site admin</h3>
				<p>
					Are you a store maintainer? Use the CMS to edit existing app entries directly in the
					browser<br />
					No need to clone the repo.
				</p>
			</div>
			<a href="{base}/admin/" class="btn btn-secondary admin-link">Open Admin CMS</a>
		</div>
	</section>
</div>

<style>
	.submit-page {
		padding-bottom: 5rem;
	}

	/* Hero */
	.submit-hero {
		text-align: center;
		padding: 3.5rem 0 3rem;
		max-width: 640px;
		margin: 0 auto;
	}
	.submit-hero-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		background: rgba(0, 220, 104, 0.1);
		border: 1px solid rgba(0, 220, 104, 0.25);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--cp-accent);
	}
	.submit-title {
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		color: var(--cp-white);
		margin: 0 0 1rem;
	}
	.submit-subtitle {
		font-size: 1.05rem;
		color: var(--cp-text);
		line-height: 1.7;
		margin: 0 0 2rem;
	}
	.submit-cta {
		font-size: 1rem;
		padding: 0.8rem 1.8rem;
	}

	/* Sections */
	.submit-section {
		margin-top: 3.5rem;
		padding-top: 2.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.07);
		max-width: 820px;
	}
	.submit-section-title {
		font-size: 1.4rem;
		color: var(--cp-white);
		margin: 0 0 0.6rem;
	}
	.submit-section-desc {
		color: var(--cp-text);
		font-size: 0.9rem;
		margin-bottom: 1.2rem;
	}
	.req {
		color: var(--cp-accent);
		font-weight: 700;
	}

	/* Steps */
	.submit-steps {
		list-style: none;
		margin: 1.5rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.submit-step {
		display: flex;
		align-items: flex-start;
		gap: 1.1rem;
	}
	.step-num {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--cp-accent);
		color: var(--cp-text-black);
		font-weight: 700;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.step-body h3 {
		font-size: 1.05rem;
		color: var(--cp-white);
		margin: 0 0 0.3rem;
	}
	.step-body p {
		color: var(--cp-text);
		font-size: 0.9rem;
		margin: 0;
		line-height: 1.6;
	}
	.step-body a {
		color: var(--cp-accent);
	}
	.step-body code {
		background: rgba(255, 255, 255, 0.08);
		padding: 0.1em 0.4em;
		border-radius: 4px;
		font-size: 0.85em;
		color: var(--cp-accent);
	}

	/* YAML block */
	.yaml-block {
		position: relative;
		background: rgba(0, 0, 0, 0.45);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		overflow: hidden;
	}
	.yaml-content {
		display: block;
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.8rem;
		line-height: 1.65;
		color: #cdd6f4;
		padding: 1.5rem 1.5rem 1.5rem;
		overflow-x: auto;
		white-space: pre;
		margin: 0;
	}
	.copy-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: var(--cp-text);
		border-radius: 6px;
		padding: 0.35rem 0.65rem;
		font-size: 0.78rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.copy-btn:hover {
		background: rgba(0, 220, 104, 0.15);
		color: var(--cp-accent);
	}

	/* Image guidelines */
	.image-guide-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
		margin-top: 1.2rem;
	}
	.image-guide-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 0.875rem;
		padding: 1.4rem;
	}
	.image-guide-icon {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}
	.image-guide-card h3 {
		font-size: 1.05rem;
		color: var(--cp-white);
		margin: 0 0 0.8rem;
	}
	.image-guide-specs {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 1rem;
	}
	.spec-row {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.85rem;
	}
	.spec-label {
		color: var(--cp-text);
		flex-shrink: 0;
		min-width: 120px;
	}
	.spec-row code {
		background: rgba(255, 255, 255, 0.06);
		padding: 0.1em 0.45em;
		border-radius: 4px;
		font-size: 0.82em;
		color: var(--cp-accent);
	}
	.image-guide-note {
		display: flex;
		align-items: flex-start;
		gap: 0.45rem;
		font-size: 0.82rem;
		color: var(--cp-text);
		line-height: 1.55;
		padding: 0.6rem 0.75rem;
		background: rgba(0, 220, 104, 0.05);
		border: 1px solid rgba(0, 220, 104, 0.15);
		border-radius: 7px;
	}
	.image-guide-note svg {
		flex-shrink: 0;
		margin-top: 0.15rem;
		color: var(--cp-accent);
		opacity: 0.8;
	}
	.image-guide-note strong {
		color: var(--cp-white);
	}

	/* Review list */
	.review-list {
		list-style: none;
		margin: 1.2rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.review-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		font-size: 0.92rem;
		color: var(--cp-text);
		line-height: 1.55;
	}
	.review-list svg {
		flex-shrink: 0;
		margin-top: 0.15rem;
	}

	/* Admin box */
	.admin-box {
		margin-top: 3.5rem;
		padding-top: 2.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.07);
	}
	.admin-box-inner {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px dashed rgba(255, 255, 255, 0.15);
		border-radius: 0.875rem;
		padding: 1.5rem;
		flex-wrap: wrap;
	}
	.admin-box-icon {
		font-size: 2rem;
		flex-shrink: 0;
		flex: 0;
	}
	.admin-box-inner > div:not(.admin-box-icon) {
		flex: 1 1 260px;
	}
	.admin-box-inner h3 {
		font-size: 1rem;
		color: var(--cp-white);
		margin: 0 0 0.35rem;
	}
	.admin-box-inner p {
		font-size: 0.87rem;
		color: var(--cp-text);
		margin: 0;
		line-height: 1.55;
	}
	.admin-link {
		flex-shrink: 0;
		white-space: nowrap;
	}
</style>
