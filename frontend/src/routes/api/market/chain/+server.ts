import type { RequestHandler } from '@sveltejs/kit';
import { forwardToBackend } from '$lib/server/backend-proxy';

export const GET: RequestHandler = (event) => {
	const exchange = event.url.searchParams.get('exchange') ?? '';
	const underlying = event.url.searchParams.get('underlying') ?? '';
	return forwardToBackend(
		event,
		`/market/chain?exchange=${encodeURIComponent(exchange)}&underlying=${encodeURIComponent(underlying)}`,
		'GET'
	);
};
