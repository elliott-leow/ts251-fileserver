<script lang="ts">
	import { goto } from '$app/navigation';
	import TextMorph from '$lib/components/TextMorph.svelte';
	import GradientBackground from '$lib/components/GradientBackground.svelte';
	import { fly, scale, fade } from 'svelte/transition';
	import { elasticOut, cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let title = $state('Welcome');
	let subtitle = $state('TS-251+ File Server');
	let mounted = $state(false);
	let timeReady = $state(false);
	let hovered = $state(false);
	let inputFocused = $state(false);
	let titleTransitioned = $state(false);
	let showForm = $state(false);
	let buttonText = $state('Enter');

	onMount(() => {
		mounted = true;
		// Start the 2-second timer
		setTimeout(() => {
			timeReady = true;
			// If already hovered, transition immediately
			if (hovered) triggerTransition();
		}, 2000);

		// Show form elements after card animation
		setTimeout(() => {
			showForm = true;
		}, 500);
	});

	function triggerTransition() {
		if (titleTransitioned) return;
		titleTransitioned = true;
		title = 'Enter Password';
		subtitle = 'Authenticate to continue';
	}

	function handleHover() {
		hovered = true;
		if (timeReady) triggerTransition();
	}

	function handleFocus() {
		inputFocused = true;
		handleHover(); // Focus also triggers the transition
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		if (!password.trim()) return;
		loading = true;
		error = '';
		title = 'Verifying...';
		subtitle = 'Please wait';
		buttonText = 'Verifying';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (res.ok) {
				title = 'Welcome In';
				subtitle = 'Redirecting...';
				buttonText = 'Success';
				await new Promise((r) => setTimeout(r, 800));
				goto('/');
			} else {
				title = 'Try Again';
				subtitle = 'Invalid credentials';
				buttonText = 'Enter';
				error = 'Wrong password';
				password = '';
			}
		} catch {
			title = 'Error';
			subtitle = 'Connection failed';
			buttonText = 'Enter';
			error = 'Connection failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Files</title>
</svelte:head>

<GradientBackground />

<div class="login-container">
	{#if mounted}
		<div class="login-card glass" in:scale={{ duration: 700, start: 0.92, easing: elasticOut }}>
			<!-- Decorative accent line -->
			<div class="accent-line"></div>

			<div class="title-section">
				<div class="title-row">
					<TextMorph
						text={title}
						duration={500}
						ease="cubic-bezier(0.19, 1, 0.22, 1)"
						as="h1"
						class="login-title"
					/>
				</div>
				<div class="subtitle-row" in:fly={{ y: 8, duration: 400, delay: 200 }}>
					<TextMorph
						text={subtitle}
						duration={400}
						ease="cubic-bezier(0.19, 1, 0.22, 1)"
						as="p"
						class="login-subtitle"
					/>
				</div>
			</div>

			{#if showForm}
				<form onsubmit={handleLogin}>
					<div
						class="input-wrapper"
						class:focused={inputFocused}
						in:fly={{ y: 20, duration: 500, delay: 100, easing: cubicOut }}
					>
						<div class="input-icon">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
								<path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
								<circle cx="8" cy="10.5" r="1" fill="currentColor"/>
							</svg>
						</div>
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<input
							type="password"
							bind:value={password}
							placeholder="Password"
							disabled={loading}
							autocomplete="current-password"
							onmouseenter={handleHover}
							onfocus={handleFocus}
							onblur={() => inputFocused = false}
						/>
						<div class="input-glow"></div>
					</div>

					{#if error}
						<div class="error-wrapper" in:fly={{ y: -8, duration: 300 }} out:fade={{ duration: 200 }}>
							<TextMorph
								text={error}
								duration={300}
								ease="cubic-bezier(0.19, 1, 0.22, 1)"
								as="p"
								class="error"
							/>
						</div>
					{/if}

					<button
						type="submit"
						class="submit-btn"
						class:loading
						class:success={title === 'Welcome In'}
						disabled={loading || !password.trim()}
						in:fly={{ y: 20, duration: 500, delay: 200, easing: cubicOut }}
					>
						{#if loading}
							<span class="spinner"></span>
						{:else}
							<TextMorph
								text={buttonText}
								duration={350}
								ease="cubic-bezier(0.19, 1, 0.22, 1)"
								as="span"
							/>
						{/if}
						{#if !loading}
							<svg class="arrow-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path d="M3 8h10m0 0l-3.5-3.5M13 8l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{/if}
					</button>
				</form>
			{/if}

			<!-- Bottom decorative dots -->
			<div class="dots" in:fade={{ duration: 600, delay: 600 }}>
				<span class="dot"></span>
				<span class="dot"></span>
				<span class="dot"></span>
			</div>
		</div>
	{/if}
</div>

<style>
	.login-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		padding: 2.5rem 2.25rem 2rem;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.accent-line {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, transparent, var(--accent), transparent);
		border-radius: 2px;
		opacity: 0.7;
	}

	.title-section {
		margin-bottom: 2rem;
	}

	.title-row {
		margin-bottom: 0.4rem;
	}

	.title-row :global(h1) {
		font-size: 1.6rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(200,220,255,0.85));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle-row :global(p) {
		font-size: 0.85rem;
		color: var(--text-tertiary);
		letter-spacing: 0.01em;
	}

	.input-wrapper {
		position: relative;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 0.875rem;
		color: var(--text-tertiary);
		transition: color 0.3s var(--spring-ease);
		z-index: 1;
		display: flex;
	}

	.input-wrapper.focused .input-icon {
		color: var(--accent);
	}

	input {
		width: 100%;
		padding: 0.875rem 1rem 0.875rem 2.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: var(--glass-radius-sm);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-family: inherit;
		outline: none;
		transition: all 0.35s var(--spring-ease);
	}

	input:hover {
		border-color: rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.07);
	}

	input:focus {
		border-color: rgba(120, 180, 255, 0.5);
		box-shadow: 0 0 0 3px rgba(120, 180, 255, 0.12), 0 0 20px rgba(120, 180, 255, 0.06);
		background: rgba(255, 255, 255, 0.08);
	}

	input::placeholder {
		color: var(--text-tertiary);
	}

	.input-glow {
		position: absolute;
		inset: -1px;
		border-radius: var(--glass-radius-sm);
		opacity: 0;
		background: linear-gradient(135deg, rgba(120, 180, 255, 0.1), rgba(160, 100, 255, 0.05));
		pointer-events: none;
		transition: opacity 0.4s ease;
	}

	.input-wrapper.focused .input-glow {
		opacity: 1;
	}

	.error-wrapper {
		margin-bottom: 0.75rem;
	}

	.error-wrapper :global(p) {
		color: rgba(255, 120, 120, 0.9);
		font-size: 0.82rem;
		letter-spacing: 0.01em;
	}

	.submit-btn {
		width: 100%;
		padding: 0.875rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--glass-radius-sm);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.35s var(--spring-ease);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 48px;
	}

	.submit-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.14);
		border-color: rgba(255, 255, 255, 0.22);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	.submit-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.submit-btn.loading {
		opacity: 0.7;
	}

	.submit-btn.success {
		background: rgba(100, 200, 130, 0.15);
		border-color: rgba(100, 200, 130, 0.3);
	}

	.arrow-icon {
		transition: transform 0.3s var(--spring-ease);
		opacity: 0.7;
	}

	.submit-btn:hover:not(:disabled) .arrow-icon {
		transform: translateX(3px);
		opacity: 1;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.15);
		border-top-color: rgba(255, 255, 255, 0.8);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.dots {
		display: flex;
		justify-content: center;
		gap: 6px;
		margin-top: 1.75rem;
	}

	.dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
	}

	.dot:nth-child(2) {
		background: rgba(255, 255, 255, 0.25);
	}
</style>
