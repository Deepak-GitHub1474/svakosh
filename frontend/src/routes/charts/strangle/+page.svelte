<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { StrangleDataMap } from './_lib/types';
	import { DEFAULT_SYMBOL, DEFAULT_EXPIRY, STRIKE_DIFFERENCES } from './_lib/const';
	import { generateMockStrangleData, getBaseStrike } from './_lib/mock-data';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import StrangleChart from './_components/StrangleChart.svelte';
	import StrangleControls from './_components/StrangleControls.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let initialStrike = getBaseStrike(DEFAULT_SYMBOL);
	let atmStrike = $state(initialStrike);
	let ceStrike = $state(initialStrike + (STRIKE_DIFFERENCES[DEFAULT_SYMBOL] || 50));
	let peStrike = $state(initialStrike - (STRIKE_DIFFERENCES[DEFAULT_SYMBOL] || 50));
	
	let strangleData = $state<StrangleDataMap>({});
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	let intervalId: any;

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

	const strikeDifference = $derived(STRIKE_DIFFERENCES[selectedSymbol] || 50);
	const strikes = $derived.by(() => {
		const base = atmStrike;
		const diff = strikeDifference;
		const lower = Array.from({ length: 30 }, (_, i) => base - diff * (i + 1));
		const upper = Array.from({ length: 30 }, (_, i) => base + diff * (i + 1));
		return [...lower, base, ...upper].sort((a, b) => a - b);
	});

	function updateData() {
		strangleData = generateMockStrangleData(selectedSymbol, ceStrike, peStrike, selectedExpiry);
	}

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		const base = getBaseStrike(val);
		const diff = STRIKE_DIFFERENCES[val] || 50;
		atmStrike = base;
		ceStrike = base + diff;
		peStrike = base - diff;
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
