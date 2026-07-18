import { json, type RequestEvent } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { ACCESS_COOKIE, CSRF_COOKIE } from '$lib/auth/cookies';
import { accessCookieHeader, tryRefreshTokens } from './auth-refresh';

export async function forwardToBackend(
	event: RequestEvent,
	backendPath: string,
	method: string
) {
	if (!event.cookies.get(ACCESS_COOKIE) && !(await tryRefreshTokens(event.cookies, event.fetch))) {
		return json({ success: false, message: 'Not signed in.' }, { status: 401 });
	}

	const { apiUrl } = resolveBackendConfig();
	const body = await event.request.text();
	const url = `${apiUrl}${backendPath}`;

	const send = () => {
		const csrf = event.cookies.get(CSRF_COOKIE) ?? '';
		return event.fetch(url, {
			method,
			headers: {
				'content-type': 'application/json',
				'x-csrf-token': csrf,
				cookie: `${accessCookieHeader(event.cookies)}; ${CSRF_COOKIE}=${csrf}`
			},
			body: body || undefined
		});
	};

	let res = await send();
	if (res.status === 401 && (await tryRefreshTokens(event.cookies, event.fetch))) {
		res = await send();
	}

	const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
	return json(data, { status: res.status });
}
