<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { StraddleDataMap } from './_lib/types';
	import { DEFAULT_SYMBOL, DEFAULT_EXPIRY } from '$lib/utils/const';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { ChainSource } from '$lib/market/chain.svelte';
	import { TodayBars } from '$lib/market/bars.svelte';
	import { legsByTime, withLive } from '$lib/market/series';
	import { nearestIndex, windowAround } from '$lib/market/options';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import StraddleChart from './_components/StraddleChart.svelte';
	import StraddleControls from './_components/StraddleControls.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let currentStrike = $state(0);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	const INTERVAL = 5;
	const source = new ChainSource();
	const bars = new TodayBars();
	const expiry = $derived(source.view ? source.expiry(selectedExpiry) : '');
	const allStrikes = $derived(expiry ? source.strikes(expiry) : []);
	const hasSpot = $derived(source.spot > 0);
	const atmIndex = $derived(nearestIndex(allStrikes, source.spot));
	const atmStrike = $derived(hasSpot ? (allStrikes[atmIndex] ?? 0) : 0);
	const ceToken = $derived(expiry && currentStrike ? source.token(expiry, currentStrike, 'CE') : '');
	const peToken = $derived(expiry && currentStrike ? source.token(expiry, currentStrike, 'PE') : '');

	const straddleData: StraddleDataMap = $derived(
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
					ceLTP: ce.close,
					peLTP: pe.close,
					ceATP: ce.atp,
					peATP: pe.atp,
					straddleRate: Math.round((ce.close + pe.close) * 100) / 100,
					straddleATP: Math.round((ce.atp + pe.atp) * 100) / 100
				}
			])
		)
	);

	$effect(() => {
		if (atmStrike && !allStrikes.includes(currentStrike)) currentStrike = atmStrike;
	});

	$effect(() => {
		if (!source.view) return;
		return marketFeed.subscribe([source.view.spot]);
	});

	$effect(() => {
		if (!ceToken) return;
		return marketFeed.subscribe([ceToken, peToken], ['ltp', 'oi']);
	});

	$effect(() => {
		if (expiry) void bars.load(source.subject, source.optionPrefix(expiry), INTERVAL);
	});

	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);
	let isStrikeOpen = $state(false);

	$effect(() => {
		if (isSymbolOpen) {
			isExpiryOpen = false;
			isStrikeOpen = false;
		}
	});

	$effect(() => {
		if (isExpiryOpen) {
			isSymbolOpen = false;
			isStrikeOpen = false;
		}
	});

	$effect(() => {
		if (isStrikeOpen) {
			isSymbolOpen = false;
			isExpiryOpen = false;
		}
	});

	$effect(() => {
		const url = new URL(page.url);
		if (url.searchParams.get('type') !== chartType) {
			url.searchParams.set('type', chartType);
			goto(url.href, { replaceState: true, noScroll: true });
		}
	});

	const strikes = $derived(hasSpot ? windowAround(allStrikes, atmIndex, 15) : []);

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		currentStrike = 0;
		void source.load(val);
	}

	function handleExpiryChange(val: string) {
		selectedExpiry = val;
	}

	function handleStrikeChange(val: number) {
		currentStrike = val;
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
	<title>Straddle Chart | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<header>
			<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
				Straddle Analysis
			</h1>
			<p class="text-muted-foreground text-sm">Real-time Options Sentiment & Rate Tracking</p>
		</header>
		<StraddleControls 
			bind:symbol={selectedSymbol}
			bind:expiry={selectedExpiry}
			bind:strike={currentStrike}
			bind:isSymbolOpen
			bind:isExpiryOpen
			bind:isStrikeOpen
			{strikes}
			onSymbolChange={handleSymbolChange}
			onExpiryChange={handleExpiryChange}
			onStrikeChange={handleStrikeChange}
		/>
	</div>

	<div class="w-full">
		{#if Object.keys(straddleData).length > 0}
			<StraddleChart 
				data={straddleData}
				symbol={selectedSymbol} 
				strike={currentStrike} 
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


