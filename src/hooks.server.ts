import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
		return resolve(event);
	}

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
