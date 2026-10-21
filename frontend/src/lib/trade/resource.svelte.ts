import { untrack } from 'svelte';
import type { TResult } from '$lib/api';
import { tradeAccounts } from './accounts.svelte';
import { REFRESH_MS } from './const';

export function tradeResource<T>(
	fetch: (accountId: string) => Promise<TResult<T>>,
	empty: T,
	refreshMs = REFRESH_MS
) {
	let data = $state(empty);
	let loading = $state(true);
	let error = $state('');
	let request = 0;

	async function load() {
		const id = ++request;
		const res = await fetch(tradeAccounts.accountId);
		if (id !== request) return;
		loading = false;
		if (!res.ok) {
			error = res.error;
			if (res.status === 409) tradeAccounts.load();
			return;
		}
		error = '';
		data = res.data;
	}

	$effect(() => {
		const accountId = tradeAccounts.accountId;
		if (!accountId) return;
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
