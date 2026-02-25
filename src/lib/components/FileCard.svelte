<script lang="ts">
	import { fly } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { getFileIcon, formatSize, formatDate } from '$lib/utils/format';

	let { file, index = 0, onPreview = null }: {
		file: any;
		index?: number;
		onPreview?: ((file: any) => void) | null;
	} = $props();

	let icon = $derived(getFileIcon(file.type));
	let href = $derived(file.isDirectory ? `/browse${file.path}` : null);

	function handleClick(e: MouseEvent) {
		if (!file.isDirectory && onPreview) {
			e.preventDefault();
			onPreview(file);
		}
	}

	function handleDownload(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (file.isDirectory) {
			window.location.href = `/api/download-zip${file.path}`;
		} else {
			window.location.href = `/api/download${file.path}`;
		}
	}
</script>

<div
	class="file-card glass"
	in:fly={{ y: 20, duration: 400, delay: Math.min(index * 30, 300), easing: elasticOut }}
	role="button"
	tabindex="0"
>
	<a
		href={href || `/api/download${file.path}?inline`}
		class="card-link"
		onclick={handleClick}
	>
		<div class="card-icon">
			<span class="icon">{icon}</span>
		</div>
		<div class="card-info">
			<span class="card-name">{file.name}</span>
			<span class="card-meta">
				{#if file.isDirectory}
					Folder
				{:else}
					{formatSize(file.size)}
				{/if}
				<span class="dot">·</span>
				{formatDate(file.modified)}
			</span>
		</div>
	</a>
	<button class="download-btn" onclick={handleDownload} title={file.isDirectory ? 'Download as ZIP' : 'Download'}>
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
			<path d="M8 2v8m0 0l-3-3m3 3l3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	</button>
</div>

<style>
	.file-card {
		display: flex;
		align-items: center;
		border-radius: var(--glass-radius-sm);
		transition: all 0.3s var(--spring-ease);
		overflow: hidden;
	}

	.file-card:hover {
		background: var(--glass-bg-hover);
		border-color: var(--glass-border-hover);
		transform: translateY(-2px) scale(1.005);
		box-shadow: var(--glass-shadow-lg);
	}

	.file-card:active {
		transform: translateY(0) scale(0.995);
	}

	.card-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		padding: 0.75rem 1rem;
		min-width: 0;
	}

	.card-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--glass-radius-xs);
		background: rgba(255, 255, 255, 0.06);
		flex-shrink: 0;
		font-size: 1.2rem;
		transition: all 0.3s var(--spring-ease);
	}

	.file-card:hover .card-icon {
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.05);
	}

	.card-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.card-name {
		font-size: 0.9rem;
		font-weight: 450;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-meta {
		font-size: 0.75rem;
		color: var(--text-tertiary);
	}

	.dot {
		margin: 0 0.25rem;
	}

	.download-btn {
		padding: 0.75rem;
		color: var(--text-tertiary);
		transition: all 0.25s var(--spring-ease);
		flex-shrink: 0;
	}

	.download-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.06);
	}
</style>
