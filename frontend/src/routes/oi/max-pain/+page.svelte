<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import { MAX_PAIN_SYMBOLS, MAX_PAIN_EXPIRIES } from './_lib/const';
	import { generateMaxPainMockData } from './_lib/mock-data';
	import { calculateStrikes } from './_lib/helper';
	import type { TMaxPainData } from './_lib/types';
	import MaxPainChart from './_components/MaxPainChart.svelte';

	let selectedSymbol: string = $state('NIFTY');
	let selectedExpiry: string = $state('CURRENT_WEEK');
	let strikeCount: number = $state(30);
	let maxPainData: TMaxPainData = $state({});
	let maxPainStrike: number = $state(0);
	let strikes: number[] = $state([]);

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
	<header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl tracking-tight text-primary mb-1">
				Max Pain Analysis
			</h1>
			<p class="text-muted-foreground text-sm">
				Option payout optimization to identify point of maximum loss for sellers
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<div class="flex items-baseline gap-2 px-4 py-2 bg-surface/5 border border-border-subtle rounded-xl min-w-[140px] justify-center">
				<span class="text-[10px] uppercase tracking-widest text-muted-foreground">Max Pain</span>
				<span class="text-lg text-primary">{maxPainStrike}</span>
			</div>
			
			<div class="w-40">
				<SvaKoshSelector 
					options={MAX_PAIN_SYMBOLS} 
					bind:value={selectedSymbol} 
					onSelect={handleUpdate}
					placeholder="Symbol"
				/>
			</div>
			
			<div class="w-44">
				<SvaKoshSelector 
					options={MAX_PAIN_EXPIRIES} 
					bind:value={selectedExpiry} 
					onSelect={handleUpdate}
					placeholder="Expiry"
				/>
			</div>

			<div class="flex items-center gap-2 group">
				<label for="strike-range" class="text-[10px] uppercase text-muted-foreground tracking-tighter">Strikes</label>
				<input 
					id="strike-range"
					type="number" 
					bind:value={strikeCount}
					class="w-16 h-10 bg-surface/5 border border-border-subtle rounded-xl text-center text-sm text-primary outline-none focus:border-primary/50 transition-colors"
					min="5"
					max="50"
				/>
			</div>
		</div>
	</header>

	<SvaKoshCard class="p-px h-[500px] relative">
		{#if strikes.length > 0}
			<MaxPainChart data={maxPainData} {strikes} {maxPainStrike} height="500px" />
		{:else}
			<div class="h-[500px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Calculating Pain Points...</p>
				</div>
			</div>
		{/if}
	</SvaKoshCard>
</div>
