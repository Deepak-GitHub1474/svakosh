import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (event) => {
	const tokens = event.url.searchParams.get('tokens') ?? '';
	return forwardToBackend(event, `/market/instruments?tokens=${encodeURIComponent(tokens)}`, 'GET');
};
