import { untrack } from 'svelte';
import type { TResult } from '$lib/api';
import { tradeAccounts } from './accounts.svelte';
import { LIVE_RELOAD_MS, REFRESH_MS } from './const';
import { orderUpdates } from './live.svelte';
import type { TBrokerAccount } from './types';

export type TAccountRow<T> = T & { account: TBrokerAccount };

export function tradeResource<T>(
	fetch: (accountId: string) => Promise<TResult<T[]>>,
	refreshMs = REFRESH_MS
) {
	let data = $state<TAccountRow<T>[]>([]);
	let loading = $state(true);
	let error = $state('');
	let request = 0;

	const accounts = $derived(tradeAccounts.list.filter((a) => a.logged_in));
	const key = $derived(accounts.map((a) => a.id).join(','));

	async function load() {
		const id = ++request;
		const list = accounts;
		const results = await Promise.all(list.map((a) => fetch(a.id)));
		if (id !== request) return;
		loading = false;
		const rows: TAccountRow<T>[] = [];
		const errors: string[] = [];
		let expired = false;
		results.forEach((res, i) => {
			if (res.ok) {
				rows.push(...res.data.map((row) => ({ ...row, account: list[i] })));
				return;
			}
			errors.push(res.error);
			if (res.status === 409) expired = true;
		});
		if (expired) tradeAccounts.load();
		error = errors[0] ?? '';
		if (errors.length < list.length) data = rows;
	}

	$effect(() => {
		if (!key) {
			data = [];
			loading = false;
			return;
		}
		loading = true;
		untrack(load);
		if (!refreshMs) return;
		const timer = setInterval(() => {
			if (!document.hidden) load();
		}, refreshMs);
		return () => {
			clearInterval(timer);
			request++;
		};
	});

	let seen = orderUpdates.version;

	$effect(() => {
		const version = orderUpdates.version;
		if (version === seen) return;
		seen = version;
		const timer = setTimeout(() => untrack(load), LIVE_RELOAD_MS);
		return () => clearTimeout(timer);
	});

	return {
		get data() {
			return data;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		reload: load
	};
}
