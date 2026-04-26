<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { StraddleDataMap } from './_lib/types';
	import { DEFAULT_SYMBOL, DEFAULT_EXPIRY, STRIKE_DIFFERENCES } from './_lib/const';
	import { generateMockStraddleData, getBaseStrike } from './_lib/mock-data';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import StraddleChart from './_components/StraddleChart.svelte';
	import StraddleControls from './_components/StraddleControls.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let initialStrike = getBaseStrike(DEFAULT_SYMBOL);
	let atmStrike = $state(initialStrike);
	let currentStrike = $state(initialStrike);
	let straddleData = $state<StraddleDataMap>({});
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	let intervalId: any;

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

	const strikeDifference = $derived(STRIKE_DIFFERENCES[selectedSymbol] || 50);
	const strikes = $derived.by(() => {
		const base = atmStrike;
		const diff = strikeDifference;
		const lower = Array.from({ length: 15 }, (_, i) => base - diff * (i + 1));
		const upper = Array.from({ length: 15 }, (_, i) => base + diff * (i + 1));
		return [...lower, base, ...upper].sort((a, b) => a - b);
	});

	function updateData() {
		straddleData = generateMockStraddleData(selectedSymbol, currentStrike, selectedExpiry);
	}

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		atmStrike = getBaseStrike(val);
		currentStrike = atmStrike;
		updateData();
	}

	function handleExpiryChange(val: string) {
		selectedExpiry = val;
		updateData();
	}

	function handleStrikeChange(val: number) {
		currentStrike = val;
		updateData();
	}

	onMount(() => {
		updateData();
		intervalId = setInterval(updateData, 10000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
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


