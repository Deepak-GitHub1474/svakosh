<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { connectSession } from '$lib/trade/service';

	onMount(async () => {
		const accountId = page.url.searchParams.get('state') ?? '';
		const params = Object.fromEntries(
			[...page.url.searchParams].filter(([key]) => key !== 'state')
		);
		history.replaceState(history.state, '', page.url.pathname);
		const res =
			accountId && Object.keys(params).length ? await connectSession(accountId, params) : null;
		if (res?.ok) {
			tradeAccounts.select(accountId);
			await tradeAccounts.load();
			toast.success({
				title: 'Broker logged in',
				description: res.data.account_tag || res.data.client_id
			});
			goto(resolve('/trade/positions'), { replaceState: true });
			return;
		}
		toast.error({
			title: 'Broker login failed',
			description: res?.error ?? 'The broker did not return a login session. Please try again.'
		});
		goto(resolve('/broker/accounts'), { replaceState: true });
	});
</script>

<div class="relative h-40"><SvaKoshLoader inline message="Completing broker login…" /></div>
