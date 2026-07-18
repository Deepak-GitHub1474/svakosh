import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const PUT: RequestHandler = (e) => forwardToBackend(e, '/watchlist/rename', 'PUT');
