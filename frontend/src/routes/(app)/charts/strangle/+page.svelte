<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { StrangleDataMap } from './_lib/types';
	import { DEFAULT_SYMBOL, DEFAULT_EXPIRY } from '$lib/utils/const';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { ChainSource } from '$lib/market/chain.svelte';
	import { TodayBars } from '$lib/market/bars.svelte';
	import { legsByTime, withLive } from '$lib/market/series';
	import { nearestIndex, windowAround } from '$lib/market/options';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import StrangleChart from './_components/StrangleChart.svelte';
	import StrangleControls from './_components/StrangleControls.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let ceStrike = $state(0);
	let peStrike = $state(0);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	const INTERVAL = 5;
	const source = new ChainSource();
	const bars = new TodayBars();
	const expiry = $derived(source.view ? source.expiry(selectedExpiry) : '');
	const allStrikes = $derived(expiry ? source.strikes(expiry) : []);
	const hasSpot = $derived(source.spot > 0);
	const atmIndex = $derived(nearestIndex(allStrikes, source.spot));
	const atmStrike = $derived(hasSpot ? (allStrikes[atmIndex] ?? 0) : 0);
	const ceToken = $derived(expiry && ceStrike ? source.token(expiry, ceStrike, 'CE') : '');
	const peToken = $derived(expiry && peStrike ? source.token(expiry, peStrike, 'PE') : '');

	const strangleData: StrangleDataMap = $derived(
		Object.fromEntries(
			legsByTime(
				withLive(bars.data[ceToken], marketFeed.quotes[ceToken], INTERVAL),
				withLive(bars.data[peToken], marketFeed.quotes[peToken], INTERVAL)
			).map(({ time, ce, pe }) => [
				time,
				{
					time,
					ceOI: ce.oi,
					peOI: pe.oi,
					strangleRate: Math.round((ce.close + pe.close) * 100) / 100,
					strangleATP: Math.round((ce.atp + pe.atp) * 100) / 100
				}
			])
		)
	);

	$effect(() => {
		if (!atmStrike) return;
		if (!allStrikes.includes(ceStrike)) ceStrike = allStrikes[atmIndex + 1] ?? atmStrike;
		if (!allStrikes.includes(peStrike)) peStrike = allStrikes[atmIndex - 1] ?? atmStrike;
	});

	$effect(() => {
		if (!source.view) return;
		return marketFeed.subscribe([source.view.spot]);
	});

	$effect(() => {
		if (!ceToken || !peToken) return;
		return marketFeed.subscribe([ceToken, peToken], ['ltp', 'oi']);
	});

	function updateData() {
		if (expiry) void bars.load(source.subject, source.optionPrefix(expiry), INTERVAL);
	}

	$effect(updateData);

	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);
	let isCeStrikeOpen = $state(false);
	let isPeStrikeOpen = $state(false);

	$effect(() => {
		if (isSymbolOpen) {
			isExpiryOpen = false;
			isCeStrikeOpen = false;
			isPeStrikeOpen = false;
		}
	});

	$effect(() => {
		if (isExpiryOpen) {
			isSymbolOpen = false;
			isCeStrikeOpen = false;
			isPeStrikeOpen = false;
		}
	});

	$effect(() => {
		if (isCeStrikeOpen) {
			isSymbolOpen = false;
			isExpiryOpen = false;
			isPeStrikeOpen = false;
		}
	});

	$effect(() => {
		if (isPeStrikeOpen) {
			isSymbolOpen = false;
			isExpiryOpen = false;
			isCeStrikeOpen = false;
		}
	});

	$effect(() => {
		const url = new URL(page.url);
		if (url.searchParams.get('type') !== chartType) {
			url.searchParams.set('type', chartType);
			goto(url.href, { replaceState: true, noScroll: true });
		}
	});

	const strikes = $derived(hasSpot ? windowAround(allStrikes, atmIndex) : []);

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		ceStrike = 0;
		peStrike = 0;
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
	<title>Strangle Chart | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<header>
			<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
				Strangle Analysis
			</h1>
			<p class="text-muted-foreground text-sm">Open Interest trend for custom Call & Put strikes</p>
		</header>

		<StrangleControls 
			bind:symbol={selectedSymbol}
			bind:expiry={selectedExpiry}
			bind:ceStrike
			bind:peStrike
			bind:isSymbolOpen
			bind:isExpiryOpen
			bind:isCeStrikeOpen
			bind:isPeStrikeOpen
			{strikes}
			onSymbolChange={handleSymbolChange}
			onExpiryChange={updateData}
			onCeStrikeChange={updateData}
			onPeStrikeChange={updateData}
		/>
	</div>

	<div class="w-full">
		{#if Object.keys(strangleData).length > 0}
			<StrangleChart 
				data={strangleData}
				symbol={selectedSymbol} 
				ceStrike={ceStrike}
				peStrike={peStrike}
				bind:chartType
			/>
		{:else}
			<SvaKoshCard class="h-[590px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em]">Loading Analysis...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
