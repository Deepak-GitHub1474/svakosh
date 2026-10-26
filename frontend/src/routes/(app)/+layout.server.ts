import { redirect, type Cookies, type ServerLoad } from '@sveltejs/kit';
import { isMobileAuthEnabled, resolveBackendConfig } from '$lib/config';
import { ACCESS_COOKIE, clearAllAuthCookies } from '$lib/auth/cookies';
import { accessCookieHeader, tryRefreshTokens } from '$lib/server/auth-refresh';
import type { TEntitlements } from '$lib/billing/types';
import type { TWatchlistItem } from '$lib/components/watchlist/types';

function authHeader(cookies: Cookies): Record<string, string> {
	return { cookie: accessCookieHeader(cookies) };
}

export const load: ServerLoad = async ({ cookies, url, fetch, untrack }) => {
	const target = untrack(() => url.pathname + url.search);
	const signinUrl = `/auth/signin?redirect=${encodeURIComponent(target)}`;
	const { apiUrl } = resolveBackendConfig();

	if (!cookies.get(ACCESS_COOKIE) && !(await tryRefreshTokens(cookies, fetch))) {
		throw redirect(303, signinUrl);
	}

	const loadAll = () =>
		Promise.all([
			fetch(`${apiUrl}/auth/me`, { headers: authHeader(cookies) }),
			fetch(`${apiUrl}/watchlist`, { headers: authHeader(cookies) }),
			fetch(`${apiUrl}/billing/entitlements`, { headers: authHeader(cookies) })
		]);

	let [meRes, wlRes, entRes] = await loadAll();

	if (meRes.status === 401 && (await tryRefreshTokens(cookies, fetch))) {
		[meRes, wlRes, entRes] = await loadAll();
	}

	if (meRes.status === 401) {
		clearAllAuthCookies(cookies);
		throw redirect(303, signinUrl);
	}

	const [meJson, wlJson, entJson] = await Promise.all([
		meRes.json().catch(() => ({})),
		wlRes.json().catch(() => ({})),
		entRes.json().catch(() => ({}))
	]);

	const user = meJson?.data ?? null;
	if (user && (!user.email_verified || (isMobileAuthEnabled() && !user.mobile_number_verified))) {
		throw redirect(303, `/auth/complete-signup?redirect=${encodeURIComponent(target)}`);
	}

	const watchlists: TWatchlistItem[] = Array.isArray(wlJson?.data) ? wlJson.data : [];
	const entitlements: TEntitlements = entJson?.success
		? entJson.data
		: { features: [], broker_accounts: [] };

	return { user, watchlists, entitlements };
};
