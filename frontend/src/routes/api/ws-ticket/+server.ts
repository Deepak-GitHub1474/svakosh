import { json, type RequestHandler } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { ACCESS_COOKIE, authForwardHeaders } from '$lib/auth/cookies';

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	if (!cookies.get(ACCESS_COOKIE)) {
		return json({ ticket: null }, { status: 401 });
	}

	const { apiUrl } = resolveBackendConfig();

	try {
		const response = await fetch(`${apiUrl}/auth/ws-ticket`, {
			method: 'POST',
			headers: authForwardHeaders(cookies)
		});

		if (!response.ok) return json({ ticket: null }, { status: response.status });

		const payload = (await response.json()) as { data?: { ticket?: string } };
		return json({ ticket: payload?.data?.ticket ?? null });
	} catch {
		return json({ ticket: null }, { status: 502 });
	}
};
