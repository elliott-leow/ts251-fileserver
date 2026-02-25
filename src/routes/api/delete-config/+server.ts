import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isDeleteProtected } from '$lib/server/auth';

export const GET: RequestHandler = async () => {
	return json({ requiresPassword: isDeleteProtected() });
};
