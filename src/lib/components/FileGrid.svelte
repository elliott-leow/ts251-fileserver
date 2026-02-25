<script lang="ts">
	import FileCard from './FileCard.svelte';
	import { fly } from 'svelte/transition';

	let { files = [], onPreview = null, onDelete = null, deleting = null }: {
		files?: any[];
		onPreview?: ((file: any) => void) | null;
		onDelete?: ((file: any) => void) | null;
		deleting?: string | null;
	} = $props();
</script>

{#if files.length === 0}
	<div class="empty" in:fly={{ y: 20, duration: 400 }}>
		<span class="empty-icon">{'\u{1F4C2}'}</span>
		<p>This folder is empty</p>
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

	.empty p {
		font-size: 0.95rem;
	}
</style>
