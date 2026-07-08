import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/watchlist-proxy';

export const POST: RequestHandler = (e) => forwardToBackend(e, '/watchlist/add-symbol', 'POST');
