<script lang="ts">
	import { goto } from '$app/navigation';
	import TextMorph from '$lib/components/TextMorph.svelte';
	import { fly } from 'svelte/transition';

	let currentTitle = 'Files';

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<header class="header glass">
	<div class="header-left">
		<a href="/browse" class="logo">
			<TextMorph
				text={currentTitle}
				duration={400}
				ease="cubic-bezier(0.19, 1, 0.22, 1)"
				as="span"
				class="logo-text"
			/>
		</a>
	</div>
	<div class="header-right">
		<button class="logout-btn" onclick={logout} in:fly={{ x: 10, duration: 300 }}>
			Logout
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		margin: 1rem 1.5rem 1rem;
		position: relative;
		z-index: 10;
	}

	.header-left {
		display: flex;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
	}

	.logo :global(.logo-text) {
		font-size: 1.1rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logout-btn {
		padding: 0.4rem 0.9rem;
		border-radius: var(--glass-radius-xs);
		font-size: 0.8rem;
		color: var(--text-secondary);
		transition: all 0.25s var(--spring-ease);
	}

	.logout-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.08);
	}
</style>
