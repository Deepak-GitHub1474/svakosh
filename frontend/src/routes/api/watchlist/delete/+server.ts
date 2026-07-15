import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/watchlist-proxy';

export const DELETE: RequestHandler = (e) => forwardToBackend(e, '/watchlist/delete', 'DELETE');
