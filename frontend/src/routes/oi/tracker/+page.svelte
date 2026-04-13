<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Header from './_components/Header.svelte';
	import TrackerTable from './_components/TrackerTable.svelte';
	import TrackerChart from './_components/TrackerChart.svelte';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import { LOADED_TRACKER_DATA, generateTrackerGraphData } from './_lib/mock-data';
	import { roundLakh } from '$lib/utils';
	import type { TFullTrackerData, TTrackerTimeframe } from './_lib/types';

	let activeTab = $state<'tables' | 'graphs'>('tables');
	let expiry = $state('CURRENT_WEEK');
	let selectedSymbols = $state<string[]>(['NIFTY']);
	
	let trackerData = $state<TFullTrackerData>(JSON.parse(JSON.stringify(LOADED_TRACKER_DATA)));
	let graphData = $state<any>(null);

	let combined = $state(false);

	const currentExpiryData = $derived(trackerData[expiry] || trackerData['CURRENT_WEEK']);

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
		graphData = generateTrackerGraphData(sym, expiry);
	}

	onMount(() => {
		const interval = setInterval(() => {
			if (activeTab === 'tables') {
				selectedSymbols.forEach(sym => {
					const detail = trackerData[expiry][sym];
					if (!detail) return;
					(['CE', 'PE'] as const).forEach(side => {
						const sideData = detail[side];
						Object.keys(sideData).forEach(cat => {
							const metrics = sideData[cat];
							(Object.keys(metrics) as TTrackerTimeframe[]).forEach(tf => {
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
	<title>OI Tracker | SvaKosh</title>
</svelte:head>

<div class="min-h-screen bg-background px-4 md:px-8 md:pb-8 text-foreground">
	<Header 
		{activeTab} 
		onTabChange={handleTabChange}
		{expiry}
		onExpiryChange={(val) => { expiry = val; if(activeTab === 'graphs') refreshGraphData(); }}
		{selectedSymbols}
		onSymbolsChange={handleSymbolsChange}
	/>

	<div in:fade={{ delay: 200 }} class="mt-6 flex flex-col gap-6">
		{#if activeTab === 'tables'}
			<div class="flex flex-col gap-8">
				{#each selectedSymbols as sym}
					{#if currentExpiryData[sym]}
						<TrackerTable symbol={sym} data={currentExpiryData[sym]} />
					{:else}
						<div class="p-20 text-center border border-white/5 rounded-xl bg-white/[0.02]">
							<p class="text-muted-foreground italic">No tracker data available for {sym}</p>
						</div>
					{/if}
				{/each}

				{#if selectedSymbols.length === 0}
					<div class="p-20 text-center border border-white/10 border-dashed rounded-xl bg-white/[0.02]">
						<p class="text-muted-foreground italic">Select indices from the header to view tracker data</p>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex items-center justify-end gap-3 mb-2 px-1">
				<div class="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
					<span class="text-xs text-muted-foreground uppercase tracking-widest">Combined View</span>
					<SvaKoshSwitch
						bind:checked={combined}
					/>
				</div>
			</div>

			{#if graphData}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
					{#if combined}
						<div class="md:col-span-2">
							<TrackerChart 
								timestamps={graphData.timestamps} 
								data={graphData.data} 
								type="Combined" 
								oiOption="Total"
								{combined}
							/>
						</div>
					{:else}
						<TrackerChart 
							timestamps={graphData.timestamps} 
							data={graphData.data.CE} 
							type="CE" 
							oiOption="Total"
							{combined}
						/>
						<TrackerChart 
							timestamps={graphData.timestamps} 
							data={graphData.data.PE} 
							type="PE" 
							oiOption="Total"
							{combined}
						/>
					{/if}
				</div>
			{:else}
				<div class="p-20 text-center border border-white/5 rounded-xl bg-white/[0.02] flex items-center justify-center">
					<div class="flex flex-col items-center gap-4">
						<div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
						<p class="text-muted-foreground animate-pulse">Initializing trend charts...</p>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
