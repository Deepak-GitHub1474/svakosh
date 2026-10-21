import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (e) =>
	forwardToBackend(e, `/trade/orders${e.url.search}`, 'GET');
export const POST: RequestHandler = (e) => forwardToBackend(e, '/trade/orders', 'POST');
