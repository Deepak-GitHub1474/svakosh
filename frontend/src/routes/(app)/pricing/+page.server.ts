import type { ServerLoad } from '@sveltejs/kit';
import type { TPlan } from '$lib/billing/types';
import { backendGet } from '$lib/server/backend-fetch';

export const load: ServerLoad = async ({ cookies, fetch }) => {
	const res = await backendGet<TPlan[]>(cookies, fetch, '/billing/plans');
	return { plans: res.ok ? res.data : [], plansError: res.ok ? '' : res.error };
};
