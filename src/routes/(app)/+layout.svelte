<script>
	import GradientBackground from '$lib/components/GradientBackground.svelte';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<GradientBackground />
<div class="app-shell">
	<Header />
	<main>
		{@render children()}
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
		padding: 0 1.5rem 1.5rem;
	}
</style>
