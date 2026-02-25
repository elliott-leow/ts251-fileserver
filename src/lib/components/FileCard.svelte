<script lang="ts">
	import { fly } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { getFileIcon, formatSize, formatDate } from '$lib/utils/format';

	let { file, index = 0, onPreview = null, onDelete = null, isDeleting = false }: {
		file: any;
		index?: number;
		onPreview?: ((file: any) => void) | null;
		onDelete?: ((file: any) => void) | null;
		isDeleting?: boolean;
	} = $props();

	let showConfirm = $state(false);
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

	function handleDeleteClick(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (showConfirm) {
			onDelete?.(file);
			showConfirm = false;
		} else {
			showConfirm = true;
			// Auto-hide confirm after 3s
			setTimeout(() => { showConfirm = false; }, 3000);
		}
	}
</script>

<div
	class="file-card glass"
	class:deleting={isDeleting}
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
				<span class="dot">&middot;</span>
				{formatDate(file.modified)}
			</span>
		</div>
	</a>
	<div class="card-actions">
		<button class="action-btn" onclick={handleDownload} title={file.isDirectory ? 'Download as ZIP' : 'Download'}>
			<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
				<path d="M8 2v8m0 0l-3-3m3 3l3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>
		{#if onDelete}
			<button
				class="action-btn delete-btn"
				class:confirm={showConfirm}
				onclick={handleDeleteClick}
				title={showConfirm ? 'Click again to confirm' : 'Delete'}
				disabled={isDeleting}
			>
				{#if isDeleting}
					<span class="spinner-sm"></span>
				{:else if showConfirm}
					<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
						<path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{:else}
					<svg width="15" height="15" viewBox="0 0 16 16" fill="none">
						<path d="M3 5h10M6 5V3.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V5m1.5 0l-.5 8a1 1 0 01-1 1h-4a1 1 0 01-1-1l-.5-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/if}
			</button>
		{/if}
	</div>
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

	.file-card.deleting {
		opacity: 0.4;
		pointer-events: none;
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

	.card-actions {
		display: flex;
		align-items: center;
		gap: 0.1rem;
		padding-right: 0.4rem;
		flex-shrink: 0;
	}

	.action-btn {
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--glass-radius-xs);
		color: var(--text-tertiary);
		transition: all 0.25s var(--spring-ease);
		cursor: pointer;
		border: none;
		background: none;
		font-family: inherit;
	}

	.action-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.08);
	}

	.action-btn:active {
		transform: scale(0.9);
	}

	.delete-btn:hover {
		color: rgba(255, 100, 100, 0.9);
	}

	.delete-btn.confirm {
		color: rgba(255, 100, 100, 1);
		background: rgba(255, 60, 60, 0.15);
		animation: pulse 0.6s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		from { background: rgba(255, 60, 60, 0.1); }
		to { background: rgba(255, 60, 60, 0.2); }
	}

	.spinner-sm {
		width: 12px;
		height: 12px;
		border: 1.5px solid rgba(255, 255, 255, 0.2);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
