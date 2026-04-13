<script lang="ts">
	import { cn } from '$lib/utils';
	import type { TSymbolLookupDetail } from '../_lib/types';
	import { LOOKUP_TIMEFRAMES, LOOKUP_CATEGORIES } from '../_lib/const';
	import { calculateLookupTotals, getPCRValue } from '../_lib/helper';
	import { formatNumber } from '$lib/utils/helper';

	interface Props {
		symbol: string;
		data: TSymbolLookupDetail;
	}

	let { symbol, data }: Props = $props();

	const ceTotals = $derived(calculateLookupTotals(data.CE));
	const peTotals = $derived(calculateLookupTotals(data.PE));

	function getValClass(val: number) {
		if (val > 0) return 'text-bullish';
		if (val < 0) return 'text-bearish';
		return 'text-muted-foreground';
	}
</script>

<div class="mb-4 text-center">
	<h3 class="text-xl text-primary font-medium tracking-wide">
		{symbol} <span class="text-xs text-muted-foreground opacity-60">(Lakhs)</span>
	</h3>
</div>

<div class="flex flex-col xl:flex-row gap-4 mb-10">
	<div class="flex-1 glass-panel overflow-hidden rounded-xl border border-white/5 bg-[#14171a]/40 backdrop-blur-sm">
		<div class="bg-bearish-subtle/20 py-2 border-b border-white/5 text-center text-xs tracking-widest text-bearish uppercase">
			Call Options
		</div>
		<div class="overflow-x-auto no-scrollbar">
			<table class="w-full text-[0.7rem] border-collapse">
				<thead>
					<tr class="bg-[#1c1f24] text-muted-foreground border-b border-white/5">
						<th class="py-2 px-3 border-r border-white/5">Category</th>
						{#each LOOKUP_TIMEFRAMES as tf}
							<th class="py-2 px-2 text-center border-r border-white/5">{tf}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each LOOKUP_CATEGORIES as cat}
						<tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
							<td class="px-3 py-2 border-r border-white/5 font-medium text-muted-foreground italic group-hover:text-foreground">
								{cat}
							</td>
							{#each LOOKUP_TIMEFRAMES as tf}
								<td class={cn('px-2 py-2 text-center border-r border-white/5 font-medium', getValClass(data.CE[cat][tf]))}>
									{formatNumber(data.CE[cat][tf])}
								</td>
							{/each}
						</tr>
					{/each}
					<tr class="bg-[#1c1f24]/80 text-primary font-semibold">
						<td class="px-3 py-2 border-r border-white/5 uppercase tracking-tighter">Total</td>
						{#each LOOKUP_TIMEFRAMES as tf}
							<td class={cn('px-2 py-2 text-center border-r border-white/5', getValClass(ceTotals[tf]))}>
								{formatNumber(ceTotals[tf])}
							</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<div class="hidden xl:flex flex-col bg-[#1c1f24] border border-white/5 rounded-xl divide-y divide-white/10 overflow-hidden">
		<div class="py-2 px-3 text-[0.6rem] text-muted-foreground text-center uppercase border-b border-white/5">PCR</div>
		{#each LOOKUP_CATEGORIES as cat, i}
			<div class="flex-1 flex items-center justify-center text-[0.7rem] bg-white/[0.02] px-4 font-mono">
				{getPCRValue(data.CE[cat].Total, data.PE[cat].Total)}
			</div>
		{/each}
		<div class="py-2 px-3 text-[0.7rem] text-primary text-center font-bold bg-primary/5 font-mono">
			{getPCRValue(ceTotals.Total, peTotals.Total)}
		</div>
	</div>

	<div class="flex-1 glass-panel overflow-hidden rounded-xl border border-white/5 bg-[#14171a]/40 backdrop-blur-sm">
		<div class="bg-bullish-subtle/20 py-2 border-b border-white/5 text-center text-xs tracking-widest text-bullish uppercase">
			Put Options
		</div>
		<div class="overflow-x-auto no-scrollbar">
			<table class="w-full text-[0.7rem] border-collapse">
				<thead>
					<tr class="bg-[#1c1f24] text-muted-foreground border-b border-white/5">
						<th class="py-2 px-3 border-r border-white/5">Category</th>
						{#each LOOKUP_TIMEFRAMES as tf}
							<th class="py-2 px-2 text-center border-r border-white/5">{tf}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each LOOKUP_CATEGORIES as cat}
						<tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
							<td class="px-3 py-2 border-r border-white/5 font-medium text-muted-foreground italic group-hover:text-foreground">
								{cat}
							</td>
							{#each LOOKUP_TIMEFRAMES as tf}
								<td class={cn('px-2 py-2 text-center border-r border-white/5 font-medium', getValClass(data.PE[cat][tf]))}>
									{formatNumber(data.PE[cat][tf])}
								</td>
							{/each}
						</tr>
					{/each}
					<tr class="bg-[#1c1f24]/80 text-primary font-semibold">
						<td class="px-3 py-2 border-r border-white/5 uppercase tracking-tighter">Total</td>
						{#each LOOKUP_TIMEFRAMES as tf}
							<td class={cn('px-2 py-2 text-center border-r border-white/5', getValClass(peTotals[tf]))}>
								{formatNumber(peTotals[tf])}
							</td>
						{/each}
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
