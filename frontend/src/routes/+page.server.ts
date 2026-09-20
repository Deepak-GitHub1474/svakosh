import { redirect, type ServerLoad } from '@sveltejs/kit';
import { ACCESS_COOKIE } from '$lib/auth/cookies';
import { tryRefreshTokens } from '$lib/server/auth-refresh';

export const load: ServerLoad = async ({ cookies, fetch }) => {
	if (cookies.get(ACCESS_COOKIE) || (await tryRefreshTokens(cookies, fetch))) {
		throw redirect(303, '/dashboard');
	}
	return {};
};
