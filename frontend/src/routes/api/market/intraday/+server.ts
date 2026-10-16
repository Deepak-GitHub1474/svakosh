import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (event) => {
	const token = event.url.searchParams.get('token') ?? '';
	return forwardToBackend(event, `/market/intraday?token=${encodeURIComponent(token)}`, 'GET');
};
