import type { Cookies } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import type { TResult } from '$lib/api';
import { accessCookieHeader, tryRefreshTokens } from './auth-refresh';

type Fetch = typeof fetch;

export async function backendGet<T = unknown>(
	cookies: Cookies,
	doFetch: Fetch,
	path: string
): Promise<TResult<T>> {
	const { apiUrl } = resolveBackendConfig();
	const send = () =>
		doFetch(`${apiUrl}${path}`, { headers: { cookie: accessCookieHeader(cookies) } });

	let res = await send();
	if (res.status === 401 && (await tryRefreshTokens(cookies, doFetch))) {
		res = await send();
	}

	const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
	if (!res.ok || !json?.success) {
		const detail = json?.data as Record<string, unknown> | null | undefined;
		return {
			ok: false,
			error:
				(detail?.message as string | undefined) ??
				(json?.message as string | undefined) ??
				'Request failed.',
			status: res.status
		};
	}
	return { ok: true, data: json.data as T };
}
