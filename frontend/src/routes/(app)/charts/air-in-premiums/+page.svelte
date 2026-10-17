<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { AirInPremiumsData } from './_lib/types';
	import { DEFAULT_SYMBOL, DEFAULT_EXPIRY, DEFAULT_STRIKE_COUNT } from '$lib/utils/const';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { ChainSource } from '$lib/market/chain.svelte';
	import { extrinsic, nearestIndex, windowAround } from '$lib/market/options';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import AirInPremiumsChart from './_components/AirInPremiumsChart.svelte';
	import AirInPremiumsControls from './_components/AirInPremiumsControls.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let strikeCount = $state(DEFAULT_STRIKE_COUNT);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'bar');

	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);

	$effect(() => {
		if (isSymbolOpen) {
			isExpiryOpen = false;
		}
	});

	$effect(() => {
		if (isExpiryOpen) {
			isSymbolOpen = false;
		}
	});

	$effect(() => {
		const url = new URL(page.url);
		if (url.searchParams.get('type') !== chartType) {
			url.searchParams.set('type', chartType);
			goto(url.href, { replaceState: true, noScroll: true });
		}
	});

	const source = new ChainSource();
	const expiry = $derived(source.view ? source.expiry(selectedExpiry) : '');
	const allStrikes = $derived(expiry ? source.strikes(expiry) : []);
	const hasSpot = $derived(source.spot > 0);
	const atmIndex = $derived(nearestIndex(allStrikes, source.spot));
	const visibleStrikes = $derived(hasSpot ? windowAround(allStrikes, atmIndex, strikeCount) : []);

	const airData = $derived.by((): AirInPremiumsData | null => {
		if (!expiry || visibleStrikes.length === 0) return null;
		const spot = source.spot;
		const data: AirInPremiumsData = { atm_strike: allStrikes[atmIndex] };
		for (const strike of visibleStrikes) {
			data[strike] = {
				extCE: extrinsic(marketFeed.quotes[source.token(expiry, strike, 'CE')]?.ltp, spot, strike, 'CE'),
				extPE: extrinsic(marketFeed.quotes[source.token(expiry, strike, 'PE')]?.ltp, spot, strike, 'PE')
			};
		}
		return data;
	});

	$effect(() => {
		if (!source.view) return;
		return marketFeed.subscribe([source.view.spot]);
	});

	$effect(() => {
		if (!expiry || visibleStrikes.length === 0) return;
		return marketFeed.subscribe(
			visibleStrikes.flatMap((strike) => [
				source.token(expiry, strike, 'CE'),
				source.token(expiry, strike, 'PE')
			]),
			['ltp']
		);
	});

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		void source.load(val);
	}

	function handleExpiryChange(val: string) {
		selectedExpiry = val;
	}

	onMount(() => {
		void source.load(selectedSymbol);
	});

	onDestroy(() => source.stop());
</script>

<svelte:head>
	<title>Air In Premiums | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<header>
			<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
				Air In Premiums
			</h1>
			<p class="text-muted-foreground text-sm">Extrinsic value distribution across option strikes</p>
		</header>

		<AirInPremiumsControls 
			bind:symbol={selectedSymbol}
			bind:expiry={selectedExpiry}
			bind:strikeCount
			maxStrikeCount={20}
			bind:isSymbolOpen
			bind:isExpiryOpen
			onSymbolChange={handleSymbolChange}
			onExpiryChange={handleExpiryChange}
		/>
	</div>

	<div class="w-full">
		{#if airData}
			<AirInPremiumsChart 
				data={airData}
				symbol={selectedSymbol} 
				strikes={visibleStrikes}
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
