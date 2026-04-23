<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { LOADED_OI_DATA } from './_lib/mock-data';
	import { OI_SYMBOLS } from './_lib/const';
	import { roundLakh } from '$lib/utils';
	import type { TTimeFrame, TFullOIData } from './_lib/types';

	import Header from './_components/Header.svelte';
	import OISnapTable from './_components/OISnapTable.svelte';

	let time = $state<TTimeFrame>('3 Min');
	let expiry = $state('CURRENT_WEEK');
	let recdData = $state<TFullOIData>(LOADED_OI_DATA['CURRENT_WEEK']);

	function handleTimeChange(newTime: TTimeFrame) {
		time = newTime;
	}

	function handleExpiryChange(newExpiry: string) {
		expiry = newExpiry;
		recdData = LOADED_OI_DATA[newExpiry];
	}

	onMount(() => {
		const interval = setInterval(() => {
			const currentExpiryData = LOADED_OI_DATA[expiry];

			OI_SYMBOLS.forEach(symbol => {
				const detail = currentExpiryData[symbol][time];
				(['CE', 'PE'] as const).forEach(side => {
					(['Writing', 'Unwinding'] as const).forEach(type => {
						detail[side][type].forEach(item => {
							item.OI = roundLakh(item.OI + (Math.random() - 0.5) * 0.1);
						});
					});
				});
			});
			
			recdData = { ...currentExpiryData };
		}, 3000);

		return () => clearInterval(interval);
	});
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
