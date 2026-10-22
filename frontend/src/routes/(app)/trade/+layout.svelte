<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { BRAND } from '$lib/brand';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { TRADE_TABS, type TTradeRoute, EMPTY_STATE } from '$lib/trade/const';

	let { children }: { children: Snippet } = $props();

	let loggingIn = $state(false);

	const active = $derived<TTradeRoute>(
		TRADE_TABS.find((t) => page.url.pathname.startsWith(t.value))?.value ?? TRADE_TABS[0].value
	);
	const loggedOut = $derived(tradeAccounts.list.filter((a) => !a.logged_in));
	const needsLogin = $derived(
		!!tradeAccounts.list.length && loggedOut.length === tradeAccounts.list.length
	);

	async function login() {
		if (!loggedOut.length) return;
		loggingIn = true;
		const error = await tradeAccounts.login(loggedOut[0].id);
		if (error) loggingIn = false;
	}

	const title = $derived(TRADE_TABS.find((t) => t.value === active)?.label ?? 'Trade');

	onMount(() => {
		tradeAccounts.load();
	});
</script>

<svelte:head>
	<title>{title} | {BRAND.name}</title>
</svelte:head>

<div class="text-foreground -mb-4 flex h-[calc(100dvh-4.25rem)] flex-col pt-2">
	<header class="mb-5 flex shrink-0 flex-wrap items-center justify-between gap-3">
		<div class="overflow-x-auto">
			<SvaKoshTabs
				tabs={TRADE_TABS}
				activeTab={active}
				onTabChange={(href: TTradeRoute) => goto(resolve(href))}
				class="border-primary/20 bg-primary-subtle w-fit"
			/>
		</div>
		{#if loggedOut.length && !needsLogin}
			<p class="text-muted-foreground text-xs">
				{loggedOut.map((a) => a.account_tag || a.client_id).join(', ')} not logged in today.
				<button
					type="button"
					class="text-primary ml-1 hover:underline"
					disabled={loggingIn}
					onclick={login}>{loggingIn ? 'Opening…' : 'Log in'}</button
				>
			</p>
		{/if}
	</header>

	{#if !tradeAccounts.loaded}
		<div class="relative h-40"><SvaKoshLoader inline message="" /></div>
	{:else if tradeAccounts.error}
		<EmptyState
			class={EMPTY_STATE}
			title="Trading is not available right now"
			description={tradeAccounts.error}
			actionLabel="Retry"
			onAction={() => tradeAccounts.load()}
		/>
	{:else if !tradeAccounts.list.length}
		<EmptyState
			class={EMPTY_STATE}
			title="No broker account linked"
			description="Link your broker account to see positions, holdings, orders and funds."
			actionLabel="Link account"
			onAction={() => goto(resolve('/broker/accounts'))}
		/>
	{:else if needsLogin}
		<EmptyState
			class={EMPTY_STATE}
			title="Log in to your broker"
			description="Your broker session ends every day. Log in on your broker's page to see positions, holdings, orders and funds."
			actionLabel={loggingIn ? 'Opening…' : 'Log in'}
			onAction={login}
		/>
	{:else}
		<div class="flex min-h-0 flex-1 flex-col">{@render children()}</div>
	{/if}
</div>
