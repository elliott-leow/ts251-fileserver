import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safePath } from '$lib/server/files';
import { verifyDeletePassword, isDeleteProtected } from '$lib/server/auth';
import { rm, stat } from 'fs/promises';

export const DELETE: RequestHandler = async ({ params, request }) => {
	const requestedPath = params.path || '';
	if (!requestedPath) throw error(400, 'Cannot delete root');

	// If delete password is configured, require it
	if (isDeleteProtected()) {
		const body = await request.json().catch(() => ({}));
		const { deletePassword } = body as { deletePassword?: string };

		if (!deletePassword || !(await verifyDeletePassword(deletePassword))) {
			return json({ error: 'Invalid delete password', requiresPassword: true }, { status: 403 });
		}
	}

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
