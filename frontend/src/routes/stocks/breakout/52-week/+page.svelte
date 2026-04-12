<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { BREAKOUT_52W_DATA } from './_lib/mock-data';
	import { filter52WeekBreakouts, sort52WeekBreakouts } from './_lib/helper';
	import type { TBreakoutFilters, TSortConfig, TSortKey, T52WeekBreakout } from './_lib/types';

	import Header from './_components/Header.svelte';
	import Table from './_components/Table.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';

	let search = $state('');
	let breakouts = $state<T52WeekBreakout[]>(BREAKOUT_52W_DATA);
	let sortConfig = $state<TSortConfig>({ key: 'timestamp', direction: 'desc' });

	const filteredBreakouts = $derived.by(() => {
		const filters: TBreakoutFilters = { search };
		const result = filter52WeekBreakouts(breakouts, filters);
		return sort52WeekBreakouts(result, sortConfig);
	});

	const stats = $derived.by(() => {
		return {
			total: filteredBreakouts.length,
			highs: filteredBreakouts.filter((b) => b.type === 'High').length,
			lows: filteredBreakouts.filter((b) => b.type === 'Low').length
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
				p_change: b.p_change + (Math.random() - 0.5) * 0.1,
				change_identified: b.change_identified + (Math.random() - 0.5) * 0.05
			}));
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>52-Week Breakout | SvaKosh</title>
</svelte:head>

<div class="min-h-screen bg-background p-4 md:px-8 md:pb-8 text-foreground">
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
