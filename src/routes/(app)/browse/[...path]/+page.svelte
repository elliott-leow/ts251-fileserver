<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import FileGrid from '$lib/components/FileGrid.svelte';
	import TextMorph from '$lib/components/TextMorph.svelte';
	import { fly, scale, fade } from 'svelte/transition';

	let { data } = $props();

	let previewFile: any = $state(null);
	let showNewFolder = $state(false);
	let newFolderName = $state('');
	let uploading = $state(false);
	let deleting = $state<string | null>(null);
	let fileInput: HTMLInputElement;

	let currentPath = $derived(data.path || '/');
	let folderName = $derived(
		currentPath === '/'
			? 'Home'
			: currentPath.split('/').filter(Boolean).pop() || 'Home'
	);
	let apiPath = $derived(currentPath === '/' ? '' : currentPath);

	let textContent = $state('');
	let textLoading = $state(false);

	function openPreview(file: any) {
		previewFile = file;
		if (['text', 'code'].includes(file.type)) {
			textLoading = true;
			textContent = '';
			fetch(`/api/download${file.path}?inline`)
				.then(r => r.text())
				.then(content => {
					textContent = content;
					textLoading = false;
				})
				.catch(() => {
					textContent = 'Failed to load file';
					textLoading = false;
				});
		}
	}

	function closePreview() {
		previewFile = null;
		textContent = '';
		textLoading = false;
	}

	function handleOverlayKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closePreview();
	}

	async function handleUpload() {
		fileInput.click();
	}

	async function onFilesSelected(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;

		uploading = true;
		const formData = new FormData();
		for (const file of input.files) {
			formData.append('files', file);
		}

		try {
			const res = await fetch(`/api/upload${apiPath}`, {
				method: 'POST',
				body: formData
			});
			if (res.ok) {
				await invalidateAll();
			}
		} finally {
			uploading = false;
			input.value = '';
		}
	}

	async function handleNewFolder(e: SubmitEvent) {
		e.preventDefault();
		if (!newFolderName.trim()) return;

		const res = await fetch(`/api/mkdir${apiPath}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newFolderName.trim() })
		});

		if (res.ok) {
			newFolderName = '';
			showNewFolder = false;
			await invalidateAll();
		}
	}

	async function handleDelete(file: any) {
		deleting = file.path;
		try {
			const res = await fetch(`/api/delete${file.path}`, { method: 'DELETE' });
			if (res.ok) {
				await invalidateAll();
			}
		} finally {
			deleting = null;
		}
	}

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<svelte:head>
	<title>{folderName} - Files</title>
</svelte:head>

<input
	bind:this={fileInput}
	type="file"
	multiple
	class="hidden-input"
	onchange={onFilesSelected}
/>

<div class="browse-page">
	<!-- Toolbar: breadcrumbs + actions, all in one glass bar -->
	<div class="toolbar glass" in:fly={{ y: -10, duration: 300 }}>
		<div class="toolbar-left">
			<Breadcrumbs path={currentPath} />
			{#if data.files?.length > 0}
				<span class="file-count">
					<TextMorph
						text={`${data.files.length} item${data.files.length === 1 ? '' : 's'}`}
						duration={350}
						ease="cubic-bezier(0.19, 1, 0.22, 1)"
						as="span"
					/>
				</span>
			{/if}
		</div>
		<div class="toolbar-actions">
			<button class="action-btn" onclick={handleUpload} title="Upload files" disabled={uploading}>
				{#if uploading}
					<span class="spinner-sm"></span>
				{:else}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M8 10V2m0 0L5 5m3-3l3 3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/if}
			</button>
			<button class="action-btn" onclick={() => showNewFolder = !showNewFolder} title="New folder" class:active={showNewFolder}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M2 4h4.5l1.5 1.5H14v7.5H2V4z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M8 7.5v4M6 9.5h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			</button>
			<div class="divider"></div>
			<button class="action-btn logout" onclick={logout} title="Logout">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M6 2H3v12h3M11 4l4 4-4 4M7 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>
	</div>

	<!-- New folder input -->
	{#if showNewFolder}
		<form class="new-folder glass" onsubmit={handleNewFolder} in:fly={{ y: -8, duration: 250 }}>
			<input
				type="text"
				bind:value={newFolderName}
				placeholder="Folder name"
				autofocus
			/>
			<button type="submit" class="action-btn" disabled={!newFolderName.trim()}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<button type="button" class="action-btn" onclick={() => { showNewFolder = false; newFolderName = ''; }}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			</button>
		</form>
	{/if}

	{#if data.error}
		<div class="error glass" in:fly={{ y: 20, duration: 400 }}>
			<p>{data.error}</p>
		</div>
	{:else}
		{#key currentPath}
			<div in:fly={{ y: 15, duration: 350 }}>
				<FileGrid files={data.files} onPreview={openPreview} onDelete={handleDelete} {deleting} />
			</div>
		{/key}
	{/if}
</div>

{#if previewFile}
	<div
		class="preview-overlay"
		onclick={closePreview}
		onkeydown={handleOverlayKeydown}
		role="dialog"
		tabindex="-1"
		in:fade={{ duration: 200 }}
	>
		<div
			class="preview-card glass"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			role="document"
			in:scale={{ duration: 400, start: 0.95 }}
		>
			<div class="preview-header">
				<TextMorph
					text={previewFile.name}
					duration={300}
					ease="cubic-bezier(0.19, 1, 0.22, 1)"
					as="h2"
				/>
				<button class="close-btn" onclick={closePreview}>&#x2715;</button>
			</div>
			<div class="preview-body">
				{#if previewFile.type === 'image'}
					<img src="/api/download{previewFile.path}?inline" alt={previewFile.name} />
				{:else if previewFile.type === 'video'}
					<video controls src="/api/download{previewFile.path}?inline">
						<track kind="captions" />
					</video>
				{:else if previewFile.type === 'audio'}
					<div class="audio-wrapper">
						<span class="audio-icon">{'\u{1F3B5}'}</span>
						<audio controls src="/api/download{previewFile.path}?inline"></audio>
					</div>
				{:else if previewFile.type === 'pdf'}
					<iframe src="/api/download{previewFile.path}?inline" title={previewFile.name}></iframe>
				{:else if ['text', 'code'].includes(previewFile.type)}
					{#if textLoading}
						<div class="loading-preview">Loading...</div>
					{:else}
						<pre class="code-preview"><code>{textContent}</code></pre>
					{/if}
				{:else}
					<div class="no-preview">
						<p>No preview available</p>
						<a href="/api/download{previewFile.path}" class="download-link glass">Download File</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.hidden-input {
		display: none;
	}

	.browse-page {
		max-width: 900px;
		margin: 0 auto;
	}

	/* Toolbar */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		margin-bottom: 0.75rem;
		gap: 0.75rem;
		border-radius: var(--glass-radius-sm);
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
		flex: 1;
	}

	.file-count {
		font-size: 0.75rem;
		color: var(--text-tertiary);
		flex-shrink: 0;
		white-space: nowrap;
	}

	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.action-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--glass-radius-xs);
		color: var(--text-secondary);
		transition: all 0.25s var(--spring-ease);
	}

	.action-btn:hover:not(:disabled) {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.1);
	}

	.action-btn:active:not(:disabled) {
		transform: scale(0.92);
	}

	.action-btn.active {
		color: var(--accent);
		background: rgba(120, 180, 255, 0.12);
	}

	.action-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.action-btn.logout {
		color: var(--text-tertiary);
	}

	.divider {
		width: 1px;
		height: 18px;
		background: var(--glass-border);
		margin: 0 0.15rem;
	}

	.spinner-sm {
		width: 14px;
		height: 14px;
		border: 1.5px solid rgba(255, 255, 255, 0.2);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* New folder form */
	.new-folder {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.5rem;
		margin-bottom: 0.75rem;
		border-radius: var(--glass-radius-sm);
	}

	.new-folder input {
		flex: 1;
		padding: 0.4rem 0.65rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--glass-radius-xs);
		color: var(--text-primary);
		font-size: 0.85rem;
		font-family: inherit;
		outline: none;
		transition: all 0.3s var(--spring-ease);
	}

	.new-folder input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-glow);
	}

	.new-folder input::placeholder {
		color: var(--text-tertiary);
	}

	.error {
		padding: 2rem;
		text-align: center;
		color: rgba(255, 100, 100, 0.9);
	}

	/* Preview Modal */
	.preview-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.preview-card {
		width: 100%;
		max-width: 800px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--glass-border);
	}

	.preview-header :global(h2) {
		font-size: 1rem;
		font-weight: 500;
	}

	.close-btn {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 0.9rem;
		color: var(--text-secondary);
		transition: all 0.25s var(--spring-ease);
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
	}

	.preview-body {
		flex: 1;
		overflow: auto;
		padding: 1rem;
	}

	.preview-body img {
		width: 100%;
		height: auto;
		border-radius: var(--glass-radius-xs);
		object-fit: contain;
		max-height: 70vh;
	}

	.preview-body video {
		width: 100%;
		border-radius: var(--glass-radius-xs);
		max-height: 70vh;
	}

	.audio-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		padding: 3rem 1rem;
	}

	.audio-icon {
		font-size: 4rem;
		opacity: 0.6;
	}

	.audio-wrapper audio {
		width: 100%;
		max-width: 400px;
	}

	.preview-body iframe {
		width: 100%;
		height: 70vh;
		border: none;
		border-radius: var(--glass-radius-xs);
	}

	.code-preview {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: var(--glass-radius-xs);
		overflow: auto;
		font-size: 0.8rem;
		line-height: 1.5;
		max-height: 65vh;
		font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
		white-space: pre-wrap;
		word-break: break-all;
		color: var(--text-primary);
	}

	.no-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem;
		text-align: center;
		color: var(--text-secondary);
	}

	.download-link {
		padding: 0.6rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 500;
		border-radius: var(--glass-radius-xs);
		transition: all 0.25s var(--spring-ease);
	}

	.download-link:hover {
		background: var(--glass-bg-hover);
	}

	.loading-preview {
		text-align: center;
		padding: 2rem;
		color: var(--text-tertiary);
	}
</style>
