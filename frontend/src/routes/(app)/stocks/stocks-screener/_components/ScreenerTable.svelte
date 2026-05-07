<script lang="ts">
	import type { TStock, TSortConfig, TSortKey } from '../_lib/types';
	import { formatNumber } from '$lib/utils';
	import SearchOff from '$lib/components/svg-provider/SearchOff.svelte';

	import { SCREENER_COLUMNS } from '../_lib/const';

	interface Props {
		stocks: TStock[];
		sortConfig: TSortConfig;
		onSort: (key: TSortKey) => void;
	}

	let { stocks, sortConfig, onSort }: Props = $props();
</script>

<div class="glass-panel overflow-hidden rounded-xl border border-border-subtle flex flex-col">
	<div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-195px)] custom-scrollbar">
		<table class="w-full text-left border-separate border-spacing-0 select-none">
			<thead class="sticky top-0 z-20">
				<tr class="bg-surface text-muted-foreground border-b border-border-subtle">
					{#each SCREENER_COLUMNS as col}
						<th
							class="px-6 py-4 font-normal text-sm whitespace-nowrap cursor-pointer hover:text-primary transition-colors bg-[#1c1f24] border-b border-border-subtle {col.align ===
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
				{#each stocks as stock, i (stock.symbol)}
					<tr class="hover:bg-white/5 transition-colors group">
						{#each SCREENER_COLUMNS as col}
							<td
								class="px-6 py-2.5 border-b border-border-subtle {i === stocks.length - 1
									? 'border-b-0'
									: ''} {col.align === 'right' ? 'text-right tabular-nums' : 'text-left'}"
							>
								{#if col.key === 'symbol'}
									<div class="flex flex-col gap-y-1">
										<span
											class="font-medium text-foreground group-hover:text-primary transition-colors"
											>{stock.symbol}</span
										>
										<span class="text-[0.65rem] text-muted-foreground uppercase opacity-60 leading-none"
											>{stock.display_name}</span
										>
									</div>
								{:else if col.key === 'change' || col.key === 'change_pct'}
									<span
										class="font-medium {stock.change >= 0 ? 'text-bullish' : 'text-bearish'}"
									>
										{#if col.key === 'change'}
											{stock.change >= 0 ? '+' : ''}{formatNumber(stock.change)}
										{:else}
											{stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
										{/if}
									</span>
								{:else}
									<span class="text-foreground/90">
										{formatNumber(stock[col.key] as number)}
									</span>
								{/if}
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td colspan={SCREENER_COLUMNS.length} class="px-4 py-32 text-center">
							<div
								class="flex flex-col items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000"
							>
								<SearchOff class="w-10 h-10 text-muted-foreground/40" />
								<div class="space-y-1">
									<p class="text-sm text-foreground/80 font-medium">No stocks match your criteria</p>
									<p class="text-xs text-muted-foreground/60">
										Try adjusting your filters or searching for another symbol
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
