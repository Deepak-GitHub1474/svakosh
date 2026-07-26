import type { ServerLoad } from '@sveltejs/kit';
import { backendGet } from '$lib/server/backend-fetch';

export const load: ServerLoad = async ({ cookies, fetch }) => {
	const res = await backendGet(cookies, fetch, '/auth/passkey/list');
	return { passkeys: res.ok && Array.isArray(res.data) ? res.data : [] };
};
