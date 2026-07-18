import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { authForwardHeaders } from '$lib/auth/cookies';
import { tryRefreshTokens } from '$lib/server/auth-refresh';
import { backendGet } from '$lib/server/backend-fetch';

export const load: ServerLoad = async ({ cookies, fetch }) => {
	const res = await backendGet(cookies, fetch, '/profile');
	return { profile: res.ok ? res.data : null };
};

const FIELDS = ['full_name', 'gender', 'dob', 'occupation', 'pan_number'] as const;
const ADDRESS_FIELDS = ['city', 'state', 'pincode'] as const;

export const actions: Actions = {
	update: async ({ request, cookies, fetch }) => {
		const form = await request.formData();
		const payload: Record<string, unknown> = {};

		for (const key of FIELDS) {
			const v = form.get(key);
			if (v !== null && String(v).trim() !== '') payload[key] = String(v).trim();
		}

		const address: Record<string, string> = {};
		for (const key of ADDRESS_FIELDS) {
			const v = form.get(key);
			if (v !== null && String(v).trim() !== '') address[key] = String(v).trim();
		}
		if (Object.keys(address).length) payload.address = address;

		if (!Object.keys(payload).length) {
			return fail(400, { message: 'Nothing to update.' });
		}

		const { apiUrl } = resolveBackendConfig();
		const send = () =>
			fetch(`${apiUrl}/profile`, {
				method: 'PATCH',
				headers: authForwardHeaders(cookies),
				body: JSON.stringify(payload)
			});

		let res = await send();
		if (res.status === 401 && (await tryRefreshTokens(cookies, fetch))) {
			res = await send();
		}
		const json = await res.json().catch(() => ({}));
		if (!res.ok || !json?.success) {
			return fail(res.status || 400, { message: json?.message ?? 'Update failed.' });
		}
		return { success: true, profile: json.data };
	}
};
