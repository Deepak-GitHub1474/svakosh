import { redirect, type Cookies, type ServerLoad } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { ACCESS_COOKIE } from '$lib/auth/cookies';
import { accessCookieHeader, tryRefreshTokens } from '$lib/server/auth-refresh';
import type { TWatchlistItem } from '$lib/components/watchlist/types';

function authHeader(cookies: Cookies): Record<string, string> {
	return { cookie: accessCookieHeader(cookies) };
}

export const load: ServerLoad = async ({ cookies, url, fetch }) => {
	const target = url.pathname + url.search;
	const signinUrl = `/auth/signin?redirect=${encodeURIComponent(target)}`;
	const { apiUrl } = resolveBackendConfig();

	if (!cookies.get(ACCESS_COOKIE) && !(await tryRefreshTokens(cookies, fetch))) {
		throw redirect(303, signinUrl);
	}

	let [meRes, wlRes] = await Promise.all([
		fetch(`${apiUrl}/auth/me`, { headers: authHeader(cookies) }),
		fetch(`${apiUrl}/watchlist`, { headers: authHeader(cookies) })
	]);

	if (meRes.status === 401 && (await tryRefreshTokens(cookies, fetch))) {
		[meRes, wlRes] = await Promise.all([
			fetch(`${apiUrl}/auth/me`, { headers: authHeader(cookies) }),
			fetch(`${apiUrl}/watchlist`, { headers: authHeader(cookies) })
		]);
	}

	if (meRes.status === 401) {
		throw redirect(303, signinUrl);
	}

	const [meJson, wlJson] = await Promise.all([
		meRes.json().catch(() => ({})),
		wlRes.json().catch(() => ({}))
	]);

	const user = meJson?.data ?? null;
	if (user && (!user.email_verified || !user.mobile_number_verified)) {
		throw redirect(303, `/auth/complete-signup?redirect=${encodeURIComponent(target)}`);
	}

	const watchlists: TWatchlistItem[] = Array.isArray(wlJson?.data) ? wlJson.data : [];

	return { user, watchlists };
};
