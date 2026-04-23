<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { MultiOIDataMap } from './_lib/types';
	import { symbols, expiries, strikeDifferences } from './_lib/const';
	import { generateStrikeList, aggregateStrikeData } from './_lib/helper';
	import { generateMultiStrikeMockData, getBaseStrike } from './_lib/mock-data';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshMultiSelector from '$lib/components/svakosh/SvaKoshMultiSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshBadge from '$lib/components/svakosh/SvaKoshBadge.svelte';
	import MultiCallVsPutChart from './_components/MultiCallVsPutChart.svelte';

	let selectedSymbol = $state('NIFTY');
	let selectedExpiry = $state('CURRENT_WEEK');
	let selectedCallStrikes = $state<string[]>([]);
	let selectedPutStrikes = $state<string[]>([]);
	let atmStrike = $state(0);
	
	let rawStrikeData = $state<Record<string, any>>({});
	let aggregatedData = $state<MultiOIDataMap>({});
	let lastUpdated = $state<string>('');
	
	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);
	let isCallStrikesOpen = $state(false);
	let isPutStrikesOpen = $state(false);
	let intervalId: any;

	$effect(() => {
		if (isSymbolOpen) {
			isExpiryOpen = false;
			isCallStrikesOpen = false;
			isPutStrikesOpen = false;
		}
	});

	$effect(() => {
		if (isExpiryOpen) {
			isSymbolOpen = false;
			isCallStrikesOpen = false;
			isPutStrikesOpen = false;
		}
	});

	$effect(() => {
		if (isCallStrikesOpen) {
			isSymbolOpen = false;
			isExpiryOpen = false;
			isPutStrikesOpen = false;
		}
	});

	$effect(() => {
		if (isPutStrikesOpen) {
			isSymbolOpen = false;
			isExpiryOpen = false;
			isCallStrikesOpen = false;
		}
	});


	let strikeOptions = $derived.by(() => {
		if (atmStrike === 0) return [];
		const diff = strikeDifferences[selectedSymbol] || 100;
		const list = generateStrikeList(atmStrike, diff);
		return list.map(s => ({ label: String(s), value: String(s) }));
	});

	function fetchData() {
		let strikesToFetch = strikeOptions.map(o => o.value);
		
		if (strikesToFetch.length === 0 && atmStrike !== 0) {
			const diff = strikeDifferences[selectedSymbol] || 100;
			strikesToFetch = generateStrikeList(atmStrike, diff).map(String);
		}

		rawStrikeData = generateMultiStrikeMockData(selectedSymbol, strikesToFetch, selectedExpiry);
		updateAggregatedData();
		lastUpdated = new Date().toLocaleTimeString();
	}

	function updateAggregatedData() {
		aggregatedData = aggregateStrikeData(rawStrikeData, selectedCallStrikes, selectedPutStrikes);
	}

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		const initial = getBaseStrike(val);
		atmStrike = initial;
		selectedCallStrikes = [String(initial)];
		selectedPutStrikes = [String(initial)];
		fetchData();
	}

	function handleSelectionChange() {
		updateAggregatedData();
	}

	onMount(() => {
		const initial = getBaseStrike(selectedSymbol);
		atmStrike = initial;
		selectedCallStrikes = [String(initial)];
		selectedPutStrikes = [String(initial)];
		fetchData();

		intervalId = setInterval(() => {
			fetchData();
		}, 10000);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<svelte:head>
	<title>Multi OI Call vs Put | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<header>
		<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
			Multi Call vs Put OI Analysis
		</h1>
		<p class="text-muted-foreground text-sm">Cumulative Open Interest trend for multiple strike selections</p>
	</header>

	<div class="flex flex-wrap items-center justify-end gap-4">
		<div class="w-full sm:w-40">
			<SvaKoshSelector 
				options={symbols} 
				bind:value={selectedSymbol} 
				bind:isOpen={isSymbolOpen}
				onSelect={handleSymbolChange}
				placeholder="Symbol"
			/>
		</div>
		<div class="w-full sm:w-44">
			<SvaKoshSelector 
				options={expiries} 
				bind:value={selectedExpiry} 
				bind:isOpen={isExpiryOpen}
				onSelect={fetchData}
				placeholder="Expiry"
			/>
		</div>
		<div class="w-full sm:w-36">
			<SvaKoshMultiSelector 
				options={strikeOptions} 
				bind:value={selectedCallStrikes} 
				bind:isOpen={isCallStrikesOpen}
				onSelect={handleSelectionChange}
				searchable={true}
				placeholder="Call Strikes"
			/>
		</div>
		<div class="w-full sm:w-36">
			<SvaKoshMultiSelector 
				options={strikeOptions} 
				bind:value={selectedPutStrikes} 
				bind:isOpen={isPutStrikesOpen}
				onSelect={handleSelectionChange}
				searchable={true}
				placeholder="Put Strikes"
			/>
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl glass-panel border border-border-subtle bg-surface/5">
		<div class="flex items-center gap-1">
			<SvaKoshBadge label="CALL SELECTIONS:" variant="bullish" class="bg-transparent border-none" />
			<div class="flex flex-wrap gap-1.5">
				{#each selectedCallStrikes as s}
					<SvaKoshBadge label={s} variant="bullish" />
				{/each}
				{#if selectedCallStrikes.length === 0}
					<span class="text-[0.625rem] text-muted-foreground italic">None Selected (Showing All)</span>
				{/if}
			</div>
		</div>
		
		<div class="h-4 w-px bg-border-subtle hidden md:block mx-2"></div>
		
		<div class="flex items-center gap-1">
			<SvaKoshBadge label="PUT SELECTIONS:" variant="bearish" class="bg-transparent border-none" />
			<div class="flex flex-wrap gap-1.5">
				{#each selectedPutStrikes as s}
					<SvaKoshBadge label={s} variant="bearish" />
				{/each}
				{#if selectedPutStrikes.length === 0}
					<span class="text-[0.625rem] text-muted-foreground italic">None Selected (Showing All)</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="w-full">
		{#if Object.keys(aggregatedData).length > 0}
			<MultiCallVsPutChart 
				data={aggregatedData} 
				symbol={selectedSymbol} 
				selectedCallCount={selectedCallStrikes.length}
				selectedPutCount={selectedPutStrikes.length}
				onRefresh={fetchData}
			/>
		{:else}
			<SvaKoshCard class="h-[480px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em]">Calculating Aggregations...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
