import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

const path = (e: Parameters<RequestHandler>[0]) =>
	`/trade/orders/${encodeURIComponent(e.params.id ?? '')}${e.url.search}`;

export const PATCH: RequestHandler = (e) => forwardToBackend(e, path(e), 'PATCH');
export const DELETE: RequestHandler = (e) => forwardToBackend(e, path(e), 'DELETE');
