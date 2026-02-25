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
