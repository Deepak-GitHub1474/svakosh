<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Header from './_components/Header.svelte';
	import LookupTable from './_components/LookupTable.svelte';
	import OIChart from './_components/OIChart.svelte';
	import { LOADED_LOOKUP_DATA, generateGraphData } from './_lib/mock-data';
	import type { TFullLookupData } from './_lib/types';
	import { roundLakh } from '$lib/utils';

	let activeTab = $state<'tables' | 'graphs'>('tables');
	let expiry = $state('CURRENT_WEEK');
	let selectedSymbols = $state<string[]>(['NIFTY']);
	
	let tableData = $state<TFullLookupData>(JSON.parse(JSON.stringify(LOADED_LOOKUP_DATA)));
	let graphData = $state<any>(null);

	let oiOption = $state('Total OI');
	let combined = $state(false);

	const currentExpiryData = $derived(tableData[expiry] || tableData['CURRENT_WEEK']);

	function handleTabChange(tab: 'tables' | 'graphs') {
		activeTab = tab;
		if (tab === 'graphs') {
			refreshGraphData();
		}
	}

	function handleSymbolsChange(symbols: string[]) {
		selectedSymbols = symbols;
		if (activeTab === 'graphs') {
			refreshGraphData();
		}
	}

	function refreshGraphData() {
		const sym = selectedSymbols[0] || 'NIFTY';
		graphData = generateGraphData(sym, expiry);
	}

	onMount(() => {
		const interval = setInterval(() => {
			if (activeTab === 'tables') {
				selectedSymbols.forEach(sym => {
					const detail = tableData[expiry][sym];
					if (!detail) return;
					(['CE', 'PE'] as const).forEach(side => {
						(Object.keys(detail[side]) as Array<keyof typeof detail[typeof side]>).forEach(cat => {
							const metrics = detail[side][cat];
							(Object.keys(metrics) as Array<keyof typeof metrics>).forEach(tf => {
								metrics[tf] = roundLakh(metrics[tf] + (Math.random() - 0.5) * 5);
							});
						});
					});
				});
			} else {
				refreshGraphData();
			}
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>OI Lookup | SvaKosh</title>
</svelte:head>

<div class="min-h-screen bg-background px-4 md:px-8 md:pb-8 text-foreground">
	<Header 
		{activeTab} 
		onTabChange={handleTabChange}
		{expiry}
		onExpiryChange={(val) => { expiry = val; if(activeTab === 'graphs') refreshGraphData(); }}
		{selectedSymbols}
		onSymbolsChange={handleSymbolsChange}
		{oiOption}
		onOiOptionChange={(val) => oiOption = val}
		{combined}
		onCombinedChange={(val) => combined = val}
	/>

	<div in:fade={{ delay: 200 }} class="mt-6">
		{#if activeTab === 'tables'}
			<div class="flex flex-col gap-10">
				{#each selectedSymbols as sym}
					{#if currentExpiryData[sym]}
						<LookupTable symbol={sym} data={currentExpiryData[sym]} />
					{:else}
						<div class="p-20 text-center border border-white/5 rounded-xl bg-white/[0.02]">
							<p class="text-muted-foreground italic">No data available for {sym}</p>
						</div>
					{/if}
				{/each}
				
				{#if selectedSymbols.length === 0}
					<div class="p-20 text-center border border-white/10 border-dashed rounded-xl bg-white/[0.02]">
						<p class="text-muted-foreground">Select one or more symbols to view lookup tables</p>
					</div>
				{/if}
			</div>
		{:else}
			{#if graphData}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#if combined}
						<div class="md:col-span-2">
							<OIChart data={graphData.data} type="Combined" {oiOption} {combined} />
						</div>
					{:else}
						<OIChart data={graphData.data} type="CE" {oiOption} {combined} />
						<OIChart data={graphData.data} type="PE" {oiOption} {combined} />
					{/if}
				</div>
			{:else}
				<div class="p-20 text-center border border-white/5 rounded-xl bg-white/[0.02]">
					<p class="text-muted-foreground animate-pulse">Initializing trend charts...</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
