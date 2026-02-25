<script lang="ts">
	import FileCard from './FileCard.svelte';
	import TextMorph from '$lib/components/TextMorph.svelte';
	import { fly, fade } from 'svelte/transition';

	let { files = [], onPreview = null, onDelete = null, deleting = null }: {
		files?: any[];
		onPreview?: ((file: any) => void) | null;
		onDelete?: ((file: any) => void) | null;
		deleting?: string | null;
	} = $props();
</script>

{#if files.length === 0}
	<div class="empty" in:fly={{ y: 20, duration: 400 }}>
		<span class="empty-icon" in:fade={{ duration: 600, delay: 100 }}>{'\u{1F4C2}'}</span>
		<TextMorph
			text="This folder is empty"
			duration={450}
			ease="cubic-bezier(0.19, 1, 0.22, 1)"
			as="p"
			class="empty-text"
		/>
	</div>
{:else}
	<div class="file-grid">
		{#each files as file, i (file.path)}
			<FileCard {file} index={i} {onPreview} {onDelete} isDeleting={deleting === file.path} />
		{/each}
	</div>
{/if}

<style>
	.file-grid {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		color: var(--text-tertiary);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 0.75rem;
		opacity: 0.5;
	}

	.empty :global(.empty-text) {
		font-size: 0.95rem;
	}
</style>
