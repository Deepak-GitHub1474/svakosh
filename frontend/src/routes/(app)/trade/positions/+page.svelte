<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import StatStrip from '$lib/components/trade/StatStrip.svelte';
	import { TABLE, EMPTY_STATE } from '$lib/trade/const';
	import { signed, tone } from '$lib/trade/format';
	import { tradeResource } from '$lib/trade/resource.svelte';
	import { getPositions } from '$lib/trade/service';
	import type { TPosition } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	const positions = tradeResource<TPosition[]>(getPositions, []);

	const pnl = (p: TPosition) => p.realised + p.unrealised;
	const total = $derived(positions.data.reduce((sum, p) => sum + pnl(p), 0));
	const open = $derived(positions.data.filter((p) => p.quantity !== 0).length);
</script>

{#if positions.loading && !positions.data.length}
	<div class="relative h-40"><SvaKoshLoader inline message="" /></div>
{:else if positions.error && !positions.data.length}
	<EmptyState
		class={EMPTY_STATE}
		title="Could not load positions"
		description={positions.error}
		actionLabel="Retry"
		onAction={positions.reload}
	/>
{:else if !positions.data.length}
	<EmptyState
		class={EMPTY_STATE}
		title="No positions today"
		description="Positions from today's trades will show here."
	/>
{:else}
	<StatStrip
		stats={[
			{ label: 'Total P&L', value: signed(total), tone: tone(total) },
			{ label: 'Open', value: String(open) },
			{ label: 'Closed', value: String(positions.data.length - open) }
		]}
	/>
	<div class={TABLE.wrap}>
		<table class={TABLE.table}>
			<thead>
				<tr class={TABLE.head}>
					<th class={TABLE.th}>Instrument</th>
					<th class={TABLE.th}>Product</th>
					<th class="{TABLE.th} text-right">Qty</th>
					<th class="{TABLE.th} text-right">Avg</th>
					<th class="{TABLE.th} text-right">LTP</th>
					<th class="{TABLE.th} text-right">P&L</th>
				</tr>
			</thead>
			<tbody class={TABLE.body}>
				{#each positions.data as p (`${p.exchange}:${p.symbol}:${p.product}`)}
					<tr class={TABLE.row}>
						<td class={TABLE.td}>
							{p.symbol}
							<span class="text-muted-foreground ml-1 text-xs">{p.exchange}</span>
						</td>
						<td class="{TABLE.td} text-muted-foreground">{p.product}</td>
						<td class="{TABLE.td} text-right {tone(p.quantity)}">{p.quantity}</td>
						<td class="{TABLE.td} text-right">{formatNumber(p.average_price)}</td>
						<td class="{TABLE.td} text-right">{formatNumber(p.last_price)}</td>
						<td class="{TABLE.td} text-right {tone(pnl(p))}">{signed(pnl(p))}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
