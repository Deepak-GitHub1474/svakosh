<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { LOOKUP_TIMEFRAMES } from './_lib/const';
	import type { TSymbolLookupDetail } from './_lib/types';
	import { trackSymbols, type SymbolOI } from '$lib/market/oi.svelte';
	import {
		LOOKUP_BUCKETS,
		TRACKER_BUCKETS,
		bucketMetrics,
		dayStart,
		lakh,
		timeline,
		totalAt
	} from '$lib/market/oi';
	import { istTime } from '$lib/market/time';
	import Header from './_components/Header.svelte';
	import LookupTable from './_components/LookupTable.svelte';
	import OIChart from './_components/OIChart.svelte';

	let activeTab = $state<'tables' | 'graphs'>(page.url.searchParams.get('tab') as any || 'tables');
	let expiry = $state('CURRENT_WEEK');
	let selectedSymbols = $state<string[]>(['NIFTY']);
	let oiOption = $state('Total OI');
	let combined = $state(false);

	const tracker = trackSymbols(3);
	let sources = $state.raw<SymbolOI[]>([]);

	$effect(() => {
		sources = tracker.sync(selectedSymbols, expiry);
	});

	const currentExpiryData = $derived(
		Object.fromEntries(
			sources.map((source) => {
				const detail = { CE: {}, PE: {} } as TSymbolLookupDetail;
				for (const side of ['CE', 'PE'] as const) {
					for (const bucket of LOOKUP_BUCKETS) {
						detail[side][bucket.name] = bucketMetrics(
							source.bucket(side, bucket),
							LOOKUP_TIMEFRAMES
						) as TSymbolLookupDetail['CE'][string];
					}
				}
				return [source.underlying, detail];
			})
		)
	);

	const graphData = $derived(
		activeTab !== 'graphs'
			? {}
			: Object.fromEntries(
					sources.map((source) => {
						const stamps = timeline([...source.legs('CE'), ...source.legs('PE')]);
						const data: Record<string, Record<'CE' | 'PE', Record<string, { Total: number; Day: number }>>> = {};
						for (const ts of stamps) {
							const point = { CE: {}, PE: {} } as Record<'CE' | 'PE', Record<string, { Total: number; Day: number }>>;
							for (const side of ['CE', 'PE'] as const) {
								for (const bucket of TRACKER_BUCKETS) {
									const legs = source.bucket(side, bucket);
									const total = totalAt(legs, ts);
									point[side][bucket.name] = { Total: lakh(total), Day: lakh(total - dayStart(legs)) };
								}
							}
							data[istTime(ts)] = point;
						}
						return [source.underlying, { data }];
					})
				)
	);

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
	}

	function refreshGraphData() {
		sources.forEach((source) => source.refresh());
	}

	onDestroy(() => tracker.stop());
</script>

<svelte:head>
	<title>OI Lookup | SvaKosh</title>
</svelte:head>

<div class="bg-background text-foreground">
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
						<div class="p-10 text-center border border-border-subtle rounded-xl bg-white/[0.01]">
							<p class="text-muted-foreground italic">No data available for {sym}</p>
						</div>
					{/if}
				{/each}
				
				{#if selectedSymbols.length === 0}
					<div class="p-20 text-center border border-border-muted border-dashed rounded-xl bg-white/[0.01]">
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
							<div class="p-20 text-center border border-border-subtle rounded-xl bg-white/[0.02] flex items-center justify-center">
								<div class="flex flex-col items-center gap-4">
									<div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
									<p class="text-muted-foreground animate-pulse italic text-xs uppercase tracking-widest">Loading trend data for {sym}...</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="p-20 text-center border border-border-muted border-dashed rounded-xl bg-white/[0.01]">
					<p class="text-muted-foreground">Select one or more symbols to view trend charts</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
