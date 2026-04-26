<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { AirInPremiumsData } from './_lib/types';
	import { DEFAULT_SYMBOL, DEFAULT_EXPIRY, DEFAULT_STRIKE_COUNT, STRIKE_DIFFERENCES } from './_lib/const';
	import { generateMockAirData, getBaseStrike } from './_lib/mock-data';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import AirInPremiumsChart from './_components/AirInPremiumsChart.svelte';
	import AirInPremiumsControls from './_components/AirInPremiumsControls.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let strikeCount = $state(DEFAULT_STRIKE_COUNT);
	let airData = $state<AirInPremiumsData | null>(null);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'bar');
	let intervalId: any;

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

	const strikeDifference = $derived(STRIKE_DIFFERENCES[selectedSymbol] || 50);
	const visibleStrikes = $derived.by(() => {
		if (!airData) return [];
		const base = airData.atm_strike;
		const diff = strikeDifference;
		const lower = Array.from({ length: strikeCount }, (_, i) => base - diff * (i + 1));
		const upper = Array.from({ length: strikeCount }, (_, i) => base + diff * (i + 1));
		return [...lower, base, ...upper].sort((a, b) => a - b);
	});

	function updateData() {
		airData = generateMockAirData(selectedSymbol, selectedExpiry);
	}

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		updateData();
	}

	onMount(() => {
		updateData();
		intervalId = setInterval(updateData, 60000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
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
			onExpiryChange={updateData}
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
