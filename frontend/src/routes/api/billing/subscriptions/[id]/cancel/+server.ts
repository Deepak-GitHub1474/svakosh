import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const POST: RequestHandler = (e) =>
	forwardToBackend(
		e,
		`/billing/subscriptions/${encodeURIComponent(e.params.id ?? '')}/cancel`,
		'POST'
	);
