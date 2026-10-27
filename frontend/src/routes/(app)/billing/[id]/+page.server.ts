import type { ServerLoad } from '@sveltejs/kit';
import type { TSubscription } from '$lib/billing/types';
import { backendGet } from '$lib/server/backend-fetch';

export const load: ServerLoad = async ({ cookies, fetch, params }) => {
	const res = await backendGet<TSubscription>(
		cookies,
		fetch,
		`/billing/subscriptions/${encodeURIComponent(params.id ?? '')}`
	);
	return { subscription: res.ok ? res.data : null, error: res.ok ? '' : res.error };
};
