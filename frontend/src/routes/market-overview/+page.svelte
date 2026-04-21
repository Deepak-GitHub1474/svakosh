<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { MARKET_DATA } from './_lib/mock-data';
	import { formatNumber } from '$lib/utils';
 	import { uiState } from '$lib/store/ui.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';

	const { indices, breadth, top_gainers, top_losers, fii_dii } = MARKET_DATA.data;

	let mounted = $state(false);
	
	onMount(() => {
		mounted = true;
	});
</script>

<div class="min-h-screen text-foreground relative z-[-1]">
	{#if mounted}
		<div in:fade={{ duration: 800 }}>
			<header>
				<h1 class="text-2xl tracking-tight text-primary mb-2 flex items-center gap-3">
					Market Overview
				</h1>
				<p class="text-muted-foreground text-sm">Major Indices, Market Breadth, FII & DII Activity</p>
			</header>
			<section class="mb-10">
				<h2 class="mb-4 flex items-center gap-2 opacity-80">
					<span class="w-1 h-4 bg-primary rounded-full"></span>
					Major Indices
				</h2>
				<div class="grid {uiState.isWatchlistVisible ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' } gap-6">
					{#each indices as index, i}
						<div in:fly={{ y: 20, delay: i * 50, duration: 500 }}>
							<SvaKoshCard
								class="hover:border-primary/40 transition-all duration-300 group cursor-default"
							>
								<div
									class="absolute -bottom-2 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"
								>
									<span class="text-5xl">{index.symbol[0]}</span>
								</div>
								<div class="flex justify-between items-start mb-4">
									<div>
										<h3 class="text-base">
											{index.display_name}
										</h3>
										<span class="text-xs text-muted-foreground uppercase group-hover:text-primary transition-colors">{index.symbol}</span>
									</div>
									<div
									class="px-2 py-1 rounded text-xs {index.change >= 0
											? 'bg-bullish-subtle text-bullish'
											: 'bg-bearish-subtle text-bearish'}"
									>
										{index.change_pct}%
									</div>
								</div>
								<div class="flex items-baseline gap-2">
								<span class="text-2xl">{formatNumber(index.ltp)}</span>
									<span
									class="text-sm {index.change >= 0 ? 'text-bullish' : 'text-bearish'}"
									>
										{index.change >= 0 ? '+' : ''}{formatNumber(index.change)}
									</span>
								</div>
							<div class="mt-4 pt-4 border-t border-glass-border grid grid-cols-2 gap-2 text-xs uppercase tracking-wider text-muted-foreground">
								<div>Open <span class="text-foreground block">{formatNumber(index.open)}</span></div>
								<div>Prev Close <span class="text-foreground block">{formatNumber(index.prev_close)}</span></div>
								</div>
							</SvaKoshCard>
						</div>
					{/each}
				</div>
			</section>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
				<section class="lg:col-span-1">
					<h2 class="mb-4 flex items-center gap-2 opacity-80">
						<span class="w-1 h-4 bg-primary rounded-full"></span>
						Market Breadth
					</h2>
					<div class="glass-panel p-4 rounded-2xl">
						<div class="flex justify-between items-end mb-4">
							<span class="text-5xl text-bullish">{breadth.advances}</span>
							<span class="text-sm text-muted-foreground uppercase tracking-widest"
								>Advances / Declines</span
							>
							<span class="text-5xl text-bearish">{breadth.declines}</span>
						</div>
						<div class="h-4 w-full bg-transparent rounded-full overflow-hidden flex mb-6">
							<div
								class="bg-gradient-to-r from-bullish to-bullish-muted transition-all duration-1000"
								style="width: {(breadth.advances / breadth.total) * 100}%; clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);"
							></div>
							<div
								class="bg-gradient-to-l from-bearish to-bearish-muted transition-all duration-1000"
								style="width: {(breadth.declines / breadth.total) * 100}%; clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%);"
							></div>
						</div>
						<div class="grid grid-cols-3 gap-4 text-center">
							<div class="glass-panel py-3 rounded-xl">
								<span class="block text-xs text-muted-foreground mb-1">Total</span>
								<span class="text-primary text-xl">{breadth.total}</span>
							</div>
							<div class="glass-panel py-3 rounded-xl border-bullish/20">
								<span class="block text-xs text-muted-foreground mb-1">Advances</span>
								<span class="text-bullish text-xl">{breadth.advances}</span>
							</div>
							<div class="glass-panel py-3 rounded-xl border-bearish/20">
								<span class="block text-xs text-muted-foreground mb-1">Declines</span>
								<span class="text-bearish text-xl">{breadth.declines}</span>
							</div>
						</div>
					</div>
				</section>

				<section class="lg:col-span-2">
					<h2 class="mb-4 flex items-center gap-2 opacity-80">
						<span class="w-1 h-4 bg-primary rounded-full"></span>
						FII & DII Activity
					</h2>
					<div class="glass-panel overflow-hidden rounded-2xl">
						<div class="p-4 pb-2 flex items-center justify-between">
							<span class="text-xs text-muted-foreground uppercase tracking-wider"
								>Cash Market (in Cr)</span
							>
							<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
								>{fii_dii[0].date}</span
							>
						</div>
						<div class="overflow-x-auto">
							<table class="w-full text-left border-collapse">
								<thead>
									<tr
										class="border-b border-glass-border uppercase tracking-widest text-muted-foreground"
									>
										<th class="py-2 px-4">Type</th>
										<th class="py-2 px-4">Buy Value</th>
										<th class="py-2 px-4">Sell Value</th>
										<th class="py-2 px-4 text-right">Net Value</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-glass-border">
									<tr class="group transition-colors hover:bg-white/5">
										<td class="py-3 px-4 text-[0.786rem]">FII</td>
										<td class="py-3 px-4 text-[0.786rem] opacity-80"
											>{formatNumber(fii_dii[0].fii_buy_value)}</td
										>
										<td class="py-3 px-4 text-[0.786rem] opacity-80"
											>{formatNumber(fii_dii[0].fii_sell_value)}</td
										>
										<td
											class="py-3 px-4 text-right text-[0.786rem] font-bold {fii_dii[0].fii_net >= 0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											{formatNumber(fii_dii[0].fii_net)}
										</td>
									</tr>
									<tr class="group transition-colors hover:bg-white/5">
										<td class="py-3 px-4 text-[0.786rem]">DII</td>
										<td class="py-3 px-4 text-[0.786rem] opacity-80"
											>{formatNumber(fii_dii[0].dii_buy_value)}</td
										>
										<td class="py-3 px-4 text-[0.786rem] opacity-80"
											>{formatNumber(fii_dii[0].dii_sell_value)}</td
										>
										<td
											class="py-3 px-4 text-right text-[0.786rem] {fii_dii[0].dii_net >= 0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											{formatNumber(fii_dii[0].dii_net)}
										</td>
									</tr>
									<tr class="bg-primary/10 text-primary border-t border-primary/20">
										<td class="py-3 px-4 text-[0.786rem]">Total Flow</td>
										<td colspan="2" class="py-3 px-4 text-center text-xs uppercase tracking-wider italic opacity-60"
											>Combined Institutional Activity</td
										>
										<td
											class="py-3 px-4 text-right text-sm font-medium {fii_dii[0].fii_net +
												fii_dii[0].fii_net >=
											0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											{formatNumber(fii_dii[0].fii_net + fii_dii[0].dii_net)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<section>
					<h2 class="mb-4 flex items-center gap-2 text-bullish">
						<span class="w-1 h-4 bg-bullish rounded-full"></span>
						Top Gainers
					</h2>
					<div class="glass-panel overflow-hidden rounded-2xl">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-bullish-subtle/30 uppercase tracking-widest text-bullish">
									<th class="px-6 py-4">Symbol</th>
									<th class="px-6 py-4">LTP</th>
									<th class="px-6 py-4 text-right">Change %</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-glass-border">
								{#each top_gainers as gainer}
									<tr class="hover:bg-bullish-subtle/10 transition-colors group">
										<td class="px-6 py-4 text-[0.786rem]">
											{gainer.symbol}
										</td>
										<td class="px-6 py-4 text-[0.786rem]">{formatNumber(gainer.ltp)}</td>
										<td class="px-6 py-4 text-right text-bullish text-[0.786rem]">
											+{gainer.change_pct}%
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<h2 class="mb-4 flex items-center gap-2 text-bearish">
						<span class="w-1 h-4 bg-bearish rounded-full"></span>
						Top Losers
					</h2>
					<div class="glass-panel overflow-hidden rounded-2xl">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-bearish-subtle/30 uppercase tracking-widest text-bearish">
									<th class="px-6 py-4">Symbol</th>
									<th class="px-6 py-4">LTP</th>
									<th class="px-6 py-4 text-right">Change %</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-glass-border">
								{#each top_losers as loser}
									<tr class="hover:bg-bearish-subtle/10 transition-colors group">
										<td class="px-6 py-4 text-[0.786rem]">
											{loser.symbol}
										</td>
										<td class="px-6 py-4 text-[0.786rem]">{formatNumber(loser.ltp)}</td>
										<td class="px-6 py-4 text-right text-bearish text-[0.786rem]">
											{loser.change_pct}%
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	{/if}
</div>
