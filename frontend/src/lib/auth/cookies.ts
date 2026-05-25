import type { Cookies } from '@sveltejs/kit';

export const ACCESS_COOKIE = 'svakosh_access_token';
export const REFRESH_COOKIE = 'svakosh_refresh_token';
export const CSRF_COOKIE = 'svakosh_csrf';

type CookieAttrs = {
	maxAge?: number;
	path?: string;
	domain?: string;
	sameSite?: 'lax' | 'strict' | 'none';
	httpOnly?: boolean;
	secure?: boolean;
};

function parseSetCookie(header: string): { name: string; value: string; opts: CookieAttrs } | null {
	const parts = header.split(';');
	if (parts.length === 0) return null;
	const first = parts[0];
	const eq = first.indexOf('=');
	if (eq < 0) return null;
	const name = first.slice(0, eq).trim();
	const value = first.slice(eq + 1).trim();
	const opts: CookieAttrs = {};
	for (let i = 1; i < parts.length; i++) {
		const seg = parts[i].trim();
		const [rawKey, ...rest] = seg.split('=');
		const key = rawKey.toLowerCase();
		const v = rest.join('=').trim();
		if (key === 'max-age') opts.maxAge = Number(v);
		else if (key === 'path') opts.path = v;
		else if (key === 'domain') opts.domain = v;
		else if (key === 'samesite') opts.sameSite = v.toLowerCase() as CookieAttrs['sameSite'];
		else if (key === 'httponly') opts.httpOnly = true;
		else if (key === 'secure') opts.secure = true;
	}
	return { name, value, opts };
}

export function forwardSetCookies(response: Response, cookies: Cookies): void {
	const headers = response.headers as Headers & { getSetCookie?: () => string[] };
	const setCookies: string[] = headers.getSetCookie?.() ?? [];
	for (const raw of setCookies) {
		const parsed = parseSetCookie(raw);
		if (!parsed) continue;
		cookies.set(parsed.name, parsed.value, {
			path: parsed.opts.path ?? '/',
			maxAge: parsed.opts.maxAge,
			domain: parsed.opts.domain,
			sameSite: parsed.opts.sameSite ?? 'lax',
			httpOnly: parsed.opts.httpOnly ?? false,
			secure: parsed.opts.secure ?? false
		});
	}
}

export function safeRedirectPath(raw: string | null | undefined): string {
	if (!raw) return '/';
	if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
	if (raw.startsWith('/auth/')) return '/';
	return raw;
}

export function authForwardHeaders(cookies: Cookies): Record<string, string> {
	const access = cookies.get(ACCESS_COOKIE) ?? '';
	const csrf = cookies.get(CSRF_COOKIE) ?? '';
	return {
		'content-type': 'application/json',
		'x-csrf-token': csrf,
		cookie: `${ACCESS_COOKIE}=${access}; ${CSRF_COOKIE}=${csrf}`
	};
}

export function clearAllAuthCookies(cookies: Cookies): void {
	cookies.delete(ACCESS_COOKIE, { path: '/' });
	cookies.delete(REFRESH_COOKIE, { path: '/' });
	cookies.delete(CSRF_COOKIE, { path: '/' });
}
