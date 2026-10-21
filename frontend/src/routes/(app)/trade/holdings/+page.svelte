<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import StatStrip from '$lib/components/trade/StatStrip.svelte';
	import { TABLE, EMPTY_STATE } from '$lib/trade/const';
	import { percent, signed, tone } from '$lib/trade/format';
	import { tradeResource } from '$lib/trade/resource.svelte';
	import { getHoldings } from '$lib/trade/service';
	import type { THolding } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	const holdings = tradeResource<THolding[]>(getHoldings, [], 30_000);

	const quantity = (h: THolding) => h.quantity + h.t1_quantity;
	const invested = $derived(
		holdings.data.reduce((sum, h) => sum + h.average_price * quantity(h), 0)
	);
	const current = $derived(holdings.data.reduce((sum, h) => sum + h.last_price * quantity(h), 0));
	const pnl = $derived(current - invested);
	const day = $derived(
		holdings.data.reduce((sum, h) => sum + (h.last_price - h.close_price) * quantity(h), 0)
	);
</script>

{#if holdings.loading && !holdings.data.length}
	<div class="relative h-40"><SvaKoshLoader inline message="" /></div>
{:else if holdings.error && !holdings.data.length}
	<EmptyState
		class={EMPTY_STATE}
		title="Could not load holdings"
		description={holdings.error}
		actionLabel="Retry"
		onAction={holdings.reload}
	/>
{:else if !holdings.data.length}
	<EmptyState
		class={EMPTY_STATE}
		title="No holdings"
		description="Shares in your demat account will show here."
	/>
{:else}
	<StatStrip
		stats={[
			{ label: 'Invested', value: formatNumber(invested) },
			{ label: 'Current', value: formatNumber(current) },
			{
				label: 'Total P&L',
				value: `${signed(pnl)} (${percent(pnl, invested).toFixed(2)}%)`,
				tone: tone(pnl)
			},
			{ label: "Day's P&L", value: signed(day), tone: tone(day) }
		]}
	/>
	<div class={TABLE.wrap}>
		<table class={TABLE.table}>
			<thead>
				<tr class={TABLE.head}>
					<th class={TABLE.th}>Instrument</th>
					<th class="{TABLE.th} text-right">Qty</th>
					<th class="{TABLE.th} text-right">Avg</th>
					<th class="{TABLE.th} text-right">LTP</th>
					<th class="{TABLE.th} text-right">Current</th>
					<th class="{TABLE.th} text-right">P&L</th>
				</tr>
			</thead>
			<tbody class={TABLE.body}>
				{#each holdings.data as h (h.isin || h.symbol)}
					{@const value = h.last_price * quantity(h)}
					{@const gain = value - h.average_price * quantity(h)}
					<tr class={TABLE.row}>
						<td class={TABLE.td}>
							{h.symbol}
							<span class="text-muted-foreground ml-1 text-xs">{h.exchange}</span>
						</td>
						<td class="{TABLE.td} text-right">
							{quantity(h)}
							{#if h.t1_quantity}<span class="text-muted-foreground ml-1 text-xs"
									>T1 {h.t1_quantity}</span
								>{/if}
						</td>
						<td class="{TABLE.td} text-right">{formatNumber(h.average_price)}</td>
						<td class="{TABLE.td} text-right">{formatNumber(h.last_price)}</td>
						<td class="{TABLE.td} text-right">{formatNumber(value)}</td>
						<td class="{TABLE.td} text-right {tone(gain)}">
							{signed(gain)}
							<span class="ml-1 text-xs opacity-70"
								>{percent(gain, h.average_price * quantity(h)).toFixed(2)}%</span
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
