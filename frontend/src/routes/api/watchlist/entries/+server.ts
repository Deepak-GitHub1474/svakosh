import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (event) => {
	const name = event.url.searchParams.get('name') ?? '';
	return forwardToBackend(event, `/watchlist/entries?name=${encodeURIComponent(name)}`, 'GET');
};
