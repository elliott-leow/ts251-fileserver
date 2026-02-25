import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			// Workaround for torph packaging bug: svelte entry imports from
			// ../lib/text-morph which doesn't exist in the dist
			'torph/dist/lib/text-morph': path.resolve(
				'node_modules/torph/dist/chunk-5MHVW5FX.mjs'
			)
		}
	}
});
