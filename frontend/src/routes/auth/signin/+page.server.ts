import { fail, redirect, type Actions, type ServerLoad } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { ACCESS_COOKIE, forwardSetCookies, safeRedirectPath } from '$lib/auth/cookies';

export const load: ServerLoad = ({ cookies, url }) => {
	const token = cookies.get(ACCESS_COOKIE);
	if (token) {
		throw redirect(303, safeRedirectPath(url.searchParams.get('redirect')));
	}
	return { redirect: url.searchParams.get('redirect') ?? '' };
};

export const actions: Actions = {
	sendOtp: async ({ request, fetch }) => {
		const data = await request.formData();
		const identifier = String(data.get('identifier') ?? '').trim();
		const redirectTo = String(data.get('redirect') ?? '');
		if (!identifier) return fail(400, { message: 'Identifier required.', identifier, redirect: redirectTo });

		const { apiUrl } = resolveBackendConfig();
		const res = await fetch(`${apiUrl}/auth/send-otp`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ identifier })
		});
		const json = await res.json().catch(() => ({}));
		if (!res.ok || !json?.success) {
			return fail(res.status || 400, {
				message: json?.message ?? 'Failed to send OTP.',
				identifier,
				redirect: redirectTo
			});
		}
		return { sent: true, identifier, message: json.message, redirect: redirectTo };
	},

	verifyOtp: async ({ request, fetch, cookies }) => {
		const data = await request.formData();
		const identifier = String(data.get('identifier') ?? '').trim();
		const otp = String(data.get('otp') ?? '').trim();
		const redirectTo = String(data.get('redirect') ?? '');
		if (!identifier || !otp) {
			return fail(400, {
				message: 'Identifier and OTP required.',
				identifier,
				sent: true,
				redirect: redirectTo
			});
		}

		const { apiUrl } = resolveBackendConfig();
		const res = await fetch(`${apiUrl}/auth/verify-otp`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ identifier, otp })
		});
		const json = await res.json().catch(() => ({}));
		if (!res.ok || !json?.success) {
			return fail(res.status || 400, {
				message: json?.message ?? 'OTP verification failed.',
				error: json?.data ?? null,
				identifier,
				sent: true,
				redirect: redirectTo
			});
		}

		forwardSetCookies(res, cookies);
		throw redirect(303, safeRedirectPath(redirectTo));
	}
};
