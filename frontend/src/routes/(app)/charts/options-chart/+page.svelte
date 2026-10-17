<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { OptionsChartDataMap, MetricType } from './_lib/types';
	import { DEFAULT_METRIC_ONE, DEFAULT_METRIC_TWO } from './_lib/const';
	import { DEFAULT_SYMBOL, DEFAULT_EXPIRY } from '$lib/utils/const';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { ChainSource } from '$lib/market/chain.svelte';
	import { TodayBars } from '$lib/market/bars.svelte';
	import { legsByTime, withLive } from '$lib/market/series';
	import { nearestIndex, windowAround } from '$lib/market/options';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import OptionsChartControls from './_components/OptionsChartControls.svelte';
	import OptionsChartItem from './_components/OptionsChartItem.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let metric1 = $state<MetricType>(DEFAULT_METRIC_ONE);
	let metric2 = $state<MetricType>(DEFAULT_METRIC_TWO);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	let selectedStrike = $state(0);
	const INTERVAL = 5;
	const source = new ChainSource();
	const bars = new TodayBars();
	const expiry = $derived(source.view ? source.expiry(selectedExpiry) : '');
	const allStrikes = $derived(expiry ? source.strikes(expiry) : []);
	const hasSpot = $derived(source.spot > 0);
	const atmIndex = $derived(nearestIndex(allStrikes, source.spot));
	const atmStrike = $derived(hasSpot ? (allStrikes[atmIndex] ?? 0) : 0);
	const ceToken = $derived(expiry && selectedStrike ? source.token(expiry, selectedStrike, 'CE') : '');
	const peToken = $derived(expiry && selectedStrike ? source.token(expiry, selectedStrike, 'PE') : '');

	const optionsData: OptionsChartDataMap | null = $derived.by(() => {
		if (!ceToken) return null;
		const ceQuote = marketFeed.quotes[ceToken];
		const peQuote = marketFeed.quotes[peToken];
		const cePrev = ceQuote?.prev_close ?? 0;
		const pePrev = peQuote?.prev_close ?? 0;
		return Object.fromEntries(
			legsByTime(
				withLive(bars.data[ceToken], ceQuote, INTERVAL),
				withLive(bars.data[peToken], peQuote, INTERVAL)
			).map(({ time, ce, pe }) => [
				time,
				{
					time,
					ceOI: ce.oi,
					peOI: pe.oi,
					ceLTP: ce.close,
					peLTP: pe.close,
					ceVolume: ce.volume,
					peVolume: pe.volume,
					ceATP: ce.atp,
					peATP: pe.atp,
					ceChange: cePrev ? Math.round((ce.close - cePrev) * 100) / 100 : 0,
					peChange: pePrev ? Math.round((pe.close - pePrev) * 100) / 100 : 0,
					ceOpen: ce.open,
					peOpen: pe.open,
					ceHigh: ce.high,
					peHigh: pe.high,
					ceLow: ce.low,
					peLow: pe.low,
					ceClose: ce.close,
					peClose: pe.close
				}
			])
		);
	});

	$effect(() => {
		if (atmStrike && !allStrikes.includes(selectedStrike)) selectedStrike = atmStrike;
	});

	$effect(() => {
		if (!source.view) return;
		return marketFeed.subscribe([source.view.spot]);
	});

	$effect(() => {
		if (!ceToken) return;
		return marketFeed.subscribe([ceToken, peToken], ['ltp', 'prev_close', 'oi']);
	});

	function updateData() {
		if (expiry) void bars.load(source.subject, source.optionPrefix(expiry), INTERVAL);
	}

	$effect(updateData);

	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);
	let isStrikeOpen = $state(false);
	let isMetric1Open = $state(false);
	let isMetric2Open = $state(false);

	$effect(() => {
		if (isSymbolOpen) { isExpiryOpen = false; isStrikeOpen = false; isMetric1Open = false; isMetric2Open = false; }
	});
	$effect(() => {
		if (isExpiryOpen) { isSymbolOpen = false; isStrikeOpen = false; isMetric1Open = false; isMetric2Open = false; }
	});
	$effect(() => {
		if (isStrikeOpen) { isSymbolOpen = false; isExpiryOpen = false; isMetric1Open = false; isMetric2Open = false; }
	});
	$effect(() => {
		if (isMetric1Open) { isSymbolOpen = false; isExpiryOpen = false; isStrikeOpen = false; isMetric2Open = false; }
	});
	$effect(() => {
		if (isMetric2Open) { isSymbolOpen = false; isExpiryOpen = false; isStrikeOpen = false; isMetric1Open = false; }
	});

	$effect(() => {
		const url = new URL(page.url);
		if (url.searchParams.get('type') !== chartType) {
			url.searchParams.set('type', chartType);
			goto(url.href, { replaceState: true, noScroll: true });
		}
	});

	const strikeOptions = $derived(
		hasSpot ? windowAround(allStrikes, atmIndex).map((s) => ({ label: String(s), value: s })) : []
	);

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		selectedStrike = 0;
		void source.load(val);
	}

	onMount(() => {
		void source.load(selectedSymbol);
	});

	onDestroy(() => {
		source.stop();
		bars.stop();
	});
</script>

<svelte:head>
	<title>Options Chart | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
		<header>
			<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
				Options Strategy Chart
			</h1>
			<p class="text-muted-foreground text-sm">Compare dual metrics across CE and PE for a specific strike</p>
		</header>

		<OptionsChartControls 
			bind:symbol={selectedSymbol}
			bind:expiry={selectedExpiry}
			bind:strike={selectedStrike}
			{strikeOptions}
			bind:metric1
			bind:metric2
			bind:isSymbolOpen
			bind:isExpiryOpen
			bind:isStrikeOpen
			bind:isMetric1Open
			bind:isMetric2Open
			onSymbolChange={handleSymbolChange}
			onExpiryChange={updateData}
			onStrikeChange={updateData}
			onMetric1Change={(val) => metric1 = val}
			onMetric2Change={(val) => metric2 = val}
		/>
	</div>

	<div class="w-full">
		{#if optionsData}
			<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
				<OptionsChartItem data={optionsData} side="CE" {metric1} {metric2} bind:chartType />
				<OptionsChartItem data={optionsData} side="PE" {metric1} {metric2} bind:chartType />
			</div>
		{:else}
			<SvaKoshCard class="h-[calc(100vh-10rem)] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em]">Analyzing Options Chain...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
