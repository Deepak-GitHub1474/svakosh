import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const DELETE: RequestHandler = (e) =>
	forwardToBackend(e, `/auth/passkey/${e.params.credential_id}`, 'DELETE');
