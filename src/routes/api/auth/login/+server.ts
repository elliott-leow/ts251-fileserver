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
	cookies.set('auth_token', token, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7
	});

	return json({ success: true });
};
