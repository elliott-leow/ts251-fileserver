<script>
	import GradientBackground from '$lib/components/GradientBackground.svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { children } = $props();
</script>

<GradientBackground />
<div class="app-shell">
	<main>
		{#key $page.url.pathname}
			<div class="page-transition" in:fade={{ duration: 200, delay: 100 }} out:fade={{ duration: 100 }}>
				{@render children()}
			</div>
		{/key}
	</main>
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	main {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem 1.5rem 1.5rem;
	}

	.page-transition {
		animation: slideUp 0.3s cubic-bezier(0.19, 1, 0.22, 1);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
