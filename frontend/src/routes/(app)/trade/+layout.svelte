<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { BRAND } from '$lib/brand';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import { accountLabel, tradeAccounts } from '$lib/trade/accounts.svelte';
	import { TRADE_TABS, type TTradeRoute, EMPTY_STATE } from '$lib/trade/const';

	let { children }: { children: Snippet } = $props();

	let isSelectorOpen = $state(false);
	let loggingIn = $state(false);

	const active = $derived<TTradeRoute>(
		TRADE_TABS.find((t) => page.url.pathname.startsWith(t.value))?.value ?? TRADE_TABS[0].value
	);
	const accountOptions = $derived(
		tradeAccounts.list.map((a) => ({ label: accountLabel(a), value: a.id }))
	);
	const needsLogin = $derived(!!tradeAccounts.selected && !tradeAccounts.selected.logged_in);

	async function login() {
		if (!tradeAccounts.selected) return;
		loggingIn = true;
		const error = await tradeAccounts.login(tradeAccounts.selected.id);
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

<div class="text-foreground py-2">
	<header class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="text-primary mb-1 text-2xl tracking-tight">Trade</h1>
			<p class="text-muted-foreground text-sm">
				Positions, holdings, orders and funds from your broker
			</p>
		</div>
		{#if accountOptions.length}
			<SvaKoshSelector
				class="w-60"
				placement="bottom"
				options={accountOptions}
				value={tradeAccounts.accountId}
				bind:isOpen={isSelectorOpen}
				onSelect={(id: string) => tradeAccounts.select(id)}
			/>
		{/if}
	</header>

	<div class="mb-5 overflow-x-auto">
		<SvaKoshTabs
			tabs={TRADE_TABS}
			activeTab={active}
			onTabChange={(href: TTradeRoute) => goto(resolve(href))}
			class="border-primary/20 bg-primary-subtle w-fit"
		/>
	</div>

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
		{@render children()}
	{/if}
</div>
