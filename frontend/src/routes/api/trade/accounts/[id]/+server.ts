import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

const path = (id: string | undefined) => `/trade/accounts/${encodeURIComponent(id ?? '')}`;

export const PATCH: RequestHandler = (e) => forwardToBackend(e, path(e.params.id), 'PATCH');
export const DELETE: RequestHandler = (e) => forwardToBackend(e, path(e.params.id), 'DELETE');
