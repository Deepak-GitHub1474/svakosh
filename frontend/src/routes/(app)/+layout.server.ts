import { redirect, type ServerLoad } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { ACCESS_COOKIE } from '$lib/auth/cookies';

export const load: ServerLoad = async ({ cookies, url, fetch }) => {
	const target = url.pathname + url.search;
	const token = cookies.get(ACCESS_COOKIE);
	if (!token) {
		throw redirect(303, `/auth/signin?redirect=${encodeURIComponent(target)}`);
	}

	const { apiUrl } = resolveBackendConfig();
	const res = await fetch(`${apiUrl}/auth/me`, {
		headers: { cookie: `${ACCESS_COOKIE}=${token}` }
	});
	if (res.status === 401) {
		throw redirect(303, `/auth/signin?redirect=${encodeURIComponent(target)}`);
	}
	const json = await res.json().catch(() => ({}));
	const user = json?.data ?? null;

	if (user && (!user.email_verified || !user.mobile_number_verified)) {
		throw redirect(303, `/auth/complete-signup?redirect=${encodeURIComponent(target)}`);
	}

	return { user };
};
