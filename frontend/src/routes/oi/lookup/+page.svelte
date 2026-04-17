<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { LOADED_LOOKUP_DATA, generateGraphData } from './_lib/mock-data';
	import type { TFullLookupData } from './_lib/types';
	import { roundLakh } from '$lib/utils';
	import Header from './_components/Header.svelte';
	import LookupTable from './_components/LookupTable.svelte';
	import OIChart from './_components/OIChart.svelte';

	let activeTab = $state<'tables' | 'graphs'>(page.url.searchParams.get('tab') as any || 'tables');
	let expiry = $state('CURRENT_WEEK');
	let selectedSymbols = $state<string[]>(['NIFTY']);
	
	let tableData = $state<TFullLookupData>(JSON.parse(JSON.stringify(LOADED_LOOKUP_DATA)));
	let graphData = $state<Record<string, any>>({});

	let oiOption = $state('Total OI');
	let combined = $state(false);

	const currentExpiryData = $derived(tableData[expiry] || tableData['CURRENT_WEEK']);

	function handleTabChange(tab: 'tables' | 'graphs') {
		const url = new URL(page.url);
		url.searchParams.set('tab', tab);
		goto(url.href, { replaceState: true, noScroll: true });
	}

	$effect(() => {
		const tab = page.url.searchParams.get('tab') as 'tables' | 'graphs';
		if (tab && tab !== activeTab) {
			activeTab = tab;
		}
	});

	$effect(() => {
		if (activeTab === 'graphs') {
			refreshGraphData();
		}
	});

	function handleSymbolsChange(symbols: string[]) {
		selectedSymbols = symbols;
		if (activeTab === 'graphs') {
			refreshGraphData();
		}
	}

	function refreshGraphData() {
		const newGraphData: Record<string, any> = {};
		selectedSymbols.forEach(sym => {
			newGraphData[sym] = generateGraphData(sym, expiry);
		});
		graphData = newGraphData;
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
		}, 10000);

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

	<div in:fade={{ delay: 200 }} class="mt-4">
		{#if activeTab === 'tables'}
			<div class="flex flex-col gap-4">
				{#each selectedSymbols as sym}
					{#if currentExpiryData[sym]}
						<LookupTable symbol={sym} data={currentExpiryData[sym]} />
					{:else}
						<div class="p-10 text-center border border-white/5 rounded-xl bg-white/[0.01]">
							<p class="text-muted-foreground italic">No data available for {sym}</p>
						</div>
					{/if}
				{/each}
				
				{#if selectedSymbols.length === 0}
					<div class="p-20 text-center border border-white/10 border-dashed rounded-xl bg-white/[0.01]">
						<p class="text-muted-foreground">Select one or more symbols to view lookup tables</p>
					</div>
				{/if}
			</div>
		{:else}
			{#if selectedSymbols.length > 0}
				<div class="flex flex-col gap-8">
					{#each selectedSymbols as sym}
						{#if graphData[sym]}
							<div class="flex flex-col gap-4">
								{#if combined}
									<div class="w-full">
										<OIChart data={graphData[sym].data} {sym} type="Combined" {oiOption} {combined} onRefresh={refreshGraphData} />
									</div>
								{:else}
									<div class="grid grid-cols-1 2xl:grid-cols-2 gap-6">
										<OIChart data={graphData[sym].data} {sym} type="CE" {oiOption} {combined} onRefresh={refreshGraphData} />
										<OIChart data={graphData[sym].data} {sym} type="PE" {oiOption} {combined} onRefresh={refreshGraphData} />
									</div>
								{/if}
							</div>
						{:else}
							<div class="p-20 text-center border border-white/5 rounded-xl bg-white/[0.02] flex items-center justify-center">
								<div class="flex flex-col items-center gap-4">
									<div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
									<p class="text-muted-foreground animate-pulse italic text-xs uppercase tracking-widest">Loading trend data for {sym}...</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="p-20 text-center border border-white/10 border-dashed rounded-xl bg-white/[0.01]">
					<p class="text-muted-foreground">Select one or more symbols to view trend charts</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
