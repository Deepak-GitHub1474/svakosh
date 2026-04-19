<script lang="ts">
	import { uiState } from '$lib/store/ui.svelte';
	import { stocks } from './const';
	import { formatNumber } from '$lib/utils';
	import SvaKoshTooltip from '$lib/components/svakosh/SvaKoshTooltip.svelte';
</script>

<aside
	class="fixed top-12 h-[calc(100vh-3rem)] flex flex-col bg-background border-r border-border-subtle transition-all duration-300 ease-in-out
    {uiState.isWatchlistVisible ? 'translate-x-0' : '-translate-x-full'}
    left-[56px] w-[280px] 2xl:w-[340px]"
>
	<div class="px-2 py-2.5 flex items-center justify-between border-b border-border-subtle bg-white/[0.03]">
		<h2 class="text-xs text-white tracking-widest leading-none truncate mr-1">Watchlist</h2>
		<div class="flex items-center gap-2.5">
			<SvaKoshTooltip content="Search Symbol" position="bottom" offset={10}>
				<button class="material-symbols-outlined text-muted-foreground icon-size hover:text-primary transition-colors">search</button>
			</SvaKoshTooltip>
			<SvaKoshTooltip content="Create Watchlist" position="bottom" offset={10}>
				<button class="material-symbols-outlined text-muted-foreground icon-size hover:text-primary transition-colors">add_circle</button>
			</SvaKoshTooltip>
			<SvaKoshTooltip content="View Watchlists" position="bottom" offset={10}>
				<button class="material-symbols-outlined text-muted-foreground icon-size hover:text-primary transition-colors">arrow_drop_down_circle</button>
			</SvaKoshTooltip>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto pb-6 hide-scrollbar">
		{#each stocks as stock}
			<div class="group flex items-start gap-3 border-b border-border-subtle p-2 hover:bg-white/[0.03] transition-all cursor-pointer">
				<div class="w-10 h-10 rounded-full bg-black/40 border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-primary/20">
					<span class="text-[0.625rem] text-primary">{stock.symbol[0]}</span>
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between mb-1.5">
						<span class="text-xs text-white truncate">{stock.symbol}</span>
						<span class="text-xs text-white">{formatNumber(stock.ltp)}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-[0.625rem] text-gray-500 truncate">{stock.name}</span>
						<div class="flex items-center gap-2">
							<span class="text-[0.625rem] {stock.change > 0 ? 'text-bullish' : stock.change < 0 ? 'text-bearish' : 'text-muted-foreground'}">
								{stock.change > 0 ? '+' : ''}{formatNumber(stock.change)}
							</span>
							<span class="text-[0.625rem] px-1.5 py-0.5 rounded {stock.change > 0 ? 'bg-bullish-subtle text-bullish' : stock.change < 0 ? 'bg-bearish-subtle text-bearish' : 'bg-white/5 text-muted-foreground'}">
								{stock.change_percentage > 0 ? '+' : ''}{formatNumber(stock.change_percentage)}%
							</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</aside>