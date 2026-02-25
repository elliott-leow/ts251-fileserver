<script lang="ts">
	import { goto } from '$app/navigation';
	import TextMorph from '$lib/components/TextMorph.svelte';
	import GradientBackground from '$lib/components/GradientBackground.svelte';
	import { fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let title = $state('Welcome');
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		setTimeout(() => {
			title = 'Enter Password';
		}, 800);
	});

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		if (!password.trim()) return;
		loading = true;
		error = '';
		title = 'Verifying...';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (res.ok) {
				title = 'Welcome In';
				await new Promise((r) => setTimeout(r, 600));
				goto('/');
			} else {
				title = 'Try Again';
				error = 'Wrong password';
				password = '';
			}
		} catch {
			title = 'Error';
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
		<div class="login-card glass" in:scale={{ duration: 600, start: 0.9, easing: elasticOut }}>
			<div class="title-row">
				<TextMorph
					text={title}
					duration={400}
					ease="cubic-bezier(0.19, 1, 0.22, 1)"
					as="h1"
					class="login-title"
				/>
			</div>

			<form onsubmit={handleLogin}>
				<div class="input-wrapper" in:fly={{ y: 20, duration: 500, delay: 200 }}>
					<input
						type="password"
						bind:value={password}
						placeholder="Password"
						disabled={loading}
						autocomplete="current-password"
					/>
				</div>

				{#if error}
					<p class="error" in:fly={{ y: -10, duration: 300 }}>
						{error}
					</p>
				{/if}

				<button
					type="submit"
					class="submit-btn"
					disabled={loading || !password.trim()}
					in:fly={{ y: 20, duration: 500, delay: 300 }}
				>
					{#if loading}
						<span class="spinner"></span>
					{:else}
						Enter
					{/if}
				</button>
			</form>
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
		max-width: 380px;
		padding: 2.5rem 2rem;
		text-align: center;
	}

	.title-row {
		margin-bottom: 2rem;
	}

	.title-row :global(h1) {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.input-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	input {
		width: 100%;
		padding: 0.875rem 1rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--glass-radius-sm);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-family: inherit;
		outline: none;
		transition: all 0.3s var(--spring-ease);
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
		background: rgba(255, 255, 255, 0.09);
	}

	input::placeholder {
		color: var(--text-tertiary);
	}

	.error {
		color: rgba(255, 100, 100, 0.9);
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}

	.submit-btn {
		width: 100%;
		padding: 0.875rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: var(--glass-radius-sm);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.3s var(--spring-ease);
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
	}

	.submit-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.16);
		border-color: rgba(255, 255, 255, 0.25);
		transform: translateY(-1px);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	.submit-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
