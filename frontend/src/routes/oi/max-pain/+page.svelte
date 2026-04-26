<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { TMaxPainData } from './_lib/types';
	import { calculateStrikes } from './_lib/helper';
	import { generateMaxPainMockData } from './_lib/mock-data';
	import { MAX_PAIN_SYMBOLS, MAX_PAIN_EXPIRIES } from './_lib/const';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshNumberInput from '$lib/components/svakosh/SvaKoshNumberInput.svelte';
	import MaxPainChart from './_components/MaxPainChart.svelte';
	import MaxPainGuidance from './_components/MaxPainGuidance.svelte';

	let selectedSymbol: string = $state('NIFTY');
	let selectedExpiry: string = $state('CURRENT_WEEK');
	let strikeCount: number = $state(30);
	let maxPainData: TMaxPainData = $state({});
	let maxPainStrike: number = $state(0);
	let strikes: number[] = $state([]);
	let isSymbolOpen: boolean = $state(false);
	let isExpiryOpen: boolean = $state(false);

	function refreshData(): void {
		const { data, maxPainStrike: base } = generateMaxPainMockData(selectedSymbol);
		maxPainData = data;
		maxPainStrike = base;
		strikes = calculateStrikes(base, selectedSymbol, strikeCount);
	}

	function handleUpdate(): void {
		refreshData();
	}

	$effect(() => {
		if (isSymbolOpen) isExpiryOpen = false;
	});

	$effect(() => {
		if (isExpiryOpen) isSymbolOpen = false;
	});

	$effect(() => {
		if (maxPainStrike > 0) {
			strikes = calculateStrikes(maxPainStrike, selectedSymbol, strikeCount);
		}
	});

	onMount(() => {
		refreshData();
	});
</script>

<svelte:head>
	<title>Max Pain | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6" in:fade>
	<header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl tracking-tight text-primary mb-1">
				Max Pain Analysis
			</h1>
			<p class="text-muted-foreground text-sm">
				Option payout optimization to identify point of maximum loss for sellers
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end justify-start">
			<div class="flex items-center gap-3 w-full sm:w-auto">
				<SvaKoshSelector
					class="w-full sm:w-40" 
					options={MAX_PAIN_SYMBOLS} 
					bind:value={selectedSymbol} 
					bind:isOpen={isSymbolOpen}
					onSelect={handleUpdate}
					placeholder="Symbol"
				/>
				<SvaKoshSelector
					class="w-full sm:w-44" 
					options={MAX_PAIN_EXPIRIES} 
					bind:value={selectedExpiry} 
					bind:isOpen={isExpiryOpen}
					onSelect={handleUpdate}
					placeholder="Expiry"
				/>
			</div>
			<SvaKoshNumberInput 
				label="Strikes" 
				bind:value={strikeCount} 
				min={5} 
				max={50} 
				step={1} 
				class="w-full sm:w-36"
			/>
		</div>
	</header>

	<SvaKoshCard class="h-[506px] relative">
		{#if strikes.length > 0}
			<MaxPainChart data={maxPainData} {strikes} {maxPainStrike} height="480px" />
		{:else}
			<div class="h-[506px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Calculating Pain Points...</p>
				</div>
			</div>
		{/if}
	</SvaKoshCard>

	<MaxPainGuidance {selectedSymbol} {maxPainStrike} />
</div>
