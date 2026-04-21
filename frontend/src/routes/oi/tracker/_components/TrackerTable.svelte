<script lang="ts">
	import type { TTrackerSymbolDetail } from '../_lib/types';
	import { TRACKER_TIMEFRAMES, TRACKER_CATEGORIES } from '../_lib/const';
	import { calculateTrackerTotals } from '../_lib/helper';
	import { formatNumber } from '$lib/utils/helper';
	import { cn } from '$lib/utils';
	import { getValClass } from '../../lookup/_lib/helper';

	interface Props {
		symbol: string;
		data: TTrackerSymbolDetail;
	}

	let { symbol, data }: Props = $props();

	let ceTotals = $derived(calculateTrackerTotals(data.CE));
	let peTotals = $derived(calculateTrackerTotals(data.PE));

	function getPCRValue(ce: number, pe: number) {
		if (!ce || ce === 0) return '0.00';
		return (pe / ce).toFixed(2);
	}
</script>

{#if data}
	<div class="mb-2 text-center">
		<h3 class="text-base text-primary tracking-wide">
			{symbol} 
			<span class="text-[0.625rem] text-muted-foreground opacity-60 uppercase cursor-help underline underline-offset-4 decoration-white/10">(Lakhs)</span>
		</h3>
	</div>

	<div class="flex flex-col xl:flex-row gap-4 mb-6">
		<div class="flex-1 glass-panel overflow-hidden rounded-xl border border-border-subtle bg-[#14171a]/40 backdrop-blur-sm">
			<div class="bg-bearish-subtle/20 py-2 border-b border-border-subtle text-center text-xs tracking-widest text-bearish uppercase">
				Call Options
			</div>
			<div class="overflow-x-auto no-scrollbar">
				<table class="w-full text-xs border-collapse">
					<thead>
						<tr class="bg-[#1c1f24] text-muted-foreground border-b border-border-subtle">
							<th class="py-2 px-3 border-r border-border-subtle text-left">Category</th>
							{#each TRACKER_TIMEFRAMES as tf}
								<th class="py-2 px-2 text-center border-r border-border-subtle">{tf}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each TRACKER_CATEGORIES as cat}
							<tr class="border-b border-border-subtle hover:bg-white/[0.02] transition-colors group">
								<td class="px-3 py-2 border-r border-border-subtle italic group-hover:text-foreground">
									{cat}
								</td>
								{#each TRACKER_TIMEFRAMES as tf}
									<td class={cn('px-2 py-2 text-center border-r border-border-subtle', getValClass(data.CE[cat]?.[tf] || 0))}>
										{formatNumber(data.CE[cat]?.[tf] || 0)}
									</td>
								{/each}
							</tr>
						{/each}
						<tr class="bg-[#1c1f24]/80 text-primary text-xs">
							<td class="px-3 py-2 border-r border-border-subtle uppercase tracking-tighter">Total</td>
							{#each TRACKER_TIMEFRAMES as tf}
								<td class={cn('px-2 py-2 text-center border-r border-border-subtle', getValClass(ceTotals[tf]))}>
									{formatNumber(ceTotals[tf])}
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div class="hidden xl:flex flex-col bg-[#1c1f24] border border-border-subtle rounded-xl divide-y divide-white/10 overflow-hidden">
			<div class="py-2 px-3 text-xs text-muted-foreground text-center uppercase border-b border-border-subtle tracking-widest cursor-help">PCR</div>
			
			<div class="py-2 px-3 text-xs text-muted-foreground text-center border-b border-border-subtle bg-[#1c1f24]/80 tracking-tighter cursor-help">Ratio</div>

			{#each TRACKER_CATEGORIES as cat}
				<div class="flex-1 flex items-center justify-center bg-white/[0.02] px-4 group transition-colors hover:bg-white/5">
					<span class="text-xs">{getPCRValue(data.CE[cat]?.['15 min'] || 0, data.PE[cat]?.['15 min'] || 0)}</span>
				</div>
			{/each}
			<div class="py-2 px-3 flex items-center justify-center bg-primary/5">
				<span class="text-xs text-primary">{getPCRValue(ceTotals['15 min'], peTotals['15 min'])}</span>
			</div>
		</div>

		<div class="flex-1 glass-panel overflow-hidden rounded-xl border border-border-subtle bg-[#14171a]/40 backdrop-blur-sm">
			<div class="bg-bullish-subtle/20 py-2 border-b border-border-subtle text-center text-xs tracking-widest text-bullish uppercase">
				Put Options
			</div>
			<div class="overflow-x-auto no-scrollbar">
				<table class="w-full text-xs border-collapse">
					<thead>
						<tr class="bg-[#1c1f24] text-muted-foreground border-b border-border-subtle">
							<th class="py-2 px-3 border-r border-border-subtle text-left">Category</th>
							{#each TRACKER_TIMEFRAMES as tf}
								<th class="py-2 px-2 text-center border-r border-border-subtle">{tf}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each TRACKER_CATEGORIES as cat}
							<tr class="border-b border-border-subtle hover:bg-white/[0.02] transition-colors group">
								<td class="px-3 py-2 border-r border-border-subtle italic group-hover:text-foreground">
									{cat}
								</td>
								{#each TRACKER_TIMEFRAMES as tf}
									<td class={cn('px-2 py-2 text-center border-r border-border-subtle', getValClass(data.PE[cat]?.[tf] || 0))}>
										{formatNumber(data.PE[cat]?.[tf] || 0)}
									</td>
								{/each}
							</tr>
						{/each}
						<tr class="bg-[#1c1f24]/80 text-primary text-xs">
							<td class="px-3 py-2 border-r border-border-subtle uppercase tracking-tighter">Total</td>
							{#each TRACKER_TIMEFRAMES as tf}
								<td class={cn('px-2 py-2 text-center border-r border-border-subtle', getValClass(peTotals[tf]))}>
									{formatNumber(peTotals[tf])}
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
