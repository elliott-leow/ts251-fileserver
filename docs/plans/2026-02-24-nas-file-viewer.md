# NAS File Viewer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a glassmorphism (iOS 26 liquid glass) file viewer for a QNAP TS-251+ NAS, served publicly via Cloudflare tunnel with password auth, using torph for animated text throughout.

**Architecture:** Single SvelteKit full-stack app. Server routes handle filesystem access, auth, and zip downloads. Client uses torph for text morphing, CSS backdrop-filter for glass effects, and Svelte transitions for smooth animations. Password auth via JWT cookie.

**Tech Stack:** SvelteKit, torph/svelte, archiver (zip), bcrypt, jsonwebtoken, Inter font, plain CSS animations

---

### Task 1: Scaffold SvelteKit Project

**Files:**
- Create: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `src/app.html`, `src/app.css`

**Step 1: Initialize SvelteKit project**

```bash
cd /home/kano/Projects/ts251_fileServer
npm create svelte@latest . -- --template skeleton --types typescript
```

Select: Skeleton project, TypeScript, no extras.

**Step 2: Install dependencies**

```bash
npm install torph bcryptjs jsonwebtoken archiver
npm install -D @types/bcryptjs @types/jsonwebtoken @types/archiver @sveltejs/adapter-node
```

**Step 3: Switch to Node adapter in svelte.config.js**

```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
	preprocess: vitePreprocess()
};

export default config;
```

**Step 4: Create `.env` for local dev**

```
FILE_SERVER_PASSWORD=devpassword
FILE_ROOT=/home/kano/Projects
JWT_SECRET=dev-secret-change-in-production
PORT=3000
```

**Step 5: Create `src/app.html`**

```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
	<title>Files</title>
	%sveltekit.head%
</head>
<body data-sveltekit-preload-data="hover">
	<div style="display: contents">%sveltekit.body%</div>
</body>
</html>
```

**Step 6: Create `src/app.css` with glass design system**

```css
:root {
	--glass-bg: rgba(255, 255, 255, 0.08);
	--glass-bg-hover: rgba(255, 255, 255, 0.14);
	--glass-bg-active: rgba(255, 255, 255, 0.18);
	--glass-border: rgba(255, 255, 255, 0.12);
	--glass-border-hover: rgba(255, 255, 255, 0.22);
	--glass-blur: blur(40px) saturate(180%);
	--glass-blur-light: blur(20px) saturate(150%);
	--glass-radius: 18px;
	--glass-radius-sm: 12px;
	--glass-radius-xs: 8px;
	--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
	--glass-shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);

	--text-primary: rgba(255, 255, 255, 0.95);
	--text-secondary: rgba(255, 255, 255, 0.6);
	--text-tertiary: rgba(255, 255, 255, 0.4);

	--accent: rgba(120, 180, 255, 0.9);
	--accent-glow: rgba(120, 180, 255, 0.3);

	--spring-ease: cubic-bezier(0.19, 1, 0.22, 1);
	--bounce-ease: cubic-bezier(0.34, 1.56, 0.64, 1);
	--smooth-ease: cubic-bezier(0.4, 0, 0.2, 1);

	font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	color: var(--text-primary);
}

*, *::before, *::after {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

body {
	min-height: 100vh;
	overflow: hidden;
	background: #0a0a0f;
}

button {
	font-family: inherit;
	cursor: pointer;
	border: none;
	background: none;
	color: inherit;
}

a {
	color: inherit;
	text-decoration: none;
}

/* Utility: glass panel */
.glass {
	background: var(--glass-bg);
	backdrop-filter: var(--glass-blur);
	-webkit-backdrop-filter: var(--glass-blur);
	border: 1px solid var(--glass-border);
	border-radius: var(--glass-radius);
	box-shadow: var(--glass-shadow);
}

/* Scrollbar styling */
::-webkit-scrollbar {
	width: 6px;
}
::-webkit-scrollbar-track {
	background: transparent;
}
::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.15);
	border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.25);
}
```

**Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Server runs on localhost:5173, shows empty page.

**Step 8: Init git and commit**

```bash
git init
echo "node_modules\n.env\nbuild\n.svelte-kit" > .gitignore
git add -A
git commit -m "feat: scaffold SvelteKit project with glass design system"
```

---

### Task 2: Animated Gradient Background Component

**Files:**
- Create: `src/lib/components/GradientBackground.svelte`

**Step 1: Create the animated gradient mesh background**

This is the foundation of the iOS 26 look - a slowly morphing gradient with floating orbs behind all glass panels.

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let animationId: number;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let time = 0;

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}

		function drawOrb(x: number, y: number, radius: number, color: string) {
			const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
			gradient.addColorStop(0, color);
			gradient.addColorStop(1, 'transparent');
			ctx.fillStyle = gradient;
			ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
		}

		function animate() {
			time += 0.003;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Deep dark base
			ctx.fillStyle = '#0a0a0f';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const w = canvas.width;
			const h = canvas.height;

			// Floating orbs with slow sinusoidal movement
			drawOrb(
				w * 0.3 + Math.sin(time * 0.7) * w * 0.15,
				h * 0.3 + Math.cos(time * 0.5) * h * 0.1,
				w * 0.35,
				'rgba(100, 60, 180, 0.15)'
			);
			drawOrb(
				w * 0.7 + Math.cos(time * 0.6) * w * 0.12,
				h * 0.6 + Math.sin(time * 0.8) * h * 0.15,
				w * 0.3,
				'rgba(40, 100, 200, 0.12)'
			);
			drawOrb(
				w * 0.5 + Math.sin(time * 0.9) * w * 0.1,
				h * 0.8 + Math.cos(time * 0.4) * h * 0.08,
				w * 0.25,
				'rgba(180, 60, 120, 0.1)'
			);
			drawOrb(
				w * 0.15 + Math.cos(time * 0.5) * w * 0.08,
				h * 0.7 + Math.sin(time * 0.7) * h * 0.12,
				w * 0.2,
				'rgba(60, 160, 180, 0.08)'
			);

			animationId = requestAnimationFrame(animate);
		}

		resize();
		window.addEventListener('resize', resize);
		animate();

		return () => {
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(animationId);
		};
	});
</script>

<canvas bind:this={canvas} class="gradient-bg"></canvas>

<style>
	.gradient-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}
</style>
```

**Step 2: Verify visually**

Import into `src/routes/+page.svelte` temporarily:

```svelte
<script>
	import GradientBackground from '$lib/components/GradientBackground.svelte';
</script>

<GradientBackground />
<h1 style="color: white; padding: 2rem;">Test</h1>
```

Expected: Dark background with slowly drifting colored orbs.

**Step 3: Commit**

```bash
git add src/lib/components/GradientBackground.svelte
git commit -m "feat: add animated gradient mesh background"
```

---

### Task 3: Auth System (Server-Side)

**Files:**
- Create: `src/lib/server/auth.ts`
- Create: `src/hooks.server.ts`
- Create: `src/routes/api/auth/login/+server.ts`
- Create: `src/routes/api/auth/logout/+server.ts`

**Step 1: Create auth utility**

`src/lib/server/auth.ts`:

```ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

const JWT_SECRET = env.JWT_SECRET || 'fallback-dev-secret';
const PASSWORD = env.FILE_SERVER_PASSWORD || 'admin';

export async function verifyPassword(input: string): Promise<boolean> {
	// Direct comparison since we store plaintext in env
	// For production you could store a hash in env instead
	return input === PASSWORD;
}

export function createToken(): string {
	return jwt.sign({ authenticated: true }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): boolean {
	try {
		jwt.verify(token, JWT_SECRET);
		return true;
	} catch {
		return false;
	}
}
```

**Step 2: Create server hooks for auth gating**

`src/hooks.server.ts`:

```ts
import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// Allow public paths
	if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
		return resolve(event);
	}

	// Check auth cookie
	const token = event.cookies.get('auth_token');
	if (!token || !verifyToken(token)) {
		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(303, '/login');
	}

	return resolve(event);
};
```

**Step 3: Create login API endpoint**

`src/routes/api/auth/login/+server.ts`:

```ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword, createToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { password } = await request.json();

	if (!password || !(await verifyPassword(password))) {
		return json({ error: 'Invalid password' }, { status: 401 });
	}

	const token = createToken();
	cookies.set('auth_token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7 // 7 days
	});

	return json({ success: true });
};
```

**Step 4: Create logout API endpoint**

`src/routes/api/auth/logout/+server.ts`:

```ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('auth_token', { path: '/' });
	return json({ success: true });
};
```

**Step 5: Verify auth redirects work**

```bash
npm run dev
# Visit localhost:5173 -> should redirect to /login
# Visit localhost:5173/api/files -> should return 401
```

**Step 6: Commit**

```bash
git add src/lib/server/auth.ts src/hooks.server.ts src/routes/api/auth/
git commit -m "feat: add password auth with JWT cookies"
```

---

### Task 4: Login Page

**Files:**
- Create: `src/routes/login/+page.svelte`

**Step 1: Build the login page with glass card and torph title**

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { TextMorph } from 'torph/svelte';
	import GradientBackground from '$lib/components/GradientBackground.svelte';
	import { fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	let password = '';
	let error = '';
	let loading = false;
	let title = 'Welcome';
	let mounted = false;

	import { onMount } from 'svelte';
	onMount(() => {
		mounted = true;
		// Morph title after mount
		setTimeout(() => { title = 'Enter Password'; }, 800);
	});

	async function handleLogin() {
		if (!password.trim()) return;
		loading = true;
		error = '';
		title = 'Verifying...';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (res.ok) {
				title = 'Welcome In';
				await new Promise(r => setTimeout(r, 600));
				goto('/');
			} else {
				title = 'Try Again';
				error = 'Wrong password';
				password = '';
			}
		} catch {
			title = 'Error';
			error = 'Connection failed';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Files</title>
</svelte:head>

<GradientBackground />

<div class="login-container">
	{#if mounted}
		<div
			class="login-card glass"
			in:scale={{ duration: 600, start: 0.9, easing: elasticOut }}
		>
			<div class="title-row">
				<TextMorph
					text={title}
					duration={400}
					ease="cubic-bezier(0.19, 1, 0.22, 1)"
					as="h1"
					class="login-title"
				/>
			</div>

			<form on:submit|preventDefault={handleLogin}>
				<div
					class="input-wrapper"
					in:fly={{ y: 20, duration: 500, delay: 200 }}
				>
					<input
						type="password"
						bind:value={password}
						placeholder="Password"
						disabled={loading}
						autocomplete="current-password"
					/>
				</div>

				{#if error}
					<p
						class="error"
						in:fly={{ y: -10, duration: 300 }}
					>
						{error}
					</p>
				{/if}

				<button
					type="submit"
					class="submit-btn"
					disabled={loading || !password.trim()}
					in:fly={{ y: 20, duration: 500, delay: 300 }}
				>
					{#if loading}
						<span class="spinner"></span>
					{:else}
						Enter
					{/if}
				</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.login-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
	}

	.login-card {
		width: 100%;
		max-width: 380px;
		padding: 2.5rem 2rem;
		text-align: center;
	}

	.title-row {
		margin-bottom: 2rem;
	}

	.title-row :global(h1) {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.input-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	input {
		width: 100%;
		padding: 0.875rem 1rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--glass-radius-sm);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-family: inherit;
		outline: none;
		transition: all 0.3s var(--spring-ease);
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
		background: rgba(255, 255, 255, 0.09);
	}

	input::placeholder {
		color: var(--text-tertiary);
	}

	.error {
		color: rgba(255, 100, 100, 0.9);
		font-size: 0.85rem;
		margin-bottom: 0.75rem;
	}

	.submit-btn {
		width: 100%;
		padding: 0.875rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: var(--glass-radius-sm);
		color: var(--text-primary);
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.3s var(--spring-ease);
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
	}

	.submit-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.16);
		border-color: rgba(255, 255, 255, 0.25);
		transform: translateY(-1px);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	.submit-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
```

**Step 2: Verify login page**

```bash
npm run dev
# Visit localhost:5173 -> redirects to /login
# Should see animated background, glass card, morphing title
# Type "devpassword" -> should redirect to /
```

**Step 3: Commit**

```bash
git add src/routes/login/
git commit -m "feat: add glassmorphism login page with torph animations"
```

---

### Task 5: File System API Routes

**Files:**
- Create: `src/lib/server/files.ts`
- Create: `src/routes/api/files/[...path]/+server.ts`
- Create: `src/routes/api/download/[...path]/+server.ts`
- Create: `src/routes/api/download-zip/[...path]/+server.ts`

**Step 1: Create file system utility**

`src/lib/server/files.ts`:

```ts
import { readdir, stat } from 'fs/promises';
import { join, resolve, extname } from 'path';
import { env } from '$env/dynamic/private';

const FILE_ROOT = env.FILE_ROOT || '/share/Public';

export interface FileEntry {
	name: string;
	path: string;
	isDirectory: boolean;
	size: number;
	modified: string;
	extension: string;
	type: FileType;
}

export type FileType = 'folder' | 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'pdf' | 'text' | 'other';

const EXT_MAP: Record<string, FileType> = {
	// Images
	'.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image',
	'.webp': 'image', '.svg': 'image', '.bmp': 'image', '.ico': 'image', '.avif': 'image',
	// Video
	'.mp4': 'video', '.mkv': 'video', '.avi': 'video', '.mov': 'video',
	'.webm': 'video', '.flv': 'video', '.wmv': 'video', '.m4v': 'video',
	// Audio
	'.mp3': 'audio', '.flac': 'audio', '.wav': 'audio', '.ogg': 'audio',
	'.m4a': 'audio', '.aac': 'audio', '.wma': 'audio', '.opus': 'audio',
	// Documents
	'.pdf': 'pdf', '.doc': 'document', '.docx': 'document',
	'.xls': 'document', '.xlsx': 'document', '.ppt': 'document', '.pptx': 'document',
	'.odt': 'document', '.ods': 'document',
	// Code
	'.js': 'code', '.ts': 'code', '.py': 'code', '.rs': 'code', '.go': 'code',
	'.java': 'code', '.c': 'code', '.cpp': 'code', '.h': 'code', '.css': 'code',
	'.html': 'code', '.json': 'code', '.yaml': 'code', '.yml': 'code',
	'.toml': 'code', '.xml': 'code', '.sql': 'code', '.sh': 'code',
	'.svelte': 'code', '.vue': 'code', '.jsx': 'code', '.tsx': 'code',
	'.nix': 'code', '.conf': 'code', '.ini': 'code',
	// Text
	'.txt': 'text', '.md': 'text', '.log': 'text', '.csv': 'text', '.rtf': 'text',
	// Archives
	'.zip': 'archive', '.tar': 'archive', '.gz': 'archive', '.bz2': 'archive',
	'.7z': 'archive', '.rar': 'archive', '.xz': 'archive',
};

function getFileType(ext: string, isDir: boolean): FileType {
	if (isDir) return 'folder';
	return EXT_MAP[ext.toLowerCase()] || 'other';
}

export function safePath(requestedPath: string): string | null {
	const root = resolve(FILE_ROOT);
	const full = resolve(root, requestedPath);
	if (!full.startsWith(root)) return null;
	return full;
}

export async function listDirectory(dirPath: string): Promise<FileEntry[]> {
	const root = resolve(FILE_ROOT);
	const entries = await readdir(dirPath, { withFileTypes: true });

	const files: FileEntry[] = [];

	for (const entry of entries) {
		// Skip hidden files
		if (entry.name.startsWith('.')) continue;

		try {
			const fullPath = join(dirPath, entry.name);
			const info = await stat(fullPath);
			const ext = extname(entry.name);
			const relativePath = fullPath.slice(root.length).replace(/\\/g, '/');

			files.push({
				name: entry.name,
				path: relativePath,
				isDirectory: entry.isDirectory(),
				size: info.size,
				modified: info.mtime.toISOString(),
				extension: ext,
				type: getFileType(ext, entry.isDirectory())
			});
		} catch {
			// Skip files we can't stat (permission errors, etc.)
		}
	}

	// Folders first, then alphabetical
	files.sort((a, b) => {
		if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
		return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
	});

	return files;
}

export function getRoot(): string {
	return resolve(FILE_ROOT);
}
```

**Step 2: Create directory listing API**

`src/routes/api/files/[...path]/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safePath, listDirectory } from '$lib/server/files';

export const GET: RequestHandler = async ({ params }) => {
	const requestedPath = params.path || '';
	const fullPath = safePath(requestedPath);

	if (!fullPath) {
		throw error(403, 'Access denied');
	}

	try {
		const files = await listDirectory(fullPath);
		return json({ path: '/' + requestedPath, files });
	} catch (e: any) {
		if (e.code === 'ENOENT') throw error(404, 'Directory not found');
		if (e.code === 'ENOTDIR') throw error(400, 'Not a directory');
		throw error(500, 'Failed to read directory');
	}
};
```

**Step 3: Create file download API**

`src/routes/api/download/[...path]/+server.ts`:

```ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safePath } from '$lib/server/files';
import { createReadStream, statSync } from 'fs';
import { basename } from 'path';
import { Readable } from 'stream';

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
	'.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
	'.avif': 'image/avif', '.bmp': 'image/bmp',
	'.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
	'.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo',
	'.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.wav': 'audio/wav',
	'.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.opus': 'audio/opus',
	'.pdf': 'application/pdf',
	'.json': 'application/json', '.xml': 'application/xml',
	'.txt': 'text/plain', '.md': 'text/plain', '.csv': 'text/csv',
	'.log': 'text/plain',
	'.html': 'text/html', '.css': 'text/css',
	'.js': 'text/javascript', '.ts': 'text/plain',
	'.py': 'text/plain', '.sh': 'text/plain',
	'.zip': 'application/zip', '.tar': 'application/x-tar',
	'.gz': 'application/gzip',
};

export const GET: RequestHandler = async ({ params, url }) => {
	const requestedPath = params.path || '';
	const fullPath = safePath(requestedPath);

	if (!fullPath) throw error(403, 'Access denied');

	try {
		const stats = statSync(fullPath);
		if (stats.isDirectory()) throw error(400, 'Cannot download directory directly');

		const ext = '.' + basename(fullPath).split('.').pop()?.toLowerCase();
		const mime = MIME_TYPES[ext] || 'application/octet-stream';
		const filename = basename(fullPath);

		// If ?inline param, serve inline for preview; otherwise attachment
		const inline = url.searchParams.has('inline');
		const disposition = inline ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`;

		const stream = createReadStream(fullPath);
		const webStream = Readable.toWeb(stream) as ReadableStream;

		return new Response(webStream, {
			headers: {
				'Content-Type': mime,
				'Content-Disposition': disposition,
				'Content-Length': stats.size.toString(),
				'Cache-Control': 'private, max-age=3600'
			}
		});
	} catch (e: any) {
		if (e.status) throw e;
		if (e.code === 'ENOENT') throw error(404, 'File not found');
		throw error(500, 'Failed to serve file');
	}
};
```

**Step 4: Create zip download API**

`src/routes/api/download-zip/[...path]/+server.ts`:

```ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safePath } from '$lib/server/files';
import { statSync } from 'fs';
import { basename } from 'path';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { Readable } from 'stream';

export const GET: RequestHandler = async ({ params }) => {
	const requestedPath = params.path || '';
	const fullPath = safePath(requestedPath);

	if (!fullPath) throw error(403, 'Access denied');

	try {
		const stats = statSync(fullPath);
		if (!stats.isDirectory()) throw error(400, 'Not a directory');

		const folderName = basename(fullPath) || 'download';
		const passthrough = new PassThrough();

		const archive = archiver('zip', { zlib: { level: 5 } });
		archive.on('error', () => passthrough.destroy());
		archive.pipe(passthrough);
		archive.directory(fullPath, folderName);
		archive.finalize();

		const webStream = Readable.toWeb(passthrough) as ReadableStream;

		return new Response(webStream, {
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${folderName}.zip"`,
				'Transfer-Encoding': 'chunked'
			}
		});
	} catch (e: any) {
		if (e.status) throw e;
		if (e.code === 'ENOENT') throw error(404, 'Directory not found');
		throw error(500, 'Failed to create zip');
	}
};
```

**Step 5: Test API endpoints**

```bash
npm run dev
# In another terminal:
curl -s http://localhost:5173/api/files/ -H "Cookie: auth_token=<token>"
# Should return JSON with file listing (or 401 if not authed)
```

**Step 6: Commit**

```bash
git add src/lib/server/files.ts src/routes/api/
git commit -m "feat: add file listing, download, and zip download API routes"
```

---

### Task 6: Layout and Root Page with Breadcrumbs

**Files:**
- Create: `src/routes/+layout.svelte`
- Create: `src/routes/(app)/+layout.svelte`
- Create: `src/routes/(app)/+page.svelte`
- Create: `src/routes/(app)/browse/[...path]/+page.svelte`
- Create: `src/routes/(app)/browse/[...path]/+page.ts`
- Create: `src/lib/components/Breadcrumbs.svelte`
- Create: `src/lib/components/Header.svelte`
- Create: `src/lib/utils/format.ts`

**Step 1: Create root layout**

`src/routes/+layout.svelte`:

```svelte
<script>
	import '../app.css';
</script>

<slot />
```

**Step 2: Create app layout (authenticated pages)**

`src/routes/(app)/+layout.svelte`:

```svelte
<script>
	import GradientBackground from '$lib/components/GradientBackground.svelte';
	import Header from '$lib/components/Header.svelte';
	import { fly } from 'svelte/transition';
</script>

<GradientBackground />
<div class="app-shell">
	<Header />
	<main>
		<slot />
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
```

**Step 3: Create format utilities**

`src/lib/utils/format.ts`:

```ts
export function formatSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const val = bytes / Math.pow(1024, i);
	return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
}

export function formatDate(iso: string): string {
	const d = new Date(iso);
	const now = new Date();
	const diff = now.getTime() - d.getTime();
	const days = Math.floor(diff / 86400000);

	if (days === 0) {
		const hours = Math.floor(diff / 3600000);
		if (hours === 0) {
			const mins = Math.floor(diff / 60000);
			return mins <= 1 ? 'Just now' : `${mins}m ago`;
		}
		return `${hours}h ago`;
	}
	if (days === 1) return 'Yesterday';
	if (days < 7) return `${days}d ago`;
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export function getFileIcon(type: string): string {
	const icons: Record<string, string> = {
		folder: '📁',
		image: '🖼️',
		video: '🎬',
		audio: '🎵',
		document: '📄',
		code: '💻',
		archive: '📦',
		pdf: '📕',
		text: '📝',
		other: '📎'
	};
	return icons[type] || '📎';
}
```

**Step 4: Create Breadcrumbs component**

`src/lib/components/Breadcrumbs.svelte`:

```svelte
<script lang="ts">
	import { TextMorph } from 'torph/svelte';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let path: string = '/';

	$: segments = path.split('/').filter(Boolean);
	$: crumbs = [
		{ name: 'Home', href: '/browse' },
		...segments.map((seg, i) => ({
			name: seg,
			href: '/browse/' + segments.slice(0, i + 1).join('/')
		}))
	];
</script>

<nav class="breadcrumbs">
	{#each crumbs as crumb, i (crumb.href)}
		<span
			class="crumb-wrapper"
			animate:flip={{ duration: 300 }}
		>
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
```

**Step 5: Create Header component**

`src/lib/components/Header.svelte`:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { TextMorph } from 'torph/svelte';
	import { fly } from 'svelte/transition';

	let currentTitle = 'Files';

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<header class="header glass">
	<div class="header-left">
		<a href="/browse" class="logo">
			<TextMorph
				text={currentTitle}
				duration={400}
				ease="cubic-bezier(0.19, 1, 0.22, 1)"
				as="span"
				class="logo-text"
			/>
		</a>
	</div>
	<div class="header-right">
		<button class="logout-btn" on:click={logout} in:fly={{ x: 10, duration: 300 }}>
			Logout
		</button>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		margin: 1rem 1.5rem 1rem;
		position: relative;
		z-index: 10;
	}

	.header-left {
		display: flex;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
	}

	.logo :global(.logo-text) {
		font-size: 1.1rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logout-btn {
		padding: 0.4rem 0.9rem;
		border-radius: var(--glass-radius-xs);
		font-size: 0.8rem;
		color: var(--text-secondary);
		transition: all 0.25s var(--spring-ease);
	}

	.logout-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.08);
	}
</style>
```

**Step 6: Create redirect page at root**

`src/routes/(app)/+page.svelte`:

```svelte
<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	onMount(() => goto('/browse', { replaceState: true }));
</script>
```

**Step 7: Create browse page data loader**

`src/routes/(app)/browse/[...path]/+page.ts`:

```ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const path = params.path || '';
	const res = await fetch(`/api/files/${path}`);

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Unknown error' }));
		return { path: '/' + path, files: [], error: body.error || `Error ${res.status}` };
	}

	const data = await res.json();
	return { ...data, error: null };
};
```

**Step 8: Commit (browser page built in next task)**

```bash
git add src/routes/ src/lib/components/ src/lib/utils/
git commit -m "feat: add app layout, header, breadcrumbs, and file API loader"
```

---

### Task 7: File Browser Page

**Files:**
- Create: `src/routes/(app)/browse/[...path]/+page.svelte`
- Create: `src/lib/components/FileCard.svelte`
- Create: `src/lib/components/FileGrid.svelte`

**Step 1: Create FileCard component**

`src/lib/components/FileCard.svelte`:

```svelte
<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { getFileIcon, formatSize, formatDate } from '$lib/utils/format';
	import type { FileEntry } from '$lib/server/files';

	export let file: FileEntry;
	export let index: number = 0;
	export let onPreview: ((file: FileEntry) => void) | null = null;

	$: icon = getFileIcon(file.type);
	$: href = file.isDirectory ? `/browse${file.path}` : null;

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
		on:click={handleClick}
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
	<button class="download-btn" on:click={handleDownload} title={file.isDirectory ? 'Download as ZIP' : 'Download'}>
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
```

**Step 2: Create FileGrid component**

`src/lib/components/FileGrid.svelte`:

```svelte
<script lang="ts">
	import FileCard from './FileCard.svelte';
	import type { FileEntry } from '$lib/server/files';
	import { fly } from 'svelte/transition';

	export let files: FileEntry[] = [];
	export let onPreview: ((file: FileEntry) => void) | null = null;
</script>

{#if files.length === 0}
	<div class="empty" in:fly={{ y: 20, duration: 400 }}>
		<span class="empty-icon">📂</span>
		<p>This folder is empty</p>
	</div>
{:else}
	<div class="file-grid">
		{#each files as file, i (file.path)}
			<FileCard {file} index={i} {onPreview} />
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
```

**Step 3: Create browse page**

`src/routes/(app)/browse/[...path]/+page.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import FileGrid from '$lib/components/FileGrid.svelte';
	import { TextMorph } from 'torph/svelte';
	import { fly } from 'svelte/transition';
	import type { FileEntry } from '$lib/server/files';

	export let data;

	let previewFile: FileEntry | null = null;

	$: currentPath = data.path || '/';
	$: folderName = currentPath === '/' ? 'Home' : currentPath.split('/').filter(Boolean).pop() || 'Home';

	function openPreview(file: FileEntry) {
		previewFile = file;
	}

	function closePreview() {
		previewFile = null;
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

<!-- Preview Modal (basic for now, enhanced in Task 8) -->
{#if previewFile}
	<div
		class="preview-overlay"
		on:click={closePreview}
		on:keydown={(e) => e.key === 'Escape' && closePreview()}
		role="dialog"
		tabindex="-1"
		in:fly={{ duration: 200 }}
	>
		<div
			class="preview-card glass"
			on:click|stopPropagation
			in:scale={{ duration: 400, start: 0.95, easing: t => 1 - Math.pow(1 - t, 4) }}
		>
			<div class="preview-header">
				<TextMorph
					text={previewFile.name}
					duration={300}
					ease="cubic-bezier(0.19, 1, 0.22, 1)"
					as="h2"
				/>
				<button class="close-btn" on:click={closePreview}>✕</button>
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
						<span class="audio-icon">🎵</span>
						<audio controls src="/api/download{previewFile.path}?inline"></audio>
					</div>
				{:else if previewFile.type === 'pdf'}
					<iframe src="/api/download{previewFile.path}?inline" title={previewFile.name}></iframe>
				{:else if ['text', 'code'].includes(previewFile.type)}
					{#await fetch(`/api/download${previewFile.path}?inline`).then(r => r.text())}
						<div class="loading-preview">Loading...</div>
					{:then content}
						<pre class="code-preview"><code>{content}</code></pre>
					{:catch}
						<p class="preview-error">Failed to load preview</p>
					{/await}
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

<script>
	import { scale } from 'svelte/transition';
</script>

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

	.preview-error {
		text-align: center;
		padding: 2rem;
		color: rgba(255, 100, 100, 0.8);
	}
</style>
```

**Step 4: Verify the full flow**

```bash
npm run dev
# Login -> browse files -> click folders -> preview files -> download
```

**Step 5: Commit**

```bash
git add src/
git commit -m "feat: add file browser with grid view, preview modal, and zip download"
```

---

### Task 8: Loading Skeletons and Page Transitions

**Files:**
- Create: `src/lib/components/Skeleton.svelte`
- Modify: `src/routes/(app)/browse/[...path]/+page.svelte` (add loading state)

**Step 1: Create skeleton loading component**

`src/lib/components/Skeleton.svelte`:

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';

	export let count: number = 6;
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
```

**Step 2: Add SvelteKit page transition**

Add to `src/routes/(app)/+layout.svelte` — wrap `<slot />` with a keyed transition block using `$page.url.pathname`.

**Step 3: Commit**

```bash
git add src/lib/components/Skeleton.svelte src/routes/
git commit -m "feat: add skeleton loading and page transitions"
```

---

### Task 9: Final Polish and Deployment Config

**Files:**
- Create: `Dockerfile` (for easy NAS deployment)
- Create: `docker-compose.yml`
- Create: `README.md` with setup instructions

**Step 1: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
```

**Step 2: Create docker-compose.yml**

```yaml
services:
  fileserver:
    build: .
    ports:
      - "3000:3000"
    environment:
      - FILE_SERVER_PASSWORD=${FILE_SERVER_PASSWORD}
      - FILE_ROOT=/data
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    volumes:
      - /share/Public:/data:ro
    restart: unless-stopped

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${TUNNEL_TOKEN}
    restart: unless-stopped
    depends_on:
      - fileserver
```

**Step 3: Add Cloudflare tunnel setup instructions to README**

Include steps:
1. `cloudflared tunnel create nas-files`
2. `cloudflared tunnel route dns nas-files files.yourdomain.com`
3. Configure tunnel to point to `http://fileserver:3000`
4. Set TUNNEL_TOKEN in `.env`

**Step 4: Test production build locally**

```bash
npm run build
FILE_SERVER_PASSWORD=test FILE_ROOT=/home/kano/Projects JWT_SECRET=test node build
```

**Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml README.md
git commit -m "feat: add Docker deployment config and Cloudflare tunnel setup"
```

---

## Deployment to QNAP TS-251+

1. SSH into NAS
2. Clone repo or copy files
3. Create `.env` with `FILE_SERVER_PASSWORD`, `JWT_SECRET`, `TUNNEL_TOKEN`, `FILE_ROOT`
4. `docker compose up -d`
5. Access via Cloudflare tunnel URL

---

Plan complete and saved to `docs/plans/2026-02-24-nas-file-viewer.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
