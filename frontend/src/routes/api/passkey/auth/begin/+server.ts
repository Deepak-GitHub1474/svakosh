import { json, type RequestHandler } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';

export const POST: RequestHandler = async ({ fetch }) => {
	const { apiUrl } = resolveBackendConfig();
	const res = await fetch(`${apiUrl}/auth/passkey/auth/begin`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: '{}'
	});
	const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
	return json(data, { status: res.status });
};
