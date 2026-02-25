import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword, createToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { password } = await request.json();

	if (!password || !(await verifyPassword(password))) {
		return json({ error: 'Invalid password' }, { status: 401 });
	}

	const token = createToken();
	cookies.set('auth_token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7
	});

	return json({ success: true });
};
