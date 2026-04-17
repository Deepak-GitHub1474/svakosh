<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import Header from './_components/Header.svelte';
	import TrackerTable from './_components/TrackerTable.svelte';
	import TrackerChart from './_components/TrackerChart.svelte';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import { LOADED_TRACKER_DATA, generateTrackerGraphData } from './_lib/mock-data';
	import { roundLakh } from '$lib/utils';
	import type { TFullTrackerData, TTrackerTimeframe } from './_lib/types';

	let activeTab = $state<'tables' | 'graphs'>(page.url.searchParams.get('tab') as any || 'tables');
	let expiry = $state('CURRENT_WEEK');
	let selectedSymbols = $state<string[]>(['NIFTY']);
	
	let trackerData = $state<TFullTrackerData>(JSON.parse(JSON.stringify(LOADED_TRACKER_DATA)));
	let graphData = $state<Record<string, any>>({});

	let oiOption = $state('Total OI');
	let combined = $state(false);

	const currentExpiryData = $derived(trackerData[expiry] || trackerData['CURRENT_WEEK']);

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

	function handleSymbolsChange(symbols: string[]) {
		selectedSymbols = symbols;
		if (activeTab === 'graphs') {
			refreshGraphData();
		}
	}

	function refreshGraphData() {
		const newGraphData: Record<string, any> = {};
		selectedSymbols.forEach(sym => {
			newGraphData[sym] = generateTrackerGraphData(sym, expiry);
		});
		graphData = newGraphData;
	}

	$effect(() => {
		if (activeTab === 'graphs') {
			refreshGraphData();
		}
	});

	let interval: any;
	$effect(() => {
		interval = setInterval(() => {
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
		}, 2000);

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
		{oiOption}
		onOiOptionChange={(val) => { oiOption = val; refreshGraphData(); }}
		{combined}
		onCombinedChange={(val) => { combined = val; refreshGraphData(); }}
	/>

	<div in:fade={{ delay: 200 }} class="mt-4">
		{#if activeTab === 'tables'}
			<div class="flex flex-col gap-4">
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
						<p class="text-muted-foreground italic">Select one or more symbols to view tracker data</p>
					</div>
				{/if}
			</div>
		{:else}
			{#if selectedSymbols.length > 0}
				<div class="flex flex-col gap-4">
					{#each selectedSymbols as sym}
						{#if graphData[sym]}
							<div class="flex flex-col gap-4">
								{#if combined}
									<div class="w-full">
										<TrackerChart 
											timestamps={graphData[sym].timestamps} 
											data={graphData[sym].data} 
											type="Combined" 
											{oiOption}
											{combined}
											onRefresh={refreshGraphData}
										/>
									</div>
								{:else}
									<div class="grid grid-cols-1 2xl:grid-cols-2 gap-6 min-h-[500px]">
										<TrackerChart 
											timestamps={graphData[sym].timestamps} 
											data={graphData[sym].data.CE} 
											type="CE" 
											{oiOption}
											{combined}
											onRefresh={refreshGraphData}
										/>
										<TrackerChart 
											timestamps={graphData[sym].timestamps} 
											data={graphData[sym].data.PE} 
											type="PE" 
											{oiOption}
											{combined}
											onRefresh={refreshGraphData}
										/>
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
				<div class="p-20 text-center border border-white/10 border-dashed rounded-xl bg-white/[0.02]">
					<p class="text-muted-foreground">Select one or more symbols to view trend charts</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
