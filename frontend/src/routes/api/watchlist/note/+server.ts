import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/watchlist-proxy';

export const POST: RequestHandler = (e) => forwardToBackend(e, '/watchlist/note', 'POST');
export const DELETE: RequestHandler = (e) => forwardToBackend(e, '/watchlist/note', 'DELETE');
