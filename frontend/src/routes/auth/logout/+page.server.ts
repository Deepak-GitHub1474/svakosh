import { redirect, type Actions } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { authForwardHeaders, clearAllAuthCookies } from '$lib/auth/cookies';

export const actions: Actions = {
	default: async ({ cookies, fetch }) => {
		const { apiUrl } = resolveBackendConfig();
		try {
			await fetch(`${apiUrl}/auth/logout`, {
				method: 'POST',
				headers: authForwardHeaders(cookies)
			});
		} catch {}
		clearAllAuthCookies(cookies);
		throw redirect(303, '/auth/signin');
	}
};
