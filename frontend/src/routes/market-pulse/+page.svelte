<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import type { TMarketPulseData, TMarketPulseRow } from './_lib/types';
	import { PULSE_SYMBOLS, PULSE_REFRESH_INTERVAL } from './_lib/const';
	import { isMarketHours } from './_lib/helper';
	import { generatePulseMockData, generateLivePulseRow } from './_lib/mock-data';
	import MarketPulseTable from './_components/MarketPulseTable.svelte';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';

	let selectedSymbol: string = $state('NIFTY');
	let pulseData: TMarketPulseData = $state({});
	let liveRow: TMarketPulseRow | null = $state(null);
	let isSymbolOpen: boolean = $state(false);
	let intervalId: any;

	function refreshData(): void {
		pulseData = generatePulseMockData(selectedSymbol);
		liveRow = generateLivePulseRow(selectedSymbol);
	}

	function handleSymbolChange(val: string): void {
		selectedSymbol = val;
		refreshData();
	}

	onMount(() => {
		refreshData();
		intervalId = setInterval(() => {
			if (isMarketHours()) {
				liveRow = generateLivePulseRow(selectedSymbol);
			}
		}, PULSE_REFRESH_INTERVAL);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<svelte:head>
	<title>Market Pulse | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6" in:fade>
	<header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl tracking-tight text-primary mb-1">
				Market Pulse
			</h1>
			<p class="text-muted-foreground text-sm">
				Real-time intraday sentiment and open interest snapshots
			</p>
		</div>

		<div class="flex items-center gap-3">
			<div class="w-full sm:w-40">
				<SvaKoshSelector 
					options={PULSE_SYMBOLS} 
					bind:value={selectedSymbol} 
					bind:isOpen={isSymbolOpen}
					onSelect={handleSymbolChange}
					placeholder="Symbol"
				/>
			</div>
		</div>
	</header>

	<div class="glass-panel p-4 rounded-xl border border-border-subtle bg-surface/5">
		<h4 class="text-xs text-primary uppercase tracking-wider mb-2">How to read Market Pulse?</h4>
		<p class="text-xs text-muted-foreground leading-relaxed">
			Market Pulse provides cumulative intraday trend analysis. Observe the <span class="text-bullish">Option Signal</span> and 
			<span class="text-primary">VWAP</span> correlations to identify momentum. 
			Snapshots are calculated every 5 minutes, while the latest row updates every 10 seconds with the latest tick.
		</p>
	</div>

	<div class="w-full" in:slide={{ delay: 200 }}>
		{#if Object.keys(pulseData).length > 0}
			<MarketPulseTable {pulseData} {liveRow} />
		{:else}
			<SvaKoshCard class="h-[500px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Scanning Market Pulse...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
