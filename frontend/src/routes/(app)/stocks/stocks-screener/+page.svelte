<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import { changeOf, marketFeed } from '$lib/market/feed.svelte';
	import { getMarketOverview } from '$lib/market/service';
	import type { TStockItem } from '$lib/market/types';
	import { SCREENER_FIELDS } from './_lib/const';
	import { filterStocks, sortStocks } from './_lib/helper';
	import type { TSortConfig, TSortKey } from './_lib/types';

	import ScreenerHeader from './_components/ScreenerHeader.svelte';
	import ScreenerTable from './_components/ScreenerTable.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let search = $state('');
	let sortConfig = $state<TSortConfig>({ key: 'change_pct', direction: 'desc' });
	let items = $state<TStockItem[]>([]);
	let error = $state('');
	let unsubscribe: (() => void) | undefined;
	let active = true;

	const filteredStocks = $derived(sortStocks(filterStocks(items, search), marketFeed.quotes, sortConfig));

	const stats = $derived.by(() => {
		let gainers = 0;
		let losers = 0;
		for (const item of filteredStocks) {
			const { change } = changeOf(marketFeed.quotes[item.sk_token]);
			if (change > 0) gainers++;
			else if (change < 0) losers++;
		}
		return { total: filteredStocks.length, gainers, losers };
	});

	function handleSort(key: TSortKey) {
		if (sortConfig.key === key) {
			sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
		} else {
			sortConfig.key = key;
			sortConfig.direction = 'desc';
		}
	}

	onMount(async () => {
		const res = await getMarketOverview();
		if (!active) return;
		if (!res.ok) {
			error = res.error;
			return;
		}
		items = res.data.stocks;
		unsubscribe = marketFeed.subscribe(
			items.map((item) => item.sk_token),
			SCREENER_FIELDS
		);
	});

	onDestroy(() => {
		active = false;
		unsubscribe?.();
	});
</script>

<div class="min-h-screen bg-background text-foreground">
	<ScreenerHeader {stats} />

	<div class="mb-6">
		<div class="w-full lg:w-96">
			<SvaKoshInput
				id="search"
				bind:value={search}
				placeholder="Search Stocks by Symbol or Name..."
				class="w-full py-[0.8rem]"
				clearable={true}
			/>
		</div>
	</div>

	{#if error}
		<EmptyState title="Market data unavailable" description={error} />
	{:else}
		<div in:fade={{ delay: 200 }}>
			<ScreenerTable stocks={filteredStocks} {sortConfig} onSort={handleSort} />
		</div>
	{/if}
</div>
