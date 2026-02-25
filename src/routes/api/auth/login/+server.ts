import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword, createToken } from '$lib/server/auth';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { password } = await request.json();

	if (!password || !(await verifyPassword(password))) {
		return json({ error: 'Invalid password' }, { status: 401 });
	}

	const token = createToken();
	// secure: only over HTTPS (Cloudflare tunnel), not plain HTTP (local network)
	const isHttps = request.headers.get('x-forwarded-proto') === 'https'
		|| request.url.startsWith('https');

	cookies.set('auth_token', token, {
		path: '/',
		httpOnly: true,
		secure: isHttps,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7
	});

	return json({ success: true });
};
