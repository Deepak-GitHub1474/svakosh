<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { OptionsChartDataMap, MetricType } from './_lib/types';
	import { 
		DEFAULT_SYMBOL, DEFAULT_EXPIRY, DEFAULT_METRIC_ONE, DEFAULT_METRIC_TWO, 
		STRIKE_DIFFERENCES 
	} from './_lib/const';
	import { generateMockOptionsData, getBaseStrike } from './_lib/mock-data';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import OptionsChartControls from './_components/OptionsChartControls.svelte';
	import OptionsChartItem from './_components/OptionsChartItem.svelte';

	let selectedSymbol = $state(DEFAULT_SYMBOL);
	let selectedExpiry = $state(DEFAULT_EXPIRY);
	let metric1 = $state<MetricType>(DEFAULT_METRIC_ONE);
	let metric2 = $state<MetricType>(DEFAULT_METRIC_TWO);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	let atmStrike = $state(0);
	let selectedStrike = $state(0);
	let optionsData = $state<OptionsChartDataMap | null>(null);
	let intervalId: any;

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

	const strikeDifference = $derived(STRIKE_DIFFERENCES[selectedSymbol] || 50);
	const strikeOptions = $derived.by(() => {
		if (atmStrike === 0) return [];
		const diff = strikeDifference;
		const base = atmStrike;
		const lower = Array.from({ length: 30 }, (_, i) => base - diff * (i + 1));
		const upper = Array.from({ length: 30 }, (_, i) => base + diff * (i + 1));
		return [...lower, base, ...upper].sort((a, b) => a - b).map(s => ({ label: String(s), value: s }));
	});

	function updateData() {
		optionsData = generateMockOptionsData(selectedSymbol, selectedStrike, selectedExpiry);
	}

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		const base = getBaseStrike(val);
		atmStrike = base;
		selectedStrike = base;
		updateData();
	}

	onMount(() => {
		const base = getBaseStrike(selectedSymbol);
		atmStrike = base;
		selectedStrike = base;
		updateData();
		intervalId = setInterval(updateData, 10000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
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
