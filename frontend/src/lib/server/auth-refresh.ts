import type { Cookies } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { ACCESS_COOKIE, CSRF_COOKIE, REFRESH_COOKIE, forwardSetCookies } from '$lib/auth/cookies';

type Fetch = typeof fetch;

const inFlight = new WeakMap<Cookies, Promise<boolean>>();

async function requestRefresh(cookies: Cookies, doFetch: Fetch): Promise<boolean> {
	const refresh = cookies.get(REFRESH_COOKIE);
	if (!refresh) return false;
	const csrf = cookies.get(CSRF_COOKIE) ?? '';
	const { apiUrl } = resolveBackendConfig();
	const res = await doFetch(`${apiUrl}/auth/refresh`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			cookie: `${REFRESH_COOKIE}=${refresh}; ${CSRF_COOKIE}=${csrf}`,
			'x-csrf-token': csrf
		}
	});
	if (!res.ok) return false;
	forwardSetCookies(res, cookies);
	return true;
}

export function tryRefreshTokens(cookies: Cookies, doFetch: Fetch): Promise<boolean> {
	const running = inFlight.get(cookies);
	if (running) return running;
	const attempt = requestRefresh(cookies, doFetch).finally(() => inFlight.delete(cookies));
	inFlight.set(cookies, attempt);
	return attempt;
}

export function accessCookieHeader(cookies: Cookies): string {
	return `${ACCESS_COOKIE}=${cookies.get(ACCESS_COOKIE) ?? ''}`;
}
