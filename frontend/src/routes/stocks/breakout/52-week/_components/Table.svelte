<script lang="ts">
	import type { T52WeekBreakout, TSortConfig, TSortKey } from '../_lib/types';
	import { formatNumber } from '$lib/utils';
	import SearchOff from '$lib/components/svg-provider/SearchOff.svelte';
	import BullishArrow from '$lib/components/svg-provider/BullishArrow.svelte';
	import BearishArrow from '$lib/components/svg-provider/BearishArrow.svelte';
	import SvaKoshBadge from '$lib/components/svakosh/SvaKoshBadge.svelte';
	import { WEEK52_BREAKOUT_COLUMNS } from '../_lib/const';

	interface Props {
		breakouts: T52WeekBreakout[];
		sortConfig: TSortConfig;
		onSort: (key: TSortKey) => void;
	}

	let { breakouts, sortConfig, onSort }: Props = $props();
</script>

<div class="glass-panel overflow-hidden rounded-xl border border-white/5 flex flex-col">
	<div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-195px)] custom-scrollbar">
		<table class="w-full text-left border-separate border-spacing-0 select-none">
			<thead class="sticky top-0 z-20">
				<tr class="bg-surface text-muted-foreground border-b border-white/5">
					{#each WEEK52_BREAKOUT_COLUMNS as col}
						<th
							class="px-6 py-4 font-normal text-sm whitespace-nowrap cursor-pointer hover:text-primary transition-colors bg-[#1c1f24] border-b border-white/5 {col.align ===
							'right'
								? 'text-right'
								: 'text-left'}"
							onclick={() => onSort(col.key)}
						>
							<div
								class="flex items-center gap-1 {col.align === 'right'
									? 'justify-end'
									: 'justify-start'}"
							>
								{col.label}
								{#if sortConfig.key === col.key}
									<span class="text-xs text-primary">
										{sortConfig.direction === 'asc' ? '▲' : '▼'}
									</span>
								{/if}
							</div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each breakouts as item, i (item.id)}
					<tr class="hover:bg-white/5 transition-colors group">
						{#each WEEK52_BREAKOUT_COLUMNS as col}
							<td
								class="px-6 py-2.5 border-b border-white/5 {i === breakouts.length - 1
									? 'border-b-0'
									: ''} {col.align === 'right' ? 'text-right tabular-nums' : 'text-left'}"
							>
								{#if col.key === 'symbol'}
									<div class="flex flex-col gap-y-0.5">
										<span
											class="font-medium text-foreground group-hover:text-primary transition-colors"
											>{item.symbol}</span
										>
										<span class="text-[0.65rem] text-muted-foreground uppercase opacity-60 leading-none"
											>{item.display_name}</span
										>
									</div>
								{:else if col.key === 'type'}
									<SvaKoshBadge 
										variant={item.type === 'High' ? 'bullish' : 'bearish'}
										icon={item.type === 'High' ? BullishArrow : BearishArrow}
									>
										{item.type}
									</SvaKoshBadge>
								{:else if col.key === 'ltp'}
									<div class="flex flex-col items-end">
										<span class="text-foreground/90 font-medium">{formatNumber(item.ltp)}</span>
										<span class="text-[0.7rem] {item.p_change >= 0 ? 'text-bullish' : 'text-bearish'}">
											{item.p_change >= 0 ? '+' : ''}{item.p_change.toFixed(2)}%
										</span>
									</div>
								{:else if col.key === 'new_extreme'}
									<span class="font-medium {item.type === 'High' ? 'text-bullish' : 'text-bearish'}">
										{formatNumber(item.new_extreme)}
									</span>
								{:else if col.key === 'change_identified'}
									<span class="font-medium {item.change_identified >= 0 ? 'text-bullish' : 'text-bearish'}">
										{item.change_identified >= 0 ? '+' : ''}{item.change_identified.toFixed(2)}%
									</span>
								{:else if typeof item[col.key] === 'number'}
									<span class="text-foreground/90">
										{formatNumber(item[col.key] as number)}
									</span>
								{:else}
									<span class="text-foreground/80 whitespace-nowrap">
										{item[col.key]}
									</span>
								{/if}
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td colspan={WEEK52_BREAKOUT_COLUMNS.length} class="px-6 py-32 text-center">
							<div
								class="flex flex-col items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000"
							>
								<div
									class="p-4 rounded-full bg-white/5 border border-white/10 text-muted-foreground/40"
								>
									<SearchOff class="w-10 h-10" />
								</div>
								<div class="space-y-1">
									<p class="text-sm text-foreground/80 font-medium">No breakouts found</p>
									<p class="text-xs text-muted-foreground/60">
										Try searching for another symbol or check back later
									</p>
								</div>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
