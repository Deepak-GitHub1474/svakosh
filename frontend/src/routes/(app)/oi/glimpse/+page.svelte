<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import Header from './_components/Header.svelte';
	import Table from './_components/Table.svelte';
	import { OI_SYMBOLS } from './_lib/const';
	import type { TTimeFrame, TGlimpseSymbolDetail, TOISideGlimpse } from './_lib/types';
	import { trackSymbols, type SymbolOI } from '$lib/market/oi.svelte';
	import { GLIMPSE_BUCKETS, minutesOf, writingUnwinding } from '$lib/market/oi';
	import { roundLakh } from '$lib/utils';

	let time = $state<TTimeFrame>('3 Min');
	let expiry = $state('CURRENT_WEEK');

	const tracker = trackSymbols(1, 31);
	let sources = $state.raw<SymbolOI[]>([]);

	$effect(() => {
		sources = tracker.sync(OI_SYMBOLS, expiry);
	});

	function detailOf(source: SymbolOI | undefined): TGlimpseSymbolDetail {
		const minutes = minutesOf(time);
		const side = (name: 'CE' | 'PE') =>
			Object.fromEntries(
				GLIMPSE_BUCKETS.map((bucket) => [
					bucket.name,
					writingUnwinding(source ? source.bucket(name, bucket) : [], minutes)
				])
			) as unknown as TOISideGlimpse;
		const CE = side('CE');
		const PE = side('PE');
		const Overall = Object.fromEntries(
			GLIMPSE_BUCKETS.map(({ name }) => {
				const key = name as keyof TOISideGlimpse;
				const writing = roundLakh(PE[key].Writing - CE[key].Writing);
				const unwinding = roundLakh(PE[key].Unwinding - CE[key].Unwinding);
				return [name, { Writing: writing, Unwinding: unwinding, Net: roundLakh(writing - unwinding) }];
			})
		) as unknown as TOISideGlimpse;
		return { CE, PE, Overall };
	}

	const currentExpiryData = $derived(
		Object.fromEntries(
			OI_SYMBOLS.map((symbol) => [
				symbol,
				{ [time]: detailOf(sources.find((source) => source.underlying === symbol)) }
			])
		) as Record<string, Record<TTimeFrame, TGlimpseSymbolDetail>>
	);

	function handleTimeChange(val: TTimeFrame) {
		time = val;
	}

	function handleExpiryChange(val: string) {
		expiry = val;
	}

	onDestroy(() => tracker.stop());
</script>

<svelte:head>
	<title>OI Glimpse | SvaKosh</title>
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
		class="grid grid-cols-1 lg:grid-cols-2 gap-6"
	>
		{#each OI_SYMBOLS as symbol}
			<Table 
				{symbol} 
				data={currentExpiryData[symbol][time]}
			/>
		{/each}
	</div>
</div>
