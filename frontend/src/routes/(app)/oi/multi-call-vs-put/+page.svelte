<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { MultiOIDataMap } from './_lib/types';
	import { SYMBOLS as symbols, EXPIRIES as expiries } from '$lib/utils/const';
	import { aggregateStrikeData } from './_lib/helper';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { ChainSource } from '$lib/market/chain.svelte';
	import { TodayBars } from '$lib/market/bars.svelte';
	import { oiByTime, withLive } from '$lib/market/series';
	import { nearestIndex, windowAround } from '$lib/market/options';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshMultiSelector from '$lib/components/svakosh/SvaKoshMultiSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshBadge from '$lib/components/svakosh/SvaKoshBadge.svelte';
	import MultiCallVsPutChart from './_components/MultiCallVsPutChart.svelte';

	let selectedSymbol = $state('NIFTY');
	let selectedExpiry = $state('CURRENT_WEEK');
	let selectedCallStrikes = $state<string[]>([]);
	let selectedPutStrikes = $state<string[]>([]);
	let chartType = $state<'line' | 'bar'>(page.url.searchParams.get('type') as any || 'line');
	
	const INTERVAL = 5;
	const source = new ChainSource();
	const bars = new TodayBars();
	const expiry = $derived(source.view ? source.expiry(selectedExpiry) : '');
	const allStrikes = $derived(expiry ? source.strikes(expiry) : []);
	const hasSpot = $derived(source.spot > 0);
	const atmIndex = $derived(nearestIndex(allStrikes, source.spot));
	const atmStrike = $derived(hasSpot ? (allStrikes[atmIndex] ?? 0) : 0);
	const windowStrikes = $derived(hasSpot ? windowAround(allStrikes, atmIndex) : []);
	const picked = $derived([...new Set([...selectedCallStrikes, ...selectedPutStrikes])].map(Number));

	const rawStrikeData = $derived(
		Object.fromEntries(
			picked.map((strike) => {
				const ce = source.token(expiry, strike, 'CE');
				const pe = source.token(expiry, strike, 'PE');
				return [
					String(strike),
					oiByTime(
						withLive(bars.data[ce], marketFeed.quotes[ce], INTERVAL),
						withLive(bars.data[pe], marketFeed.quotes[pe], INTERVAL)
					)
				];
			})
		)
	);
	const aggregatedData: MultiOIDataMap = $derived(
		aggregateStrikeData(rawStrikeData, selectedCallStrikes, selectedPutStrikes)
	);

	$effect(() => {
		if (atmStrike && selectedCallStrikes.length === 0 && selectedPutStrikes.length === 0) {
			selectedCallStrikes = [String(atmStrike)];
			selectedPutStrikes = [String(atmStrike)];
		}
	});

	$effect(() => {
		if (!source.view) return;
		return marketFeed.subscribe([source.view.spot]);
	});

	$effect(() => {
		if (!expiry || picked.length === 0) return;
		return marketFeed.subscribe(
			picked.flatMap((strike) => [source.token(expiry, strike, 'CE'), source.token(expiry, strike, 'PE')]),
			['ltp', 'oi']
		);
	});

	function fetchData() {
		if (expiry) void bars.load(source.subject, source.optionPrefix(expiry), INTERVAL);
	}

	$effect(fetchData);
	
	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);
	let isCallStrikesOpen = $state(false);
	let isPutStrikesOpen = $state(false);

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

	$effect(() => {
		const url = new URL(page.url);
		if (url.searchParams.get('type') !== chartType) {
			url.searchParams.set('type', chartType);
			goto(url.href, { replaceState: true, noScroll: true });
		}
	});


	let strikeOptions = $derived(windowStrikes.map((s) => ({ label: String(s), value: String(s) })));

	function handleSymbolChange(val: string) {
		selectedSymbol = val;
		selectedCallStrikes = [];
		selectedPutStrikes = [];
		void source.load(val);
	}

	onMount(() => {
		void source.load(selectedSymbol);
	});

	onDestroy(() => {
		source.stop();
		bars.stop();
	});
</script>

<svelte:head>
	<title>Multi OI Call vs Put | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<header>
			<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
				Multi Call vs Put OI Analysis
			</h1>
			<p class="text-muted-foreground text-sm">Cumulative Open Interest trend for multiple strike selections</p>
		</header>

		<div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
			<div class="flex items-center gap-3 w-full sm:w-auto">
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
			</div>
			<div class="flex items-center gap-3 w-full sm:w-auto">
				<div class="w-full sm:w-36">
					<SvaKoshMultiSelector 
						options={strikeOptions} 
						bind:value={selectedCallStrikes} 
						bind:isOpen={isCallStrikesOpen}
						searchable={true}
						placeholder="Call Strikes"
					/>
				</div>
				<div class="w-full sm:w-36">
					<SvaKoshMultiSelector 
						options={strikeOptions} 
						bind:value={selectedPutStrikes} 
						bind:isOpen={isPutStrikesOpen}
						searchable={true}
						placeholder="Put Strikes"
					/>
				</div>
			</div>
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
				bind:chartType
				onRefresh={fetchData}
			/>
		{:else}
			<SvaKoshCard class="h-[542px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em]">Calculating Aggregations...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
