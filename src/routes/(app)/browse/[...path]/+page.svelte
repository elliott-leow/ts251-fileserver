<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import FileGrid from '$lib/components/FileGrid.svelte';
	import { TextMorph } from 'torph/svelte';
	import { fly, scale, fade } from 'svelte/transition';

	let { data } = $props();

	let previewFile: any = $state(null);

	let currentPath = $derived(data.path || '/');
	let folderName = $derived(
		currentPath === '/'
			? 'Home'
			: currentPath.split('/').filter(Boolean).pop() || 'Home'
	);

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
</script>

<svelte:head>
	<title>{folderName} - Files</title>
</svelte:head>

<div class="browse-page">
	<div class="page-header" in:fly={{ y: -10, duration: 300 }}>
		<div class="title-area">
			<h1>
				<TextMorph
					text={folderName}
					duration={400}
					ease="cubic-bezier(0.19, 1, 0.22, 1)"
					as="span"
				/>
			</h1>
			<Breadcrumbs path={currentPath} />
		</div>
		{#if data.files?.length > 0}
			<span class="file-count" in:fly={{ x: 10, duration: 300 }}>
				<TextMorph
					text={`${data.files.length} item${data.files.length === 1 ? '' : 's'}`}
					duration={350}
					ease="cubic-bezier(0.19, 1, 0.22, 1)"
					as="span"
				/>
			</span>
		{/if}
	</div>

	{#if data.error}
		<div class="error glass" in:fly={{ y: 20, duration: 400 }}>
			<p>{data.error}</p>
		</div>
	{:else}
		{#key currentPath}
			<div in:fly={{ y: 15, duration: 350 }}>
				<FileGrid files={data.files} onPreview={openPreview} />
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
	.browse-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		margin-bottom: 1.25rem;
		gap: 1rem;
	}

	.title-area {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	h1 {
		font-size: 1.6rem;
		font-weight: 600;
		letter-spacing: -0.03em;
	}

	.file-count {
		font-size: 0.8rem;
		color: var(--text-tertiary);
		flex-shrink: 0;
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
