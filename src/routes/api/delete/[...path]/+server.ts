import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safePath } from '$lib/server/files';
import { rm, stat } from 'fs/promises';

export const DELETE: RequestHandler = async ({ params }) => {
	const requestedPath = params.path || '';
	if (!requestedPath) throw error(400, 'Cannot delete root');

	const fullPath = safePath(requestedPath);
	if (!fullPath) throw error(403, 'Access denied');

	try {
		const info = await stat(fullPath);
		await rm(fullPath, { recursive: info.isDirectory() });
		return json({ success: true });
	} catch (e: any) {
		if (e.code === 'ENOENT') throw error(404, 'Not found');
		throw error(500, 'Failed to delete');
	}
};
