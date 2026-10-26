import type { ServerLoad } from '@sveltejs/kit';
import type { TOverview } from '$lib/billing/types';
import { backendGet } from '$lib/server/backend-fetch';

export const load: ServerLoad = async ({ cookies, fetch }) => {
	const res = await backendGet<TOverview>(cookies, fetch, '/billing/subscriptions');
	return { overview: res.ok ? res.data : null, error: res.ok ? '' : res.error };
};
