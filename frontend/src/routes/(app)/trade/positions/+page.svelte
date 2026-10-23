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
	import { compactSigned, signed, tone } from '$lib/trade/format';
	import { instrumentNames } from '$lib/trade/names.svelte';
	import { isExpired, positionPnl } from '$lib/trade/position';
	import { tradeResource, type TAccountRow } from '$lib/trade/resource.svelte';
	import { getPositions } from '$lib/trade/service';
	import { nextSort, sortBy, type TSortDir } from '$lib/trade/sort';
	import type { TExitTarget, TPosition } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	type TRow = TAccountRow<TPosition>;

	const positions = tradeResource<TPosition>(getPositions);

	let selected = $state<string[]>([]);
	let exitTarget = $state<TExitTarget | null>(null);
	let exitOpen = $state(false);
	let bulk = $state<TExitTarget[]>([]);
	let bulkOpen = $state(false);
	let pnlSort = $state<TSortDir>('');

	const keyOf = (p: TRow) =>
		`${p.account.id}:${p.token ?? `${p.exchange}:${p.symbol}`}:${p.product}`;
	const ltpOf = (p: TPosition) => (p.token ? marketFeed.quotes[p.token]?.ltp : undefined);
	const canExit = (p: TPosition) => !!p.token && p.quantity !== 0 && !isExpired(p.token);

	const tokens = $derived(
		[...new Set(positions.data.flatMap((p) => (p.token ? [p.token] : [])))].sort().join(',')
	);
	const rows = $derived(
		sortBy(
			[...positions.data].sort(
				(a, b) =>
					Number(!a.quantity) - Number(!b.quantity) ||
					a.symbol.localeCompare(b.symbol) ||
					keyOf(a).localeCompare(keyOf(b))
			),
			pnlSort,
			(p) => positionPnl(p, ltpOf(p))
		)
	);
	const pnls = $derived(rows.map((p) => positionPnl(p, ltpOf(p))));
	const total = $derived(pnls.reduce<number>((sum, v) => sum + (v ?? 0), 0));
	const exitable = $derived(rows.filter(canExit));
	const open = $derived(rows.filter((p) => p.quantity !== 0).length);
	const picked = $derived(exitable.filter((p) => selected.includes(keyOf(p))));
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

	function target(p: TRow, mode: TExitTarget['mode']): TExitTarget {
		return {
			mode,
			account_id: p.account.id,
			token: p.token ?? '',
			symbol: p.symbol,
			exchange: p.exchange,
			product: p.product,
			quantity: p.quantity,
			ltp: ltpOf(p) ?? 0
		};
	}

	function openExit(p: TRow, mode: TExitTarget['mode']) {
		exitTarget = target(p, mode);
		exitOpen = true;
	}

	function openBulk() {
		bulk = picked.map((p) => target(p, 'exit'));
		bulkOpen = true;
	}

	function toggle(p: TRow) {
		const key = keyOf(p);
		selected = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
	}

	function toggleAll() {
		selected = allPicked ? [] : exitable.map(keyOf);
	}

	function done() {
		selected = [];
		positions.reload();
	}
</script>

<StatStrip
	class="mb-4 shrink-0"
	stats={[
		{ label: 'Total P&L', value: signed(total), compact: compactSigned(total), tone: tone(total) },
		{ label: 'Open', value: String(open) }
	]}
/>

<TradeTable
	empty={!rows.length}
	loading={positions.loading}
	error={positions.error}
	emptyTitle="No positions"
	emptyDescription="Today's trades and positions carried overnight show here. Place an order from the Watchlist."
	onRetry={positions.reload}
>
	{#snippet head()}
		<th class="{TABLE.th} w-10">
			<input
				type="checkbox"
				aria-label="Select all open positions"
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
		<th class={TABLE.th}>Product</th>
		<th class="{TABLE.th} text-right">Qty</th>
		<th class="{TABLE.th} text-right">Avg</th>
		<th class="{TABLE.th} text-right">LTP</th>
		<SortHeader
			label="P&L"
			dir={pnlSort}
			onToggle={() => (pnlSort = nextSort(pnlSort))}
			class="text-right"
		/>
		<th class="{TABLE.th} w-px text-right">Actions</th>
	{/snippet}
	{#snippet body()}
		{#each rows as p, i (keyOf(p))}
			{@const pnl = pnls[i]}
			{@const ltp = ltpOf(p)}
			{@const expired = isExpired(p.token)}
			<tr class="{TABLE.row} {p.quantity ? '' : 'text-muted-foreground'}">
				<td class={TABLE.td}>
					{#if canExit(p)}
						<input
							type="checkbox"
							aria-label="Select {p.symbol}"
							class={TABLE.check}
							checked={selected.includes(keyOf(p))}
							onchange={() => toggle(p)}
						/>
					{/if}
				</td>
				<AccountCell account={p.account} />
				<InstrumentCell token={p.token} symbol={p.symbol}>
					{#if expired}
						<span class="text-muted-foreground ml-2 text-xs uppercase">Expired</span>
					{:else if p.quantity && p.overnight_quantity}
						<span class="text-primary ml-2 text-xs uppercase">Overnight</span>
					{/if}
				</InstrumentCell>
				<td class="{TABLE.td} text-muted-foreground">{p.product}</td>
				<td class="{TABLE.td} text-right {tone(p.quantity)}">{p.quantity}</td>
				<td class="{TABLE.td} text-right">{formatNumber(p.average_price)}</td>
				<td class="{TABLE.td} text-right">{ltp ? formatNumber(ltp) : '—'}</td>
				<td class="{TABLE.td} text-right {pnl === null ? '' : tone(pnl)}">
					{pnl === null ? '—' : signed(pnl)}
				</td>
				<td class="{TABLE.td} text-right">
					{#if canExit(p)}
						<RowActions onAction={(mode) => openExit(p, mode)} />
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
<ExitAllModal bind:isOpen={bulkOpen} targets={bulk} onDone={done} />
