import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const DELETE: RequestHandler = (e) =>
	forwardToBackend(e, '/watchlist/remove-symbol', 'DELETE');
