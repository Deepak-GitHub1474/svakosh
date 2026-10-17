<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { OIDataMap } from './_lib/types';
	import { SYMBOLS as symbols, EXPIRIES as expiries } from '$lib/utils/const';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { ChainSource } from '$lib/market/chain.svelte';
	import { TodayBars } from '$lib/market/bars.svelte';
	import { oiByTime, withLive } from '$lib/market/series';
	import { nearestIndex, windowAround } from '$lib/market/options';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import CallVsPutChart from './_components/CallVsPutChart.svelte';

	let selectedSymbol = $state('NIFTY');
	let selectedExpiry = $state('CURRENT_WEEK');
	let selectedStrike = $state(0);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);
	let isStrikeOpen = $state(false);
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
	const oiData: OIDataMap = $derived(
		oiByTime(
			withLive(bars.data[ceToken], marketFeed.quotes[ceToken], INTERVAL),
			withLive(bars.data[peToken], marketFeed.quotes[peToken], INTERVAL)
		)
	);

	$effect(() => {
		if (atmStrike && !allStrikes.includes(selectedStrike)) selectedStrike = atmStrike;
	});

	$effect(() => {
		if (!source.view) return;
		return marketFeed.subscribe([source.view.spot]);
	});

	$effect(() => {
		if (!ceToken) return;
		return marketFeed.subscribe([ceToken, peToken], ['ltp', 'oi']);
	});

	function updateData() {
		if (expiry) void bars.load(source.subject, source.optionPrefix(expiry), INTERVAL);
	}

	$effect(updateData);

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

	let strikeOptions = $derived(
		hasSpot ? windowAround(allStrikes, atmIndex).map((s) => ({ label: String(s), value: s })) : []
	);

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		selectedStrike = 0;
		void source.load(val);
	}

	function handleStrikeChange(val: number) {
		selectedStrike = val;
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
	<title>OI Call vs Put | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<header>
			<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
				Call vs Put OI Analysis
			</h1>
			<p class="text-muted-foreground text-sm">Open Interest trend across time for single strike</p>
		</header>

		<div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
			<div class="flex items-center gap-3 w-full sm:w-auto">
				<div class="w-full sm:w-40">
					<SvaKoshSelector 
						options={symbols} 
						bind:value={selectedSymbol} 
						bind:isOpen={isSymbolOpen}
						onSelect={handleSymbolChange}
						placeholder="Symbol"
					/>
				</div>
				<div class="w-full sm:w-44">
					<SvaKoshSelector 
						options={expiries} 
						bind:value={selectedExpiry} 
						bind:isOpen={isExpiryOpen}
						onSelect={updateData}
						placeholder="Expiry"
					/>
				</div>
			</div>
			<div class="w-full sm:w-36">
				<SvaKoshSelector 
					options={strikeOptions} 
					bind:value={selectedStrike} 
					bind:isOpen={isStrikeOpen}
					onSelect={handleStrikeChange}
					searchable={true}
					placeholder="Strike Price"
				/>
			</div>
		</div>
	</div>

	<div class="w-full">
		{#if Object.keys(oiData).length > 0}
			<CallVsPutChart 
				data={oiData} 
				symbol={selectedSymbol} 
				strike={selectedStrike} 
				bind:chartType
				onRefresh={updateData}
			/>
		{:else}
			<SvaKoshCard class="h-[600px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em]">Loading Analysis...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
