<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import ExitAllModal from '$lib/components/trade/ExitAllModal.svelte';
	import InstrumentCell from '$lib/components/trade/InstrumentCell.svelte';
	import AccountCell from '$lib/components/trade/AccountCell.svelte';
	import PositionModal from '$lib/components/trade/PositionModal.svelte';
	import RowActions from '$lib/components/trade/RowActions.svelte';
	import SortHeader from '$lib/components/trade/SortHeader.svelte';
	import StatStrip from '$lib/components/trade/StatStrip.svelte';
	import TradeTable from '$lib/components/trade/TradeTable.svelte';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { TABLE } from '$lib/trade/const';
	import { compact, compactSigned, percent, signed, tone } from '$lib/trade/format';
	import { instrumentNames } from '$lib/trade/names.svelte';
	import { tradeResource, type TAccountRow } from '$lib/trade/resource.svelte';
	import { getHoldings } from '$lib/trade/service';
	import { nextSort, sortBy, type TSortDir } from '$lib/trade/sort';
	import type { TExitTarget, THolding } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	type TRow = TAccountRow<THolding>;

	const holdings = tradeResource<THolding>(getHoldings);

	let selected = $state<string[]>([]);
	let exitTarget = $state<TExitTarget | null>(null);
	let exitOpen = $state(false);
	let bulk = $state<TExitTarget[]>([]);
	let bulkOpen = $state(false);
	let pnlSort = $state<TSortDir>('');

	const keyOf = (h: TRow) => `${h.account.id}:${h.isin || h.symbol}`;
	const quantity = (h: THolding) => h.quantity + h.t1_quantity;
	const ltpOf = (h: THolding) => (h.token && marketFeed.quotes[h.token]?.ltp) || h.last_price;
	const prevOf = (h: THolding) =>
		(h.token && marketFeed.quotes[h.token]?.prev_close) || h.close_price;

	const rows = $derived(
		sortBy(
			[...holdings.data].sort(
				(a, b) => a.symbol.localeCompare(b.symbol) || keyOf(a).localeCompare(keyOf(b))
			),
			pnlSort,
			(h) => (ltpOf(h) - h.average_price) * quantity(h)
		)
	);
	const tokens = $derived(
		[...new Set(holdings.data.flatMap((h) => (h.token ? [h.token] : [])))].sort().join(',')
	);
	const invested = $derived(
		holdings.data.reduce((sum, h) => sum + h.average_price * quantity(h), 0)
	);
	const current = $derived(holdings.data.reduce((sum, h) => sum + ltpOf(h) * quantity(h), 0));
	const pnl = $derived(current - invested);
	const day = $derived(
		holdings.data.reduce((sum, h) => sum + (ltpOf(h) - prevOf(h)) * quantity(h), 0)
	);
	const exitable = $derived(holdings.data.filter((h) => h.token && quantity(h) > 0));
	const picked = $derived(exitable.filter((h) => selected.includes(keyOf(h))));
	const allPicked = $derived(!!exitable.length && picked.length === exitable.length);
	const partial = $derived(picked.length > 0 && !allPicked);

	$effect(() => {
		if (!tokens) return;
		instrumentNames.want(tokens.split(','));
		return marketFeed.subscribe(tokens.split(','));
	});

	$effect(() => {
		const keys = new Set(exitable.map(keyOf));
		if (selected.some((k) => !keys.has(k))) selected = selected.filter((k) => keys.has(k));
	});

	function target(h: TRow, mode: TExitTarget['mode'] = 'exit'): TExitTarget {
		return {
			mode,
			account_id: h.account.id,
			token: h.token ?? '',
			symbol: h.symbol,
			exchange: h.exchange,
			product: 'CNC',
			quantity: quantity(h),
			ltp: ltpOf(h)
		};
	}

	function openExit(h: TRow, mode: TExitTarget['mode']) {
		exitTarget = target(h, mode);
		exitOpen = true;
	}

	function openBulk() {
		bulk = picked.map((h) => target(h));
		bulkOpen = true;
	}

	function toggle(h: TRow) {
		const key = keyOf(h);
		selected = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
	}

	function toggleAll() {
		selected = allPicked ? [] : exitable.map(keyOf);
	}

	function done() {
		selected = [];
		holdings.reload();
	}
</script>

<StatStrip
	class="mb-4 shrink-0"
	stats={[
		{ label: 'Invested', value: formatNumber(invested), compact: compact(invested) },
		{ label: 'Current', value: formatNumber(current), compact: compact(current) },
		{
			label: 'Total P&L',
			value: `${signed(pnl)} (${percent(pnl, invested).toFixed(2)}%)`,
			compact: `${compactSigned(pnl)} (${percent(pnl, invested).toFixed(1)}%)`,
			tone: tone(pnl)
		},
		{ label: "Day's P&L", value: signed(day), compact: compactSigned(day), tone: tone(day) }
	]}
/>

<TradeTable
	empty={!holdings.data.length}
	loading={holdings.loading}
	error={holdings.error}
	emptyTitle="No holdings"
	emptyDescription="Shares in your demat account show here."
	onRetry={holdings.reload}
>
	{#snippet head()}
		<th class="{TABLE.th} w-10">
			<input
				type="checkbox"
				aria-label="Select all holdings"
				class={TABLE.check}
				checked={allPicked}
				disabled={!exitable.length}
				onchange={toggleAll}
				{@attach (node) => {
					node.indeterminate = partial;
				}}
			/>
		</th>
		<th class={TABLE.th}>Account</th>
		<th class={TABLE.th}>Instrument</th>
		<th class="{TABLE.th} text-right">Qty</th>
		<th class="{TABLE.th} text-right">Avg</th>
		<th class="{TABLE.th} text-right">LTP</th>
		<th class="{TABLE.th} text-right">Current</th>
		<SortHeader
			label="P&L"
			dir={pnlSort}
			onToggle={() => (pnlSort = nextSort(pnlSort))}
			class="text-right"
		/>
		<th class="{TABLE.th} text-right">Day</th>
		<th class="{TABLE.th} w-px text-right">Actions</th>
	{/snippet}
	{#snippet body()}
		{#each rows as h (keyOf(h))}
			{@const ltp = ltpOf(h)}
			{@const value = ltp * quantity(h)}
			{@const gain = value - h.average_price * quantity(h)}
			{@const dayGain = (ltp - prevOf(h)) * quantity(h)}
			<tr class={TABLE.row}>
				<td class={TABLE.td}>
					{#if h.token}
						<input
							type="checkbox"
							aria-label="Select {h.symbol}"
							class={TABLE.check}
							checked={selected.includes(keyOf(h))}
							onchange={() => toggle(h)}
						/>
					{/if}
				</td>
				<AccountCell account={h.account} />
				<InstrumentCell token={h.token} symbol={h.symbol} />
				<td class="{TABLE.td} text-right">
					{quantity(h)}
					{#if h.t1_quantity}<span class="text-muted-foreground ml-1 text-xs"
							>T1 {h.t1_quantity}</span
						>{/if}
				</td>
				<td class="{TABLE.td} text-right">{formatNumber(h.average_price)}</td>
				<td class="{TABLE.td} text-right">{formatNumber(ltp)}</td>
				<td class="{TABLE.td} text-right">{formatNumber(value)}</td>
				<td class="{TABLE.td} text-right {tone(gain)}">
					{signed(gain)}
					<span class="block text-xs opacity-70"
						>{percent(gain, h.average_price * quantity(h)).toFixed(2)}%</span
					>
				</td>
				<td class="{TABLE.td} text-right {tone(dayGain)}">{signed(dayGain)}</td>
				<td class="{TABLE.td} text-right">
					{#if h.token}
						<RowActions onAction={(mode) => openExit(h, mode)} />
					{/if}
				</td>
			</tr>
		{/each}
	{/snippet}
</TradeTable>

<div class="mt-4 flex shrink-0 justify-end">
	<SvaKoshButton
		variant="solid"
		label={`Square off (${picked.length})`}
		class="min-w-44 justify-center px-6 py-2.5 text-sm tabular-nums"
		disabled={!picked.length}
		onclick={openBulk}
	/>
</div>

<PositionModal bind:isOpen={exitOpen} target={exitTarget} onDone={done} />
<ExitAllModal bind:isOpen={bulkOpen} targets={bulk} noun="holding" onDone={done} />
