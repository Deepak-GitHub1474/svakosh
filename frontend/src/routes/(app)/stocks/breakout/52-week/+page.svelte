<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import { filter52WeekBreakouts, sort52WeekBreakouts } from './_lib/helper';
	import type { TBreakoutFilters, TSortConfig, TSortKey, T52WeekBreakout } from './_lib/types';
	import { changeOf, marketFeed, type TQuoteField } from '$lib/market/feed.svelte';
	import { getMarketOverview } from '$lib/market/service';
	import { istTime } from '$lib/market/time';
	import type { TStockItem } from '$lib/market/types';
	import Header from './_components/Header.svelte';
	import Table from './_components/Table.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';

	const FIELDS: TQuoteField[] = ['ltp', 'prev_close', 'high', 'low', 'high_52w', 'low_52w'];

	let search = $state('');
	let stocks = $state.raw<TStockItem[]>([]);
	let sortConfig = $state<TSortConfig>({ key: 'timestamp', direction: 'desc' });
	let unsubscribe: (() => void) | undefined;
	let active = true;
	const spotted: Record<string, { time: string; price: number }> = {};

	const breakouts = $derived(
		stocks.flatMap((stock): T52WeekBreakout[] => {
			const q = marketFeed.quotes[stock.sk_token];
			if (!q?.ltp || !q.high || !q.low) return [];
			const type = q.high_52w && q.high >= q.high_52w ? 'High' : q.low_52w && q.low <= q.low_52w ? 'Low' : null;
			if (!type) return [];
			const key = `${stock.sk_token}:${type}`;
			spotted[key] ??= { time: istTime(Date.now()), price: q.ltp };
			const seen = spotted[key];
			return [
				{
					id: key,
					timestamp: seen.time,
					symbol: stock.symbol,
					display_name: stock.name,
					type,
					breakout_price: seen.price,
					ltp: q.ltp,
					p_change: changeOf(q).change_pct,
					new_extreme: type === 'High' ? q.high : q.low,
					change_identified: Math.round(((q.ltp - seen.price) / seen.price) * 10000) / 100
				}
			];
		})
	);

	const filteredBreakouts = $derived.by(() => {
		const filters: TBreakoutFilters = { search };
		const result = filter52WeekBreakouts(breakouts, filters);
		return sort52WeekBreakouts(result, sortConfig);
	});

	const stats = $derived.by(() => {
		return {
			total: filteredBreakouts.length,
			highs: filteredBreakouts.filter((b) => b.type === 'High').length,
			lows: filteredBreakouts.filter((b) => b.type === 'Low').length
		};
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
		if (!active || !res.ok) return;
		stocks = res.data.stocks;
		unsubscribe = marketFeed.subscribe(
			stocks.map((s) => s.sk_token),
			FIELDS
		);
	});

	onDestroy(() => {
		active = false;
		unsubscribe?.();
	});
</script>

<svelte:head>
	<title>52-Week Breakout | SvaKosh</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<Header {stats} />

	<div class="mb-6">
		<div class="w-full lg:w-96">
			<SvaKoshInput
				id="search"
				bind:value={search}
				placeholder="Search by Symbol or Name..."
				class="w-full py-[0.8rem]"
				clearable={true}
			/>
		</div>
	</div>

	<div in:fade={{ delay: 200 }}>
		<Table
			breakouts={filteredBreakouts}
			{sortConfig}
			onSort={handleSort}
		/>
	</div>
</div>
