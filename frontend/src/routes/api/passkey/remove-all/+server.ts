import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const POST: RequestHandler = (e) => forwardToBackend(e, '/auth/passkey/remove-all', 'POST');
