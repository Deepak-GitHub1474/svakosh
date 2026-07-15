import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/watchlist-proxy';

export const PUT: RequestHandler = (e) => forwardToBackend(e, '/watchlist/rename', 'PUT');
