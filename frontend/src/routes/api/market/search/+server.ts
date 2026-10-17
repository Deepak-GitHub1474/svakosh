import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (event) => {
	const q = event.url.searchParams.get('q') ?? '';
	return forwardToBackend(event, `/market/search?q=${encodeURIComponent(q)}`, 'GET');
};
