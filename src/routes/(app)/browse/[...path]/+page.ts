import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const path = params.path || '';
	const res = await fetch(`/api/files/${path}`);

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: 'Unknown error' }));
		return { path: '/' + path, files: [], error: body.error || `Error ${res.status}` };
	}

	const data = await res.json();
	return { ...data, error: null };
};
