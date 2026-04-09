<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	const marketData = {
		success: true,
		message: 'Market overview fetched',
		data: {
			status: {
				nse_equity: 'Open',
				nse_fo: 'Open',
				nse_currency: 'Open',
				as_of: '2026-04-08T10:58:24.762539+05:30'
			},
			indices: [
				{
					symbol: 'NIFTY',
					display_name: 'Nifty 50',
					ltp: 23976.85,
					change: 1008.6,
					change_pct: 4.39,
					prev_close: 22968.25,
					open: 22838.7,
					high: 23981.55,
					low: 22719.3
				},
				{
					symbol: 'BANKNIFTY',
					display_name: 'Nifty Bank',
					ltp: 55485.45,
					change: 2876.35,
					change_pct: 5.47,
					prev_close: 52609.1,
					open: 54904.45,
					high: 55504.15,
					low: 54797.5
				},
				{
					symbol: 'MIDCPNIFTY',
					display_name: 'NIFTY MIDCAP SELECT',
					ltp: 13194.2,
					change: 610.9,
					change_pct: 4.85,
					prev_close: 12583.3,
					open: 13065.15,
					high: 13197,
					low: 13019
				},
				{
					symbol: 'FINNIFTY',
					display_name: 'Nifty Fin Service',
					ltp: 26033.8,
					change: 1430.7,
					change_pct: 5.82,
					prev_close: 24603.1,
					open: 25688.65,
					high: 26038.55,
					low: 25623.9
				},
				{
					symbol: 'NIFTYNXT50',
					display_name: 'NIFTY NEXT 50',
					ltp: 66067.35,
					change: 3208.4,
					change_pct: 5.1,
					prev_close: 62858.95,
					open: 65491.35,
					high: 66136.4,
					low: 65295.05
				},
				{
					symbol: 'SENSEX',
					display_name: 'S&P BSE SENSEX',
					ltp: 77503.34,
					change: 3396.49,
					change_pct: 4.58,
					prev_close: 74106.85,
					open: 77290.63,
					high: 77512.43,
					low: 77042.15
				},
				{
					symbol: 'BANKEX',
					display_name: 'S&P BSE BANKEX',
					ltp: 62458.47,
					change: 3274.22,
					change_pct: 5.53,
					prev_close: 59184.25,
					open: 61921.82,
					high: 62469.37,
					low: 61680.62
				},
				{
					symbol: 'SENSEX50',
					display_name: 'S&P BSE SENSEX50',
					ltp: 25064.2,
					change: 1055.05,
					change_pct: 4.39,
					prev_close: 24009.15,
					open: 24999.54,
					high: 25067.03,
					low: 24916.61
				}
			],
			breadth: {
				advances: 41,
				declines: 8,
				unchanged: 0,
				total: 49
			},
			top_gainers: [
				{
					symbol: 'SHRIRAMFIN',
					company_name: 'SHRIRAMFIN',
					ltp: 1023.7,
					change: 93.05,
					change_pct: 10,
					volume: 7981816,
					week_52_high: 1108,
					week_52_low: 566.5,
					sector: null,
					cirrus_token: 'CT:1:2:SHRIRAMFIN-EQ',
					upper_circuit: 1020.8,
					lower_circuit: 835.2
				},
				{
					symbol: 'ADANIENT',
					company_name: 'ADANIENT',
					ltp: 2057.5,
					change: 175.4,
					change_pct: 9.32,
					volume: 2558078,
					week_52_high: 2616.5,
					week_52_low: 1967.52,
					sector: null,
					cirrus_token: 'CT:1:2:ADANIENT-EQ',
					upper_circuit: 2092.4,
					lower_circuit: 1712
				},
				{
					symbol: 'ULTRACEMCO',
					company_name: 'ULTRACEMCO',
					ltp: 11750,
					change: 814,
					change_pct: 7.44,
					volume: 266971,
					week_52_high: 13110,
					week_52_low: 10325,
					sector: null,
					cirrus_token: 'CT:1:2:ULTRACEMCO-EQ',
					upper_circuit: 12050,
					lower_circuit: 9860
				},
				{
					symbol: 'BAJFINANCE',
					company_name: 'BAJFINANCE',
					ltp: 916.35,
					change: 61.25,
					change_pct: 7.16,
					volume: 5885355,
					week_52_high: 1102.5,
					week_52_low: 802.5,
					sector: null,
					cirrus_token: 'CT:1:2:BAJFINANCE-EQ',
					upper_circuit: 935.9,
					lower_circuit: 765.8
				},
				{
					symbol: 'M&M',
					company_name: 'M&M',
					ltp: 3221.6,
					change: 215,
					change_pct: 7.15,
					volume: 2249565,
					week_52_high: 3839.9,
					week_52_low: 2425,
					sector: null,
					cirrus_token: 'CT:1:2:M&M-EQ',
					upper_circuit: 3345.4,
					lower_circuit: 2737.2
				}
			],
			top_losers: [
				{
					symbol: 'ONGC',
					company_name: 'ONGC',
					ltp: 278.55,
					change: -8.1,
					change_pct: -2.83,
					volume: 23283714,
					week_52_high: 293,
					week_52_low: 205,
					sector: null,
					cirrus_token: 'CT:1:2:ONGC-EQ',
					upper_circuit: 310,
					lower_circuit: 253.7
				},
				{
					symbol: 'COALINDIA',
					company_name: 'COALINDIA',
					ltp: 450,
					change: -13,
					change_pct: -2.81,
					volume: 9039795,
					week_52_high: 476,
					week_52_low: 356,
					sector: null,
					cirrus_token: 'CT:1:2:COALINDIA-EQ',
					upper_circuit: 505.5,
					lower_circuit: 413.6
				},
				{
					symbol: 'SUNPHARMA',
					company_name: 'SUNPHARMA',
					ltp: 1694,
					change: -24,
					change_pct: -1.4,
					volume: 1352932,
					week_52_high: 1851.2,
					week_52_low: 1548,
					sector: null,
					cirrus_token: 'CT:1:2:SUNPHARMA-EQ',
					upper_circuit: 1864,
					lower_circuit: 1525.2
				},
				{
					symbol: 'TECHM',
					company_name: 'TECHM',
					ltp: 1455.7,
					change: -17.7,
					change_pct: -1.2,
					volume: 1033187,
					week_52_high: 1854,
					week_52_low: 1209.4,
					sector: null,
					cirrus_token: 'CT:1:2:TECHM-EQ',
					upper_circuit: 1594.4,
					lower_circuit: 1304.6
				},
				{
					symbol: 'DRREDDY',
					company_name: 'DRREDDY',
					ltp: 1190.5,
					change: -5.6,
					change_pct: -0.47,
					volume: 613670,
					week_52_high: 1379.7,
					week_52_low: 1020,
					sector: null,
					cirrus_token: 'CT:1:2:DRREDDY-EQ',
					upper_circuit: 1339.5,
					lower_circuit: 1096.1
				}
			],
			fii_dii: [
				{
					date: '07-Apr-2026',
					fii_buy_value: 7953.46,
					fii_sell_value: 16645.57,
					fii_net: -8692.11,
					dii_buy_value: 20860.09,
					dii_sell_value: 12880.59,
					dii_net: 7979.5
				}
			]
		}
	};

	const { status, indices, breadth, top_gainers, top_losers, fii_dii } = marketData.data;

	function formatNumber(num: number) {
		return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
	}

	function formatCurrency(num: number) {
		return num.toLocaleString('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 2
		});
	}

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});
</script>

<div class="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground">
	{#if mounted}
		<div in:fade={{ duration: 800 }}>
			<!-- Header & Market Status -->
			<header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<h1 class="text-4xl font-bold tracking-tight text-primary mb-2">Market Overview</h1>
				</div>
				<div class="flex gap-4">
					{#each Object.entries(status).filter(([key]) => key !== 'as_of') as [market, state]}
						<div class="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
							<span class="text-xs uppercase tracking-widest text-muted-foreground"
								>{market.replace('_', ' ')}</span
							>
							<span class="flex items-center gap-1.5">
								<span
									class="h-2 w-2 rounded-full animate-pulse {state === 'Open'
										? 'bg-bullish'
										: 'bg-bearish'}"
								></span>
								<span class="font-bold text-sm">{state}</span>
							</span>
						</div>
					{/each}
				</div>
			</header>

			<!-- Indices Grid -->
			<section class="mb-12">
				<h2 class="text-lg font-semibold mb-6 flex items-center gap-2 opacity-80">
					<span class="h-1 w-8 bg-primary rounded-full"></span>
					Major Indices
				</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{#each indices as index, i}
						<div
							in:fly={{ y: 20, delay: i * 50, duration: 500 }}
							class="glass-panel p-6 rounded-2xl hover:border-primary/40 transition-all duration-300 group cursor-default relative overflow-hidden"
						>
							<div
								class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"
							>
								<span class="text-6xl font-bold">{index.symbol[0]}</span>
							</div>
							<div class="flex justify-between items-start mb-4">
								<div>
									<h3 class="font-bold text-lg group-hover:text-primary transition-colors">
										{index.display_name}
									</h3>
									<span class="text-xs text-muted-foreground uppercase">{index.symbol}</span>
								</div>
								<div
									class="px-2 py-1 rounded text-xs font-bold {index.change >= 0
										? 'bg-bullish-subtle text-bullish'
										: 'bg-bearish-subtle text-bearish'}"
								>
									{index.change_pct}%
								</div>
							</div>
							<div class="flex items-baseline gap-2">
								<span class="text-2xl font-bold">{formatNumber(index.ltp)}</span>
								<span
									class="text-sm font-medium {index.change >= 0 ? 'text-bullish' : 'text-bearish'}"
								>
									{index.change >= 0 ? '+' : ''}{formatNumber(index.change)}
								</span>
							</div>
							<div class="mt-4 pt-4 border-t border-glass-border grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
								<div>Open <span class="text-foreground block">{formatNumber(index.open)}</span></div>
								<div>Prev Close <span class="text-foreground block">{formatNumber(index.prev_close)}</span></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
				<!-- Market Breadth -->
				<section class="lg:col-span-1">
					<h2 class="text-lg font-semibold mb-6 flex items-center gap-2 opacity-80">
						<span class="h-1 w-8 bg-primary rounded-full"></span>
						Market Breadth
					</h2>
					<div class="glass-panel p-8 rounded-2xl h-[calc(100%-3rem)] flex flex-col justify-center">
						<div class="flex justify-between items-end mb-4">
							<span class="text-4xl font-bold text-bullish">{breadth.advances}</span>
							<span class="text-sm text-muted-foreground uppercase tracking-widest"
								>Advances / Declines</span
							>
							<span class="text-4xl font-bold text-bearish">{breadth.declines}</span>
						</div>
						<div class="h-4 w-full bg-glass-border rounded-full overflow-hidden flex mb-6">
							<div
								class="bg-gradient-to-r from-bullish to-bullish-muted transition-all duration-1000"
								style="width: {(breadth.advances / breadth.total) * 100}%"
							></div>
							<div
								class="bg-gradient-to-l from-bearish to-bearish-muted transition-all duration-1000"
								style="width: {(breadth.declines / breadth.total) * 100}%"
							></div>
						</div>
						<div class="grid grid-cols-3 gap-4 text-center">
							<div class="glass-panel py-3 rounded-xl">
								<span class="block text-xs text-muted-foreground mb-1">Total</span>
								<span class="font-bold">{breadth.total}</span>
							</div>
							<div class="glass-panel py-3 rounded-xl border-bullish/20">
								<span class="block text-xs text-muted-foreground mb-1">Advances</span>
								<span class="font-bold text-bullish">{breadth.advances}</span>
							</div>
							<div class="glass-panel py-3 rounded-xl border-bearish/20">
								<span class="block text-xs text-muted-foreground mb-1">Declines</span>
								<span class="font-bold text-bearish">{breadth.declines}</span>
							</div>
						</div>
					</div>
				</section>

				<!-- FII / DII Activity -->
				<section class="lg:col-span-2">
					<h2 class="text-lg font-semibold mb-6 flex items-center gap-2 opacity-80">
						<span class="h-1 w-8 bg-primary rounded-full"></span>
						FII & DII Activity
					</h2>
					<div class="glass-panel p-8 rounded-2xl h-[calc(100%-3rem)]">
						<div class="flex justify-between items-center mb-8">
							<span class="text-muted-foreground">Cash Market (in Cr)</span>
							<span class="px-3 py-1 glass-panel rounded-full text-xs font-medium"
								>{fii_dii[0].date}</span
							>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div class="relative">
								<div class="flex justify-between items-center mb-4">
									<h3 class="font-bold text-xl">FII Activity</h3>
									<span
										class="font-bold {fii_dii[0].fii_net >= 0 ? 'text-bullish' : 'text-bearish'}"
									>
										{fii_dii[0].fii_net >= 0 ? 'Net Buy' : 'Net Sell'}
									</span>
								</div>
								<div class="space-y-4">
									<div class="flex justify-between text-sm">
										<span class="text-muted-foreground">Buy Value</span>
										<span class="font-medium">₹{formatNumber(fii_dii[0].fii_buy_value)}</span>
									</div>
									<div class="flex justify-between text-sm">
										<span class="text-muted-foreground">Sell Value</span>
										<span class="font-medium">₹{formatNumber(fii_dii[0].fii_sell_value)}</span>
									</div>
									<div class="pt-4 border-t border-glass-border flex justify-between">
										<span class="font-bold">Net Value</span>
										<span
											class="text-lg font-bold {fii_dii[0].fii_net >= 0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											₹{formatNumber(fii_dii[0].fii_net)}
										</span>
									</div>
								</div>
							</div>
							<div class="relative">
								<div class="flex justify-between items-center mb-4">
									<h3 class="font-bold text-xl">DII Activity</h3>
									<span
										class="font-bold {fii_dii[0].dii_net >= 0 ? 'text-bullish' : 'text-bearish'}"
									>
										{fii_dii[0].dii_net >= 0 ? 'Net Buy' : 'Net Sell'}
									</span>
								</div>
								<div class="space-y-4">
									<div class="flex justify-between text-sm">
										<span class="text-muted-foreground">Buy Value</span>
										<span class="font-medium">₹{formatNumber(fii_dii[0].dii_buy_value)}</span>
									</div>
									<div class="flex justify-between text-sm">
										<span class="text-muted-foreground">Sell Value</span>
										<span class="font-medium">₹{formatNumber(fii_dii[0].dii_sell_value)}</span>
									</div>
									<div class="pt-4 border-t border-glass-border flex justify-between">
										<span class="font-bold">Net Value</span>
										<span
											class="text-lg font-bold {fii_dii[0].dii_net >= 0
												? 'text-bullish'
												: 'text-bearish'}"
										>
											₹{formatNumber(fii_dii[0].dii_net)}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>

			<!-- Top Movers -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- Top Gainers -->
				<section>
					<h2 class="text-lg font-semibold mb-6 flex items-center gap-2 text-bullish">
						<span class="h-1 w-8 bg-bullish rounded-full"></span>
						Top Gainers
					</h2>
					<div class="glass-panel overflow-hidden rounded-2xl">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-bullish-subtle/30 text-[10px] uppercase tracking-widest text-bullish">
									<th class="px-6 py-4">Symbol</th>
									<th class="px-6 py-4">LTP</th>
									<th class="px-6 py-4 text-right">Change %</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-glass-border">
								{#each top_gainers as gainer}
									<tr class="hover:bg-bullish-subtle/10 transition-colors group">
										<td class="px-6 py-4">
											<span class="font-bold block group-hover:text-bullish transition-colors"
												>{gainer.symbol}</span
											>
											<span class="text-[10px] text-muted-foreground uppercase"
												>{gainer.company_name}</span
											>
										</td>
										<td class="px-6 py-4 font-bold">{formatNumber(gainer.ltp)}</td>
										<td class="px-6 py-4 text-right">
											<span class="text-bullish font-bold">+{gainer.change_pct}%</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>

				<!-- Top Losers -->
				<section>
					<h2 class="text-lg font-semibold mb-6 flex items-center gap-2 text-bearish">
						<span class="h-1 w-8 bg-bearish rounded-full"></span>
						Top Losers
					</h2>
					<div class="glass-panel overflow-hidden rounded-2xl">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-bearish-subtle/30 text-[10px] uppercase tracking-widest text-bearish">
									<th class="px-6 py-4">Symbol</th>
									<th class="px-6 py-4">LTP</th>
									<th class="px-6 py-4 text-right">Change %</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-glass-border">
								{#each top_losers as loser}
									<tr class="hover:bg-bearish-subtle/10 transition-colors group">
										<td class="px-6 py-4">
											<span class="font-bold block group-hover:text-bearish transition-colors"
												>{loser.symbol}</span
											>
											<span class="text-[10px] text-muted-foreground uppercase"
												>{loser.company_name}</span
											>
										</td>
										<td class="px-6 py-4 font-bold">{formatNumber(loser.ltp)}</td>
										<td class="px-6 py-4 text-right">
											<span class="text-bearish font-bold">{loser.change_pct}%</span>
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

<style>
	/* Custom glassmorphism refinements */
	:global(.glass-panel) {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.01) 100%
		);
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	}

	:global(.bg-glass-border) {
		background-color: var(--surface-border);
	}

	/* Subtle glow for the primary elements */
	.text-primary {
		text-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
	}

	/* Custom scrollbar for tables if needed */
	::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: var(--surface-border);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: var(--muted-foreground);
	}
</style>
