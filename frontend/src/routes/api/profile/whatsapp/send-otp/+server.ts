import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const POST: RequestHandler = (event) =>
	forwardToBackend(event, '/profile/whatsapp/send-otp', 'POST');
