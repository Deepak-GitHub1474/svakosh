<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { BREAKOUT_DATA } from './_lib/mock-data';
	import { filterBreakouts, sortBreakouts } from './_lib/helper';
	import type { TBreakoutFilters, TSortConfig, TSortKey, TVolumeBreakout } from './_lib/types';

	import Header from './_components/Header.svelte';
	import Table from './_components/Table.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';

	let search = $state('');
	let breakouts = $state<TVolumeBreakout[]>(BREAKOUT_DATA);
	let sortConfig = $state<TSortConfig>({ key: 'timestamp', direction: 'desc' });

	const filteredBreakouts = $derived.by(() => {
		const filters: TBreakoutFilters = { search };
		const result = filterBreakouts(breakouts, filters);
		return sortBreakouts(result, sortConfig);
	});

	const stats = $derived.by(() => {
		return {
			total: filteredBreakouts.length,
			bullish: filteredBreakouts.filter((b) => b.p_change >= 0).length,
			bearish: filteredBreakouts.filter((b) => b.p_change < 0).length
		};
	});

	function handleSort(key: TSortKey) {
		if (sortConfig.key === key) {
			sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
		} else {
			sortConfig.key = key;
			sortConfig.direction = 'desc';
		}
	}

	// Simulated Auto-refresh logic to mimic live breakout alerts
	onMount(() => {
		const interval = setInterval(() => {
			breakouts = breakouts.map((b) => ({
				...b,
				ltp: b.ltp + (Math.random() - 0.5) * 5,
				p_change: b.p_change + (Math.random() - 0.5) * 0.1
			}));
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Volume Breakout | SvaKosh</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<Header {stats} />

	<div class="mb-6">
		<div class="w-full lg:w-96">
			<SvaKoshInput
				id="search"
				bind:value={search}
				placeholder="Search by Symbol or Name..."
				class="w-full py-[0.8rem]"
				clearable={true}
			/>
		</div>
	</div>

	<div in:fade={{ delay: 200 }}>
		<Table
			breakouts={filteredBreakouts}
			{sortConfig}
			onSort={handleSort}
		/>
	</div>
</div>
