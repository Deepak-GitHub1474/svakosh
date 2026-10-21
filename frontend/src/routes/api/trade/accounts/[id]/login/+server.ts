import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (e) =>
	forwardToBackend(e, `/trade/accounts/${encodeURIComponent(e.params.id ?? '')}/login`, 'GET');
