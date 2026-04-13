<script lang="ts">
	import { cn } from '$lib/utils';
	import type { TGlimpseSymbolDetail } from '../_lib/types';
	import { GLIMPSE_CATEGORIES } from '../_lib/const';
	import { calculateGlimpseTotals, getMetricColor } from '../_lib/helper';
	import { formatNumber } from '$lib/utils/helper';

	interface Props {
		symbol: string;
		data: TGlimpseSymbolDetail;
	}

	let { symbol, data }: Props = $props();

	const totals = $derived(calculateGlimpseTotals(data));
</script>

<div class="glass-panel overflow-hidden rounded-xl border border-white/5 flex flex-col bg-[#14171a]/40 backdrop-blur-sm">
	<div class="flex border-b border-white/10 bg-[#1c1f24]">
		<div class="flex-1 text-center py-2 text-sm text-primary tracking-widest">{symbol} <span class="text-[0.7rem] text-muted-foreground opacity-60">(Lakhs)</span></div>
	</div>

	<div class="overflow-x-auto no-scrollbar">
		<table class="w-full text-left border-collapse min-w-[600px]">
			<thead>
				<tr class="bg-[#1c1f24]/60 text-[0.65rem] uppercase tracking-tighter text-muted-foreground">
					<th class="py-2 px-4 border-r border-white/5">Category</th>
					<th colspan="3" class="text-center py-2 border-r border-white/5 bg-bearish-subtle/5">CE</th>
					<th colspan="3" class="text-center py-2 border-r border-white/5 bg-bullish-subtle/5">PE</th>
					<th colspan="3" class="text-center py-2 bg-primary-subtle/5">Overall</th>
				</tr>
				<tr class="bg-white/5 text-[0.6rem] uppercase text-muted-foreground border-b border-white/10 text-center">
					<th class="py-2 px-4 border-r border-white/5"></th>
					<th class="py-2 border-r border-white/5">Writing</th>
					<th class="py-2 border-r border-white/5">Unwinding</th>
					<th class="py-2 border-r border-white/5">Net</th>
					<th class="py-2 border-r border-white/5">Writing</th>
					<th class="py-2 border-r border-white/5">Unwinding</th>
					<th class="py-2 border-r border-white/5">Net</th>
					<th class="py-2 border-r border-white/5 font-semibold text-primary">Writing</th>
					<th class="py-2 border-r border-white/5 font-semibold text-primary">Unwinding</th>
					<th class="py-2 font-semibold text-primary">Net</th>
				</tr>
			</thead>
			<tbody class="text-[0.7rem]">
				{#each GLIMPSE_CATEGORIES as cat}
					<tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
						<td class="px-4 py-2 border-r border-white/5 font-medium tracking-wider text-muted-foreground italic group-hover:text-foreground">
							{cat}
						</td>
						<td class="px-2 py-2 text-center border-r border-white/5">{formatNumber(data.CE[cat].Writing)}</td>
						<td class="px-2 py-2 text-center border-r border-white/5">{formatNumber(data.CE[cat].Unwinding)}</td>
						<td class={cn('px-2 py-2 text-center border-r border-white/5 font-medium', getMetricColor(data.CE[cat].Net, 'CE'))}>
							{formatNumber(data.CE[cat].Net)}
						</td>
						<td class="px-2 py-2 text-center border-r border-white/5">{formatNumber(data.PE[cat].Writing)}</td>
						<td class="px-2 py-2 text-center border-r border-white/5">{formatNumber(data.PE[cat].Unwinding)}</td>
						<td class={cn('px-2 py-2 text-center border-r border-white/5 font-medium', getMetricColor(data.PE[cat].Net, 'PE'))}>
							{formatNumber(data.PE[cat].Net)}
						</td>
						<td class="px-2 py-2 text-center border-r border-white/5 bg-primary/5">{formatNumber(data.Overall[cat].Writing)}</td>
						<td class="px-2 py-2 text-center border-r border-white/5 bg-primary/5">{formatNumber(data.Overall[cat].Unwinding)}</td>
						<td class={cn('px-2 py-2 text-center font-medium bg-primary/5', getMetricColor(data.Overall[cat].Net, 'Overall'))}>
							{formatNumber(data.Overall[cat].Net)}
						</td>
					</tr>
				{/each}
				<tr class="bg-[#1c1f24] text-[0.7rem]">
					<td class="px-4 py-2.5 border-r border-white/5 text-primary uppercase tracking-tighter rounded-bl-xl font-semibold">Total</td>
					<td class="px-2 py-2.5 text-center border-r border-white/5">{formatNumber(totals.CE.Writing)}</td>
					<td class="px-2 py-2.5 text-center border-r border-white/5">{formatNumber(totals.CE.Unwinding)}</td>
					<td class={cn('px-2 py-2.5 text-center border-r border-white/5 font-semibold', getMetricColor(totals.CE.Net, 'CE'))}>
						{formatNumber(totals.CE.Net)}
					</td>
					<td class="px-2 py-2.5 text-center border-r border-white/5">{formatNumber(totals.PE.Writing)}</td>
					<td class="px-2 py-2.5 text-center border-r border-white/5">{formatNumber(totals.PE.Unwinding)}</td>
					<td class={cn('px-2 py-2.5 text-center border-r border-white/5 font-semibold', getMetricColor(totals.PE.Net, 'PE'))}>
						{formatNumber(totals.PE.Net)}
					</td>
					<td class="px-2 py-2.5 text-center border-r border-white/5 bg-primary-subtle text-primary">{formatNumber(totals.Overall.Writing)}</td>
					<td class="px-2 py-2.5 text-center border-r border-white/5 bg-primary-subtle text-primary">{formatNumber(totals.Overall.Unwinding)}</td>
					<td class={cn('px-2 py-2.5 text-center font-semibold bg-primary-subtle rounded-br-xl', getMetricColor(totals.Overall.Net, 'Overall'))}>
						{formatNumber(totals.Overall.Net)}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
