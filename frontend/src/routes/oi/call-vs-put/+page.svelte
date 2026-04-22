<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { OIDataMap } from './_lib/types';
	import { symbols, expiries, strikeDifferences } from './_lib/const';
	import { generateStrikeList } from './_lib/helper';
	import { generateSingleStrikeMockData, getInitialStrike } from './_lib/mock-data';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import CallVsPutChart from './_components/CallVsPutChart.svelte';

	let selectedSymbol = $state('NIFTY');
	let selectedExpiry = $state('CURRENT_WEEK');
	let selectedStrike = $state(0);
	let atmStrike = $state(0);
	let oiData = $state<OIDataMap>({});
	let lastUpdated = $state<string>('');

	let strikeOptions = $derived.by(() => {
		if (atmStrike === 0) return [];
		const diff = strikeDifferences[selectedSymbol] || 100;
		const list = generateStrikeList(atmStrike, diff);
		return list.map(s => ({ label: String(s), value: s }));
	});

	function updateData() {
		oiData = generateSingleStrikeMockData(selectedSymbol, selectedStrike, selectedExpiry);
		lastUpdated = new Date().toLocaleTimeString();
	}

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		const initial = getInitialStrike(val);
		atmStrike = initial;
		selectedStrike = initial;
		updateData();
	}

	function handleStrikeChange(val: number) {
		selectedStrike = val;
		updateData();
	}

	let intervalId: any;

	onMount(() => {
		const initial = getInitialStrike(selectedSymbol);
		atmStrike = initial;
		selectedStrike = initial;
		updateData();

		intervalId = setInterval(() => {
			updateData();
		}, 10000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<svelte:head>
	<title>OI Call vs Put | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<header>
		<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
			Call vs Put OI Analysis
		</h1>
		<p class="text-muted-foreground text-sm">Open Interest trend across time for single strike</p>
	</header>

	<div class="flex flex-wrap items-center gap-4">
		<div class="w-full sm:w-40">
			<SvaKoshSelector 
				options={symbols} 
				bind:value={selectedSymbol} 
				onSelect={handleSymbolChange}
				placeholder="Symbol"
			/>
		</div>
		<div class="w-full sm:w-48">
			<SvaKoshSelector 
				options={expiries} 
				bind:value={selectedExpiry} 
				onSelect={updateData}
				placeholder="Expiry"
			/>
		</div>
		<div class="w-full sm:w-48">
			<SvaKoshSelector 
				options={strikeOptions} 
				bind:value={selectedStrike} 
				onSelect={handleStrikeChange}
				searchable={true}
				placeholder="Strike Price"
			/>
		</div>
	</div>

	<div class="w-full">
		{#if Object.keys(oiData).length > 0}
			<CallVsPutChart 
				data={oiData} 
				symbol={selectedSymbol} 
				strike={selectedStrike} 
				onRefresh={updateData}
			/>
		{:else}
			<SvaKoshCard class="h-[500px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em]">Loading Analysis...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
