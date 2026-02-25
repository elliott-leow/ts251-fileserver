<script lang="ts">
	import TextMorph from '$lib/components/TextMorph.svelte';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let { path = '/' }: { path?: string } = $props();

	let segments = $derived(path.split('/').filter(Boolean));
	let crumbs = $derived([
		{ name: 'Home', href: '/browse' },
		...segments.map((seg: string, i: number) => ({
			name: seg,
			href: '/browse/' + segments.slice(0, i + 1).join('/')
		}))
	]);
</script>

<nav class="breadcrumbs">
	{#each crumbs as crumb, i (crumb.href)}
		<span class="crumb-wrapper" animate:flip={{ duration: 300 }}>
			{#if i > 0}
				<span class="separator" in:fly={{ x: -5, duration: 200 }}>/</span>
			{/if}
			<a
				href={crumb.href}
				class="crumb"
				class:active={i === crumbs.length - 1}
				in:fly={{ y: -8, duration: 300, delay: i * 50 }}
			>
				<TextMorph
					text={crumb.name}
					duration={350}
					ease="cubic-bezier(0.19, 1, 0.22, 1)"
					as="span"
				/>
			</a>
		</span>
	{/each}
</nav>

<style>
	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.crumb-wrapper {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.separator {
		color: var(--text-tertiary);
		font-size: 0.85rem;
		user-select: none;
	}

	.crumb {
		padding: 0.25rem 0.5rem;
		border-radius: var(--glass-radius-xs);
		font-size: 0.9rem;
		color: var(--text-secondary);
		transition: all 0.25s var(--spring-ease);
	}

	.crumb:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.08);
	}

	.crumb.active {
		color: var(--text-primary);
		font-weight: 500;
	}
</style>
