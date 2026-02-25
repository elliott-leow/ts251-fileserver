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
