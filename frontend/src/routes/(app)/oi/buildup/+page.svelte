<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { OI_SYMBOLS } from './_lib/const';
	import type { TTimeFrame, TOISymbolDetail } from './_lib/types';
	import { trackSymbols, type SymbolOI } from '$lib/market/oi.svelte';
	import { minutesOf, topChanges } from '$lib/market/oi';
	import Header from './_components/Header.svelte';
	import OISnapTable from './_components/OISnapTable.svelte';

	const TOP_STRIKES = 7;

	let time = $state<TTimeFrame>('3 Min');
	let expiry = $state('CURRENT_WEEK');

	const tracker = trackSymbols(1, 31);
	let sources = $state.raw<SymbolOI[]>([]);

	$effect(() => {
		sources = tracker.sync(OI_SYMBOLS, expiry);
	});

	const recdData = $derived(
		Object.fromEntries(
			OI_SYMBOLS.map((symbol) => {
				const source = sources.find((entry) => entry.underlying === symbol);
				const minutes = minutesOf(time);
				const detail: TOISymbolDetail = {
					CE: topChanges(source ? source.legs('CE') : [], minutes, TOP_STRIKES),
					PE: topChanges(source ? source.legs('PE') : [], minutes, TOP_STRIKES)
				};
				return [symbol, { [time]: detail }];
			})
		) as Record<string, Record<TTimeFrame, TOISymbolDetail>>
	);

	function handleTimeChange(newTime: TTimeFrame) {
		time = newTime;
	}

	function handleExpiryChange(newExpiry: string) {
		expiry = newExpiry;
	}

	onDestroy(() => tracker.stop());
</script>

<svelte:head>
	<title>OI Buildup | SvaKosh</title>
</svelte:head>

<div class="bg-background text-foreground">
	<Header
		{time} 
		{expiry} 
		onTimeChange={handleTimeChange} 
		onExpiryChange={handleExpiryChange}
	/>

	<div 
		in:fade={{ delay: 200 }}
		class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6"
	>
		{#each OI_SYMBOLS as symbol}
			<OISnapTable 
				{symbol} 
				data={recdData[symbol][time]} 
			/>
		{/each}
	</div>
</div>
