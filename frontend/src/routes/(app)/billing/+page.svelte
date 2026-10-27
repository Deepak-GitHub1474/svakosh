<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import CardsViewIcon from '$lib/components/svg-provider/CardsViewIcon.svelte';
	import TableViewIcon from '$lib/components/svg-provider/TableViewIcon.svelte';
	import FilterList from '$lib/components/svg-provider/material/FilterList.svelte';
	import {
		DEFAULT_PLAN_FILTER,
		DEFAULT_STATUS_FILTER,
		HISTORY_VIEW_KEY,
		PLAN_FILTERS,
		STATUS_FILTERS
	} from '$lib/billing/const';
	import { cancelAutopay } from '$lib/billing/service';
	import type { THistoryView, TPlanFilter, TStatusFilter, TSubscription } from '$lib/billing/types';
	import { accountLabel, tradeAccounts } from '$lib/trade/accounts.svelte';
	import { recall, remember } from '$lib/trade/storage';
	import CancelAutopayDialog from './_components/CancelAutopayDialog.svelte';
	import FilterDialog from './_components/FilterDialog.svelte';
	import HistoryCard from './_components/HistoryCard.svelte';
	import HistoryTable from './_components/HistoryTable.svelte';

	let {
		data
	}: {
		data: {
			subscriptions: TSubscription[] | null;
			error: string;
			status: TStatusFilter;
			plan: TPlanFilter;
		};
	} = $props();

	const VIEWS = [
		{ value: 'table', label: 'Table view', icon: TableViewIcon },
		{ value: 'cards', label: 'Cards view', icon: CardsViewIcon }
	] as const;
	const ICON_BUTTON = 'inline-flex size-9 items-center justify-center rounded-lg transition-colors';
	const IDLE = 'bg-glass text-muted-foreground hover:text-foreground';

	let subs = $derived(data.subscriptions);
	let view = $state<THistoryView | null>(null);
	let isDesktop = $state(true);
	let filterOpen = $state(false);
	let pending = $state<TSubscription | null>(null);
	let busy = $state(false);

	const filtered = $derived(
		data.status !== DEFAULT_STATUS_FILTER || data.plan !== DEFAULT_PLAN_FILTER
	);
	const summary = $derived(
		[
			data.plan === 'all' ? 'All plans' : PLAN_FILTERS.find((f) => f.value === data.plan)?.label,
			STATUS_FILTERS.find((f) => f.value === data.status)?.label
		].join(' · ')
	);

	onMount(() => {
		if (!tradeAccounts.loaded) tradeAccounts.load();
		const mq = window.matchMedia('(min-width: 768px)');
		const sync = () => (isDesktop = mq.matches);
		sync();
		view = recall(HISTORY_VIEW_KEY, ['table', 'cards'] as const) ?? (isDesktop ? 'table' : 'cards');
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	function setView(next: THistoryView) {
		view = next;
		remember(HISTORY_VIEW_KEY, next);
	}

	function targetOf(sub: TSubscription) {
		if (!sub.broker_account_id) return '';
		const account = tradeAccounts.list.find((a) => a.id === sub.broker_account_id);
		return account ? accountLabel(account) : 'Broker account';
	}

	function applyFilter(status: TStatusFilter, plan: TPlanFilter) {
		const url = new URL(page.url);
		url.searchParams.set('status', status);
		url.searchParams.set('plan', plan);
		goto(url.href, { replaceState: true, noScroll: true, keepFocus: true });
	}

	async function cancel() {
		if (!pending) return;
		const id = pending.id;
		busy = true;
		const res = await cancelAutopay(id);
		busy = false;
		pending = null;
		if (!res.ok) {
			toast.error({ title: 'Could not cancel autopay', description: res.error });
			return;
		}
		subs = subs && subs.map((s) => (s.id === id ? { ...res.data, payments: s.payments } : s));
		toast.success({
			title: 'Autopay cancelled',
			description: 'Access continues until the end date.'
		});
		invalidateAll();
	}
</script>

<svelte:head>
	<title>Subscription | SvaKosh</title>
</svelte:head>

<div class="text-foreground flex flex-col gap-6 pt-2 md:-mb-4 md:h-[calc(100dvh-4.25rem)]">
	<header class="flex shrink-0 flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="text-primary mb-1 text-2xl tracking-tight">Subscriptions</h1>
			<p class="text-muted-foreground text-sm">{summary}</p>
		</div>
		<div class="flex w-full items-center gap-2 sm:w-auto">
			{#if view}
				{#each VIEWS as option (option.value)}
					<button
						type="button"
						aria-label={option.label}
						aria-pressed={view === option.value}
						onclick={() => setView(option.value)}
						class="{ICON_BUTTON} {view === option.value ? 'bg-primary/15 text-primary' : IDLE}"
					>
						<option.icon />
					</button>
				{/each}
			{/if}
			<button
				type="button"
				onclick={() => (filterOpen = true)}
				class="{ICON_BUTTON} {IDLE} relative"
				aria-label="Filter"
			>
				<FilterList class="text-lg" />
				{#if filtered}
					<span class="bg-primary absolute top-1.5 right-1.5 size-1.5 rounded-full"></span>
				{/if}
			</button>
			<SvaKoshButton
				variant="solid"
				label="See plans"
				href={resolve('/pricing')}
				class="ml-auto min-w-32 border-transparent sm:ml-0"
			/>
		</div>
	</header>

	{#if !subs}
		<EmptyState
			class="min-h-[50vh]"
			title="Subscriptions are not available right now"
			description={data.error || 'Please try again in a moment.'}
			actionLabel="Retry"
			onAction={() => invalidateAll()}
		/>
	{:else if !subs.length}
		<EmptyState
			class="min-h-[50vh]"
			title={filtered ? 'No subscriptions match this filter' : 'No active subscriptions'}
			description={filtered
				? 'Change the filter to see other subscriptions.'
				: 'Unlock premium analytics or trade from SvaKosh with a plan.'}
		>
			<SvaKoshButton
				variant="solid"
				label="See plans"
				href={resolve('/pricing')}
				class="min-w-32 border-transparent"
			/>
		</EmptyState>
	{:else if view === 'table'}
		<HistoryTable {subs} {targetOf} onCancel={(s) => (pending = s)} />
	{:else if view === 'cards'}
		<div
			class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] content-start gap-3 md:min-h-0 md:flex-1 md:overflow-y-auto lg:grid-cols-[repeat(auto-fill,24rem)]"
		>
			{#each subs as sub (sub.id)}
				<HistoryCard {sub} target={targetOf(sub)} onCancel={() => (pending = sub)} />
			{/each}
		</div>
	{/if}
</div>

<FilterDialog
	bind:isOpen={filterOpen}
	{isDesktop}
	status={data.status}
	plan={data.plan}
	onApply={applyFilter}
/>
<CancelAutopayDialog
	sub={pending}
	{busy}
	{isDesktop}
	onConfirm={cancel}
	onClose={() => (pending = null)}
/>
