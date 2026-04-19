<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Header from './_components/Header.svelte';
	import Table from './_components/Table.svelte';
	import { OI_SYMBOLS } from './_lib/const';
	import { LOADED_GLIMPSE_DATA } from './_lib/mock-data';
	import type { TTimeFrame, TFullGlimpseData } from './_lib/types';

	let time = $state<TTimeFrame>('3 Min');
	let expiry = $state('CURRENT_WEEK');
	let currentData = $state<TFullGlimpseData>(JSON.parse(JSON.stringify(LOADED_GLIMPSE_DATA)));

	const currentExpiryData = $derived(currentData[expiry] || currentData['CURRENT_WEEK']);

	function handleTimeChange(val: TTimeFrame) {
		time = val;
	}

	function handleExpiryChange(val: string) {
		expiry = val;
	}

	import { roundLakh } from '$lib/utils';

	onMount(() => {
		const interval = setInterval(() => {
			OI_SYMBOLS.forEach(symbol => {
				const detail = currentData[expiry][symbol][time];
				(['CE', 'PE'] as const).forEach(side => {
					(['ATM', 'OTM', 'FOTM', 'ITM'] as const).forEach(cat => {
						const fluctuator = (Math.random() - 0.5) * 0.5;
						detail[side][cat].Writing = roundLakh(detail[side][cat].Writing + fluctuator);
						detail[side][cat].Unwinding = roundLakh(detail[side][cat].Unwinding - fluctuator);
						detail[side][cat].Net = roundLakh(detail[side][cat].Writing - detail[side][cat].Unwinding);
						
						detail.Overall[cat].Writing = roundLakh(detail.PE[cat].Writing - detail.CE[cat].Writing);
						detail.Overall[cat].Unwinding = roundLakh(detail.PE[cat].Unwinding - detail.CE[cat].Unwinding);
						detail.Overall[cat].Net = roundLakh(detail.Overall[cat].Writing - detail.Overall[cat].Unwinding);
					});
				});
			});
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>OI Glimpse | SvaKosh</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
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
