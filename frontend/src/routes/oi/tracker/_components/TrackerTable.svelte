<script lang="ts">
	import type { TTrackerSymbolDetail } from '../_lib/types';
	import { TRACKER_TIMEFRAMES, TRACKER_CATEGORIES } from '../_lib/const';
	import { calculateTrackerTotals } from '../_lib/helper';
	import { formatNumber } from '$lib/utils/helper';

	interface Props {
		symbol: string;
		data: TTrackerSymbolDetail;
	}

	let { symbol, data }: Props = $props();

	let ceTotals = $derived(calculateTrackerTotals(data.CE));
	let peTotals = $derived(calculateTrackerTotals(data.PE));

	function getColorClass(val: number, side: 'CE' | 'PE') {
		if (val === 0) return 'text-foreground/60';
		if (side === 'CE') {
			return val > 0 ? 'text-bearish' : 'text-bullish';
		} else {
			return val > 0 ? 'text-bullish' : 'text-bearish';
		}
	}
</script>

<div class="glass-panel overflow-hidden rounded-xl border border-white/5 flex flex-col bg-surface/40 backdrop-blur-sm shadow-2xl animate-in fade-in duration-700">
	<div class="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/5">
		<h3 class="text-primary font-bold tracking-wider flex items-center gap-2">
			<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
			{symbol}
		</h3>
		<span class="text-[0.6rem] text-muted-foreground uppercase tracking-widest opacity-60">OI in Lakhs</span>
	</div>

	<div class="flex flex-col lg:flex-row">
		<!-- CE Table -->
		<div class="flex-1 border-b lg:border-b-0 lg:border-r border-white/5">
			<div class="bg-bearish/10 py-1.5 text-center text-[0.65rem] font-bold text-bearish uppercase tracking-tighter border-b border-white/5">
				Call Options (CE)
			</div>
			<div class="overflow-x-auto custom-scrollbar">
				<table class="w-full text-[0.7rem] border-separate border-spacing-0">
					<thead>
						<tr class="bg-white/5 text-muted-foreground">
							<th class="px-3 py-2 text-left font-medium border-b border-white/5">Category</th>
							{#each TRACKER_TIMEFRAMES as tf}
								<th class="px-3 py-2 text-right font-medium border-b border-white/5 whitespace-nowrap">{tf}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each TRACKER_CATEGORIES as cat}
							<tr class="hover:bg-white/[0.03] transition-colors group">
								<td class="px-3 py-2 text-foreground/70 font-medium border-b border-white/5">{cat}</td>
								{#each TRACKER_TIMEFRAMES as tf}
									<td class="px-3 py-2 text-right tabular-nums border-b border-white/5 {getColorClass(data.CE[cat]?.[tf] || 0, 'CE')}">
										{formatNumber(data.CE[cat]?.[tf] || 0)}
									</td>
								{/each}
							</tr>
						{/each}
						<tr class="bg-white/5 font-bold">
							<td class="px-3 py-2 text-foreground border-t border-white/10 italic">Total</td>
							{#each TRACKER_TIMEFRAMES as tf}
								<td class="px-3 py-2 text-right tabular-nums border-t border-white/10 {getColorClass(ceTotals[tf], 'CE')}">
									{formatNumber(ceTotals[tf])}
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- PE Table -->
		<div class="flex-1">
			<div class="bg-bullish/10 py-1.5 text-center text-[0.65rem] font-bold text-bullish uppercase tracking-tighter border-b border-white/5">
				Put Options (PE)
			</div>
			<div class="overflow-x-auto custom-scrollbar">
				<table class="w-full text-[0.7rem] border-separate border-spacing-0">
					<thead>
						<tr class="bg-white/5 text-muted-foreground">
							<th class="px-3 py-2 text-left font-medium border-b border-white/5">Category</th>
							{#each TRACKER_TIMEFRAMES as tf}
								<th class="px-3 py-2 text-right font-medium border-b border-white/5 whitespace-nowrap">{tf}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each TRACKER_CATEGORIES as cat}
							<tr class="hover:bg-white/[0.03] transition-colors group">
								<td class="px-3 py-2 text-foreground/70 font-medium border-b border-white/5">{cat}</td>
								{#each TRACKER_TIMEFRAMES as tf}
									<td class="px-3 py-2 text-right tabular-nums border-b border-white/5 {getColorClass(data.PE[cat]?.[tf] || 0, 'PE')}">
										{formatNumber(data.PE[cat]?.[tf] || 0)}
									</td>
								{/each}
							</tr>
						{/each}
						<tr class="bg-white/5 font-bold">
							<td class="px-3 py-2 text-foreground border-t border-white/10 italic">Total</td>
							{#each TRACKER_TIMEFRAMES as tf}
								<td class="px-3 py-2 text-right tabular-nums border-t border-white/10 {getColorClass(peTotals[tf], 'PE')}">
									{formatNumber(peTotals[tf])}
								</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
