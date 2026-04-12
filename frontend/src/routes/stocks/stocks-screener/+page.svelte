<script lang="ts">
	import { fade } from 'svelte/transition';
	import { STOCKS_DATA } from './_lib/mock-data';
	import { filterStocks, sortStocks } from './_lib/helper';
	import type { TScreenerFilters, TSortConfig, TSortKey } from './_lib/types';

	import ScreenerHeader from './_components/ScreenerHeader.svelte';
	import ScreenerTable from './_components/ScreenerTable.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';


	let search = $state('');
	let sortConfig = $state<TSortConfig>({ key: 'change_pct', direction: 'desc' });


	const filteredStocks = $derived.by(() => {
		const filters: TScreenerFilters = { search, sector: '', marketCapLevel: '' };
		const result = filterStocks(STOCKS_DATA, filters);
		return sortStocks(result, sortConfig);
	});

	const stats = $derived.by(() => {
		const total = filteredStocks.length;
		const gainers = filteredStocks.filter((s) => s.change > 0).length;
		const losers = filteredStocks.filter((s) => s.change < 0).length;
		return { total, gainers, losers };
	});

	function handleSort(key: TSortKey) {
		if (sortConfig.key === key) {
			sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
		} else {
			sortConfig.key = key;
			sortConfig.direction = 'desc';
		}
	}
</script>

<div class="min-h-screen bg-background p-4 md:px-8 md:pb-8 text-foreground">
	<ScreenerHeader {stats} />

	<div class="mb-6">
		<div class="w-full lg:w-96">
			<SvaKoshInput
				id="search"
				bind:value={search}
				placeholder="Search Stocks by Symbol or Name..."
				class="w-full py-[0.8rem]"
				clearable={true}
			/>
		</div>
	</div>

	<div in:fade={{ delay: 200 }}>
		<ScreenerTable stocks={filteredStocks} {sortConfig} onSort={handleSort} />
	</div>
</div>
