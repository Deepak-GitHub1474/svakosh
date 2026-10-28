<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { getMarketOverview } from '$lib/market/service';
	import type { TMarketOverviewData } from '$lib/market/types';
	import { breadthOf, moversOf } from '$lib/market/analytics';
	import { PRICE_FIELDS, changeOf, marketFeed } from '$lib/market/feed.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { formatNumber } from '$lib/utils';
 	import { uiState } from '$lib/store/ui.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';

	let data = $state<TMarketOverviewData | null>(null);
	let error = $state('');
	let unsubscribe: (() => void) | undefined;
	let active = true;

	const indices = $derived(data?.indices ?? []);
	const breadth = $derived(breadthOf(data?.stocks ?? [], marketFeed.quotes));
	const movers = $derived(moversOf(data?.stocks ?? [], marketFeed.quotes));
	const top_gainers = $derived(movers.gainers);
	const top_losers = $derived(movers.losers);
	const latest_fii_dii = $derived(data?.fii_dii[0]);

	onMount(async () => {
		const res = await getMarketOverview();
		if (!active) return;
		if (!res.ok) {
			error = res.error;
			return;
		}
		data = res.data;
		const stopIndices = marketFeed.subscribe(
			data.indices.map((item) => item.sk_token),
			[...PRICE_FIELDS, 'open']
		);
		const stopStocks = marketFeed.subscribe(data.stocks.map((item) => item.sk_token));
		unsubscribe = () => {
			stopIndices();
			stopStocks();
		};
	});

	onDestroy(() => {
		active = false;
		unsubscribe?.();
	});
</script>

<svelte:head>
	<title>Market Overview | SvaKosh</title>
</svelte:head>

<div class="min-h-dvh text-foreground relative z-[-1] py-2">
	{#if data}
		<div in:fade={{ duration: 800 }}>
			<header>
				<h1 class="text-2xl tracking-tight text-primary mb-1">
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
					{#each indices as item, i (item.sk_token)}
						{@const quote = marketFeed.quotes[item.sk_token]}
						{@const index = { ...item, ltp: quote?.ltp ?? 0, open: quote?.open ?? 0, prev_close: quote?.prev_close ?? 0, ...changeOf(quote) }}
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
								style="width: {breadth.total ? (breadth.advances / breadth.total) * 100 : 0}%; clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);"
							></div>
							<div
								class="bg-gradient-to-l from-bearish to-bearish-muted transition-all duration-1000"
								style="width: {breadth.total ? (breadth.declines / breadth.total) * 100 : 0}%; clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%);"
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
					{#if latest_fii_dii}
					<div class="glass-panel overflow-hidden rounded-2xl">
						<div class="p-4 pb-2 flex items-center justify-between">
							<span class="text-xs text-muted-foreground uppercase tracking-wider"
								>Cash Market (in Cr)</span
							>
							<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
								>{latest_fii_dii.date}</span
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
											>{formatNumber(latest_fii_dii.fii_buy_value)}</td
										>
										<td class="py-3 px-4 text-[0.786rem] opacity-80"
											>{formatNumber(latest_fii_dii.fii_sell_value)}</td
										>
										<td
											class="py-3 px-4 text-right text-[0.786rem] font-bold {latest_fii_dii.fii_net >= 0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											{formatNumber(latest_fii_dii.fii_net)}
										</td>
									</tr>
									<tr class="group transition-colors hover:bg-white/5">
										<td class="py-3 px-4 text-[0.786rem]">DII</td>
										<td class="py-3 px-4 text-[0.786rem] opacity-80"
											>{formatNumber(latest_fii_dii.dii_buy_value)}</td
										>
										<td class="py-3 px-4 text-[0.786rem] opacity-80"
											>{formatNumber(latest_fii_dii.dii_sell_value)}</td
										>
										<td
											class="py-3 px-4 text-right text-[0.786rem] {latest_fii_dii.dii_net >= 0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											{formatNumber(latest_fii_dii.dii_net)}
										</td>
									</tr>
									<tr class="bg-primary/10 text-primary border-t border-primary/20">
										<td class="py-3 px-4 text-[0.786rem]">Total Flow</td>
										<td colspan="2" class="py-3 px-4 text-center text-xs uppercase tracking-wider italic opacity-60"
											>Combined Institutional Activity</td
										>
										<td
											class="py-3 px-4 text-right text-sm font-medium {latest_fii_dii.fii_net +
												latest_fii_dii.dii_net >=
											0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											{formatNumber(latest_fii_dii.fii_net + latest_fii_dii.dii_net)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					{/if}
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
								{#each top_gainers as gainer (gainer.sk_token)}
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
								{#each top_losers as loser (loser.sk_token)}
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
	{:else if error}
		<EmptyState title="Market data unavailable" description={error} />
	{/if}
</div>
