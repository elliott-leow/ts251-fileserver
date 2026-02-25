import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safePath } from '$lib/server/files';
import { writeFile } from 'fs/promises';
import { join, basename } from 'path';

export const POST: RequestHandler = async ({ params, request }) => {
	const requestedPath = params.path || '';
	const dirPath = safePath(requestedPath);

	if (!dirPath) throw error(403, 'Access denied');

	const formData = await request.formData();
	const files = formData.getAll('files') as File[];

	if (files.length === 0) {
		throw error(400, 'No files provided');
	}

	const uploaded: string[] = [];

	for (const file of files) {
		const name = basename(file.name);
		if (!name || name.startsWith('.')) continue;

		const dest = join(dirPath, name);
		// Verify the destination is still within the safe root
		const safeDest = safePath(requestedPath + '/' + name);
		if (!safeDest) continue;

		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(dest, buffer);
		uploaded.push(name);
	}

	return json({ uploaded, count: uploaded.length });
};
