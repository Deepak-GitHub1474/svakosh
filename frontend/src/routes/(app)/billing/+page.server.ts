import type { ServerLoad } from '@sveltejs/kit';
import { DEFAULT_PLAN_FILTER, DEFAULT_STATUS_FILTER } from '$lib/billing/const';
import type { THistory } from '$lib/billing/types';
import { backendGet } from '$lib/server/backend-fetch';

export const load: ServerLoad = async ({ cookies, fetch, url }) => {
	const status = url.searchParams.get('status') ?? DEFAULT_STATUS_FILTER;
	const plan = url.searchParams.get('plan') ?? DEFAULT_PLAN_FILTER;
	const query = new URLSearchParams({ status, plan });
	const res = await backendGet<THistory>(cookies, fetch, `/billing/subscriptions?${query}`);
	return {
		subscriptions: res.ok ? res.data.subscriptions : null,
		error: res.ok ? '' : res.error,
		status,
		plan
	};
};
