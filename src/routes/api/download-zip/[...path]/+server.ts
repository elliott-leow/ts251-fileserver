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
