<script lang="ts">
	import OrderButtons from './OrderButtons.svelte';
	import OrderTap from './OrderTap.svelte';
	import StackedCell from './StackedCell.svelte';
	import { changePct, formatDecimal, formatLakh, oiChangePct } from '../_lib/helper';
	import type { TGreeksRow, TStrikeData, TViewMode } from '../_lib/types';

	let {
		strike,
		data,
		greeks,
		view,
		atm,
		onorder
	}: {
		strike: string;
		data: TStrikeData;
		greeks?: TGreeksRow;
		view: TViewMode;
		atm: string;
		onorder: (side: 'CE' | 'PE', transaction: 'BUY' | 'SELL') => void;
	} = $props();

	const isAtm = $derived(Number(strike) === Number(atm));
	const ceItm = $derived(Number(strike) < Number(atm));
	const peItm = $derived(Number(strike) > Number(atm));

	const ceOiChange = $derived(oiChangePct(data.ce_oi, data.ce_prev_oi));
	const peOiChange = $derived(oiChangePct(data.pe_oi, data.pe_prev_oi));
	const ceLtpChange = $derived(changePct(data.ce_ltp, data.ce_prev_close));
	const peLtpChange = $derived(changePct(data.pe_ltp, data.pe_prev_close));

	const rowLine = 'border-border-subtle/60 border-b';
	const cell = `${rowLine} relative px-3 py-2 text-sm tabular-nums`;
	const itmTint = 'bg-primary-subtle group-hover/row:bg-transparent';
	const liquidHover =
		'hover:bg-[linear-gradient(90deg,transparent,var(--glass)_18%,var(--glass)_82%,transparent)]';
</script>

<tr
	class="group/row last:[&>td]:border-b-0 {liquidHover} {isAtm ? 'bg-primary-hover' : ''}"
	data-atm={isAtm ? '' : undefined}
>
	{#if view === 'OI'}
		<td class="{cell} text-left {ceItm ? itmTint : ''}">
			<OrderTap side="CE" {strike} {onorder} />
			<StackedCell value={formatLakh(data.ce_oi)} change={ceOiChange} align="left" />
		</td>

		<td class="{cell} text-right {ceItm ? itmTint : ''}">
			<OrderButtons side="CE" align="left" {strike} {onorder} />
			<OrderTap side="CE" {strike} {onorder} />
			<StackedCell value={formatDecimal(data.ce_ltp)} change={ceLtpChange} align="right" />
		</td>
	{:else}
		<td class="{cell} text-right">{formatDecimal(greeks?.ce_gamma, 4)}</td>
		<td class="{cell} text-right">{formatDecimal(greeks?.ce_vega)}</td>
		<td class="{cell} text-right">{formatDecimal(greeks?.ce_theta)}</td>
		<td class="{cell} text-right">{formatDecimal(greeks?.ce_delta)}</td>
		<td class="text-muted-foreground {cell} text-right">{formatDecimal(greeks?.ce_iv)}</td>

		<td class="{cell} text-right">
			<OrderButtons side="CE" align="left" {strike} {onorder} />
			<OrderTap side="CE" {strike} {onorder} />
			{formatDecimal(data.ce_ltp)}
		</td>
	{/if}

	<td
		class="border-x-border-muted border-b-border-subtle/60 bg-background/40 border-x border-b px-4 py-2 text-center text-sm font-medium tabular-nums group-hover/row:bg-transparent {isAtm
			? 'text-primary'
			: ''}"
	>
		{strike}
	</td>

	{#if view === 'OI'}
		<td class="{cell} text-left {peItm ? itmTint : ''}">
			<OrderButtons side="PE" align="right" {strike} {onorder} />
			<OrderTap side="PE" {strike} {onorder} />
			<StackedCell value={formatDecimal(data.pe_ltp)} change={peLtpChange} align="left" />
		</td>

		<td class="{cell} text-right {peItm ? itmTint : ''}">
			<OrderTap side="PE" {strike} {onorder} />
			<StackedCell value={formatLakh(data.pe_oi)} change={peOiChange} align="right" />
		</td>
	{:else}
		<td class="{cell} text-left">
			<OrderButtons side="PE" align="right" {strike} {onorder} />
			<OrderTap side="PE" {strike} {onorder} />
			{formatDecimal(data.pe_ltp)}
		</td>

		<td class="text-muted-foreground {cell} text-left">{formatDecimal(greeks?.pe_iv)}</td>
		<td class="{cell} text-left">{formatDecimal(greeks?.pe_delta)}</td>
		<td class="{cell} text-left">{formatDecimal(greeks?.pe_theta)}</td>
		<td class="{cell} text-left">{formatDecimal(greeks?.pe_vega)}</td>
		<td class="{cell} text-left">{formatDecimal(greeks?.pe_gamma, 4)}</td>
	{/if}
</tr>
