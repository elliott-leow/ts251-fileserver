<script lang="ts">
	import { fly } from 'svelte/transition';

	let { count = 6 }: { count?: number } = $props();
</script>

<div class="skeleton-grid">
	{#each Array(count) as _, i}
		<div
			class="skeleton-card glass"
			in:fly={{ y: 15, duration: 300, delay: i * 40 }}
		>
			<div class="skeleton-icon shimmer"></div>
			<div class="skeleton-info">
				<div class="skeleton-name shimmer"></div>
				<div class="skeleton-meta shimmer"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.skeleton-grid {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.skeleton-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: var(--glass-radius-sm);
	}

	.skeleton-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--glass-radius-xs);
		flex-shrink: 0;
	}

	.skeleton-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.skeleton-name {
		height: 14px;
		width: 60%;
		border-radius: 4px;
	}

	.skeleton-meta {
		height: 10px;
		width: 35%;
		border-radius: 4px;
	}

	.shimmer {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 25%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.04) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
