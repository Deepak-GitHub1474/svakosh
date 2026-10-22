<script lang="ts">
	import AccountCell from '$lib/components/trade/AccountCell.svelte';
	import StatStrip from '$lib/components/trade/StatStrip.svelte';
	import TradeTable from '$lib/components/trade/TradeTable.svelte';
	import { TABLE } from '$lib/trade/const';
	import { compact, signed, tone } from '$lib/trade/format';
	import { tradeResource } from '$lib/trade/resource.svelte';
	import { getFundsRows } from '$lib/trade/service';
	import type { TFunds } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	const COLUMNS: { label: string; key: keyof TFunds; pnl?: boolean }[] = [
		{ label: 'Available', key: 'available' },
		{ label: 'Used', key: 'used' },
		{ label: 'Opening', key: 'opening_balance' },
		{ label: 'Pay-in', key: 'pay_in' },
		{ label: 'Pay-out', key: 'pay_out' },
		{ label: 'Collateral', key: 'collateral' },
		{ label: 'SPAN', key: 'span' },
		{ label: 'Exposure', key: 'exposure' },
		{ label: 'Premium', key: 'option_premium' },
		{ label: 'Realised', key: 'realised_pnl', pnl: true },
		{ label: 'Unrealised', key: 'unrealised_pnl', pnl: true }
	];

	const funds = tradeResource<TFunds>(getFundsRows);

	const sum = (key: keyof TFunds) => funds.data.reduce((total, f) => total + f[key], 0);
</script>

<StatStrip
	class="mb-4 shrink-0"
	stats={[
		{
			label: 'Available',
			value: formatNumber(sum('available')),
			compact: compact(sum('available')),
			tone: 'text-primary'
		},
		{ label: 'Used', value: formatNumber(sum('used')), compact: compact(sum('used')) },
		{
			label: 'Opening balance',
			short: 'Opening',
			value: formatNumber(sum('opening_balance')),
			compact: compact(sum('opening_balance'))
		}
	]}
/>

<TradeTable
	empty={!funds.data.length}
	loading={funds.loading}
	error={funds.error}
	emptyTitle="No funds"
	emptyDescription="Margin from your logged-in broker accounts shows here."
	onRetry={funds.reload}
>
	{#snippet head()}
		<th class={TABLE.th}>Account</th>
		{#each COLUMNS as column (column.key)}
			<th class="{TABLE.th} text-right">{column.label}</th>
		{/each}
	{/snippet}
	{#snippet body()}
		{#each funds.data as f (f.account.id)}
			<tr class={TABLE.row}>
				<AccountCell account={f.account} />
				{#each COLUMNS as column (column.key)}
					<td class="{TABLE.td} text-right {column.pnl ? tone(f[column.key]) : ''}">
						{column.pnl ? signed(f[column.key]) : formatNumber(f[column.key])}
					</td>
				{/each}
			</tr>
		{/each}
	{/snippet}
</TradeTable>
