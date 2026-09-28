<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { BRAND } from '$lib/brand';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import ChainTable from './_components/ChainTable.svelte';
	import OrderModal from './_components/OrderModal.svelte';
	import StrikeRangeStepper from './_components/StrikeRangeStepper.svelte';
	import { VIEW_TABS } from './_lib/const';
	import { daysToExpiry, expiryLabel } from './_lib/helper';
	import { chain, setExpiry, setSymbol, setView, startChain, stopChain } from './_lib/state.svelte';
	import type { TOrderDraft, TViewMode } from './_lib/types';

	let orderOpen = $state(false);
	let draft = $state<TOrderDraft | null>(null);
	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);

	onMount(() => {
		startChain();
		return stopChain;
	});

	const symbolOptions = $derived(chain.symbols.map((item) => ({ label: item, value: item })));

	const expiryOptions = $derived(
		chain.expiries.map((item) => ({
			label: expiryLabel(item),
			value: item,
			meta: `${daysToExpiry(item)}d`
		}))
	);

	function openOrder(strike: string, side: 'CE' | 'PE', transaction: 'BUY' | 'SELL') {
		const row = chain.data?.options_data[strike];
		const token = side === 'CE' ? row?.ce_token : row?.pe_token;
		if (!token) return;

		draft = {
			token,
			strike,
			side,
			transaction,
			orderType: 'Market',
			product: 'MIS',
			lots: 1,
			price: (side === 'CE' ? row?.ce_ltp : row?.pe_ltp) ?? 0,
			lotSize: chain.data?.lot_size ?? 1
		};
		orderOpen = true;
	}
</script>

<svelte:head>
	<title>Option Chain | {BRAND.name}</title>
</svelte:head>

<div class="bg-background text-foreground pt-2">
	<header class="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-center">
		<div in:fade>
			<h1 class="text-primary mb-1 text-2xl tracking-tight">Option Chain</h1>
			<p class="text-muted-foreground text-sm">Premiums, Open Interest and Greeks by Strike</p>
		</div>

		<div class="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center md:gap-4">
			<StrikeRangeStepper />

			<SvaKoshTabs
				tabs={VIEW_TABS}
				activeTab={chain.view}
				onTabChange={(value: TViewMode) => setView(value)}
				class="w-full md:w-auto [&>button]:flex-1 md:[&>button]:flex-none"
			/>

			<SvaKoshSelector
				options={symbolOptions}
				value={chain.symbol}
				bind:isOpen={isSymbolOpen}
				searchable={true}
				onSelect={setSymbol}
				class="w-full md:w-44"
			/>

			<SvaKoshSelector
				options={expiryOptions}
				value={chain.expiry}
				bind:isOpen={isExpiryOpen}
				onSelect={setExpiry}
				class="w-full md:w-44"
			/>
		</div>
	</header>

	{#if chain.error}
		<p class="border-bearish/40 text-bearish mb-4 rounded-lg border px-4 py-3 text-sm">
			{chain.error}
		</p>
	{/if}

	<ChainTable onorder={openOrder} />
</div>

<OrderModal bind:isOpen={orderOpen} {draft} />
