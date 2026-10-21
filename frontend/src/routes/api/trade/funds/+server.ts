import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (e) => forwardToBackend(e, `/trade/funds${e.url.search}`, 'GET');
