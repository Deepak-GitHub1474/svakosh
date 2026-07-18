import { fail, redirect, type Actions, type ServerLoad } from '@sveltejs/kit';
import { resolveBackendConfig } from '$lib/config';
import { authForwardHeaders, forwardSetCookies, safeRedirectPath } from '$lib/auth/cookies';
import { backendGet } from '$lib/server/backend-fetch';

export const load: ServerLoad = async ({ cookies, fetch, url }) => {
	const res = await backendGet<{ email_verified?: boolean; mobile_number_verified?: boolean }>(
		cookies,
		fetch,
		'/auth/me'
	);
	if (!res.ok || !res.data) {
		throw redirect(303, '/auth/signin');
	}
	const user = res.data;
	const redirectTo = safeRedirectPath(url.searchParams.get('redirect'));
	if (user.email_verified && user.mobile_number_verified) {
		throw redirect(303, redirectTo);
	}
	const pendingChannel: 'email' | 'mobile' = user.email_verified ? 'mobile' : 'email';
	return { pendingChannel, user, redirect: url.searchParams.get('redirect') ?? '' };
};

export const actions: Actions = {
	sendOtp: async ({ request, fetch, cookies }) => {
		const data = await request.formData();
		const identifier = String(data.get('identifier') ?? '').trim();
		const redirectTo = String(data.get('redirect') ?? '');
		if (!identifier) return fail(400, { message: 'Identifier required.', identifier, redirect: redirectTo });

		const { apiUrl } = resolveBackendConfig();
		const res = await fetch(`${apiUrl}/auth/add-channel/send-otp`, {
			method: 'POST',
			headers: authForwardHeaders(cookies),
			body: JSON.stringify({ identifier })
		});
		const json = await res.json().catch(() => ({}));
		if (!res.ok || !json?.success) {
			return fail(res.status || 400, {
				message: json?.message ?? 'Failed to send OTP.',
				error: json?.data ?? null,
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
			return fail(400, { message: 'Identifier and OTP required.', identifier, sent: true, redirect: redirectTo });
		}

		const { apiUrl } = resolveBackendConfig();
		const res = await fetch(`${apiUrl}/auth/add-channel/verify`, {
			method: 'POST',
			headers: authForwardHeaders(cookies),
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
