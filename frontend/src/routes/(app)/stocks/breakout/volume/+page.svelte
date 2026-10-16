<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import { filterBreakouts, sortBreakouts } from './_lib/helper';
	import type { TBreakoutFilters, TSortConfig, TSortKey, TVolumeBreakout } from './_lib/types';
	import { changeOf, marketFeed, type TQuoteField } from '$lib/market/feed.svelte';
	import { getAverageVolumes, getMarketOverview } from '$lib/market/service';
	import { istTime } from '$lib/market/time';
	import type { TStockItem } from '$lib/market/types';
	import Header from './_components/Header.svelte';
	import Table from './_components/Table.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';

	const FIELDS: TQuoteField[] = ['ltp', 'prev_close', 'high', 'low', 'volume'];
	const SPIKE = 2;
	const STRONG_SPIKE = 3;

	let search = $state('');
	let stocks = $state.raw<TStockItem[]>([]);
	let averages = $state.raw<Record<string, number>>({});
	let sortConfig = $state<TSortConfig>({ key: 'timestamp', direction: 'desc' });
	let unsubscribe: (() => void) | undefined;
	let active = true;
	const spotted: Record<string, { time: string; price: number }> = {};

	const pct = (value: number, base: number) => (base ? Math.round(((value - base) / base) * 10000) / 100 : 0);

	const breakouts = $derived(
		stocks.flatMap((stock): TVolumeBreakout[] => {
			const q = marketFeed.quotes[stock.sk_token];
			const average = averages[stock.sk_token];
			if (!q?.ltp || !q.volume || !average) return [];
			const ratio = q.volume / average;
			if (ratio < SPIKE) return [];
			spotted[stock.sk_token] ??= { time: istTime(Date.now()), price: q.ltp };
			const seen = spotted[stock.sk_token];
			return [
				{
					id: stock.sk_token,
					timestamp: seen.time,
					symbol: stock.symbol,
					display_name: stock.name,
					criteria: ratio >= STRONG_SPIKE ? `Strong Volume Spike > ${STRONG_SPIKE}x` : `Volume Spike > ${SPIKE}x`,
					breakout_price: seen.price,
					ltp: q.ltp,
					p_change: changeOf(q).change_pct,
					day_high: q.high ?? 0,
					day_low: q.low ?? 0,
					change_wrt_high: pct(q.ltp, q.high ?? 0),
					change_wrt_low: pct(q.ltp, q.low ?? 0)
				}
			];
		})
	);

	const filteredBreakouts = $derived.by(() => {
		const filters: TBreakoutFilters = { search };
		const result = filterBreakouts(breakouts, filters);
		return sortBreakouts(result, sortConfig);
	});

	const stats = $derived.by(() => {
		return {
			total: filteredBreakouts.length,
			bullish: filteredBreakouts.filter((b) => b.p_change >= 0).length,
			bearish: filteredBreakouts.filter((b) => b.p_change < 0).length
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
		const [overview, volumes] = await Promise.all([getMarketOverview(), getAverageVolumes()]);
		if (!active || !overview.ok) return;
		averages = volumes.ok ? volumes.data : {};
		stocks = overview.data.stocks;
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
	<title>Volume Breakout | SvaKosh</title>
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
