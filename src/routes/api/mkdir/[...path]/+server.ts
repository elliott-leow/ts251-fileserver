import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safePath } from '$lib/server/files';
import { mkdir } from 'fs/promises';

export const POST: RequestHandler = async ({ params, request }) => {
	const requestedPath = params.path || '';
	const dirPath = safePath(requestedPath);

	if (!dirPath) throw error(403, 'Access denied');

	const { name } = await request.json();
	if (!name || name.includes('/') || name.includes('\\') || name.startsWith('.')) {
		throw error(400, 'Invalid folder name');
	}

	const fullPath = safePath(requestedPath + '/' + name);
	if (!fullPath) throw error(403, 'Access denied');

	try {
		await mkdir(fullPath);
		return json({ success: true, name });
	} catch (e: any) {
		if (e.code === 'EEXIST') throw error(409, 'Folder already exists');
		throw error(500, 'Failed to create folder');
	}
};
