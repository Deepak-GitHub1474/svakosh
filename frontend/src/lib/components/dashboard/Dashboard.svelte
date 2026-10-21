<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import * as echarts from 'echarts';
	import { DEFAULT_INTRADAY_INTERVAL, INDEX_OPTIONS, INTRADAY_INTERVALS, METRICS, SECTORS, TOP_MOVERS_LIMIT } from './const';
	import { getIntradayOptions, getBreadthOptions, getSectorOptions, getSentiment, intradayPoints } from './helper';
	import { changeOf, marketFeed } from '$lib/market/feed.svelte';
	import { breadthOf, moversOf } from '$lib/market/analytics';
	import { getBars, getIntraday, getMarketOverview } from '$lib/market/service';
	import type { TCandle, TStockItem } from '$lib/market/types';
	import { formatNumber } from '$lib/utils/helper';
	import { inSession, istMinutes, SESSION_END_MINUTES } from '$lib/market/time';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import Monitoring from '$lib/components/svg-provider/material/Monitoring.svelte';

	let isSelectorOpen = $state(false);
	let selectedIndex = $state(INDEX_OPTIONS[0].value);
	let stocks = $state<TStockItem[]>([]);
	let candles = $state<TCandle[]>([]);
	let interval = $state(DEFAULT_INTRADAY_INTERVAL);
	let intradayLoading = $state(true);

	const INTERVAL_KEY = 'svakosh:intraday-interval';

	const selectedToken = $derived(INDEX_OPTIONS.find((o) => o.value === selectedIndex)?.token ?? INDEX_OPTIONS[0].token);
	const minutes = $derived(Number(interval));
	const intraday = $derived(intradayPoints(candles, minutes, marketFeed.quotes[selectedToken]?.ltp));
	const breadth = $derived(breadthOf(stocks, marketFeed.quotes));
	const advances = $derived(breadth.advances);
	const declines = $derived(breadth.declines);
	const unchanged = $derived(breadth.unchanged);
	const topMovers = $derived(moversOf(stocks, marketFeed.quotes).gainers.slice(0, TOP_MOVERS_LIMIT));
	const sectors = $derived(
		SECTORS.map((s) => ({ name: s.name, change: changeOf(marketFeed.quotes[s.sk_token]).change_pct }))
	);

	let intradayChartEl: HTMLElement, breadthChartEl: HTMLElement, sectorChartEl: HTMLElement;
	let intradayChart = $state<echarts.ECharts>(), breadthChart = $state<echarts.ECharts>(), sectorChart = $state<echarts.ECharts>();
	let resizeObserver: ResizeObserver;
	let stopIndices: (() => void) | undefined;
	let stopStocks: (() => void) | undefined;
	let active = true;
	const sentimentClasses = { bullish: 'text-bullish', bearish: 'text-bearish', muted: 'text-muted-foreground' };

	let intradayLoad = 0;
	let intradayTimer: ReturnType<typeof setTimeout> | undefined;

	async function todayBars(token: string): Promise<TCandle[]> {
		const [exchange, , name] = token.split(':');
		const res = await getBars(`${exchange}.${name}`, token, minutes);
		const bars = res.ok ? (res.data[token] ?? []) : [];
		return bars.map(([ts, open, high, low, close, volume]) => ({ ts, open, high, low, close, volume }));
	}

	async function loadIntraday(token: string, switching = false) {
		const load = ++intradayLoad;
		const step = minutes * 60_000;
		clearTimeout(intradayTimer);
		intradayLoading = switching || candles.length === 0;
		const today = await todayBars(token);
		if (load !== intradayLoad || !active) return;
		if (inSession(Date.now()) || today.length > 1) {
			candles = today;
		} else {
			const res = await getIntraday(token, minutes);
			if (load !== intradayLoad || !active) return;
			candles = res.ok ? res.data : [];
		}
		intradayLoading = false;
		if (istMinutes(Date.now()) < SESSION_END_MINUTES) {
			intradayTimer = setTimeout(() => loadIntraday(token), step - (Date.now() % step) + 5_000);
		}
	}

	function rememberInterval(value: string) {
		try {
			localStorage.setItem(INTERVAL_KEY, value);
		} catch {
			return;
		}
	}

	function savedInterval(): string | undefined {
		try {
			const saved = localStorage.getItem(INTERVAL_KEY);
			return INTRADAY_INTERVALS.some((i) => i.value === saved) ? (saved ?? undefined) : undefined;
		} catch {
			return undefined;
		}
	}

	function handleIntervalChange(value: string) {
		if (value === interval) return;
		interval = value;
		rememberInterval(value);
		loadIntraday(selectedToken, true);
	}

	function handleIndexChange(val: string) {
		const opt = INDEX_OPTIONS.find((o) => o.value === val);
		if (opt) loadIntraday(opt.token, true);
	}

	let intradayDraw: ReturnType<typeof setTimeout> | undefined;
	let intradayDrawnAt = 0;
	let drawnCandles: TCandle[] | undefined;

	$effect(() => {
		const chart = intradayChart;
		const source = candles;
		if (!chart || (intradayLoading && source.length)) return;
		const options = getIntradayOptions(intraday, selectedIndex, minutes, marketFeed.quotes[selectedToken]?.prev_close);
		const wait = source === drawnCandles ? Math.max(0, 1000 - (Date.now() - intradayDrawnAt)) : 0;
		clearTimeout(intradayDraw);
		intradayDraw = setTimeout(() => {
			intradayDrawnAt = Date.now();
			drawnCandles = source;
			chart.setOption(options);
		}, wait);
	});

	$effect(() => {
		if (breadthChart) {
			breadthChart.setOption(
				getBreadthOptions({ advances, declines, unchanged, total: advances + declines + unchanged })
			);
		}
	});

	$effect(() => {
		if (sectorChart) sectorChart.setOption(getSectorOptions(sectors));
	});

	onMount(async () => {
		intradayChart = echarts.init(intradayChartEl);
		breadthChart = echarts.init(breadthChartEl);
		sectorChart = echarts.init(sectorChartEl);

		resizeObserver = new ResizeObserver(() => {
			[intradayChart, breadthChart, sectorChart].forEach(c => c?.resize());
		});

		[intradayChartEl, breadthChartEl, sectorChartEl].forEach(el => {
			if (el) resizeObserver.observe(el);
		});

		interval = savedInterval() ?? interval;
		loadIntraday(selectedToken);
		stopIndices = marketFeed.subscribe([...METRICS, ...SECTORS].map((item) => item.sk_token));
		const res = await getMarketOverview();
		if (active && res.ok) {
			stocks = res.data.stocks;
			stopStocks = marketFeed.subscribe(stocks.map((s) => s.sk_token));
		}
	});

	onDestroy(() => {
		active = false;
		clearTimeout(intradayTimer);
		clearTimeout(intradayDraw);
		if (resizeObserver) resizeObserver.disconnect();
		stopIndices?.();
		stopStocks?.();
		[intradayChart, breadthChart, sectorChart].forEach(c => c?.dispose());
	});
</script>

<div class="flex flex-col gap-4 py-2" in:fade={{ duration: 600 }}>
	<header>
		<h1 class="text-2xl tracking-tight text-primary mb-1">
			Market Intelligence
		</h1>
		<p class="text-muted-foreground text-sm">Indian Stock Market Overview & Real-time Analytics</p>
	</header>

	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
		{#each METRICS as item, i (item.sk_token)}
			{@const quote = marketFeed.quotes[item.sk_token]}
			{@const metric = { label: item.label, value: quote?.ltp ?? 0, ...changeOf(quote) }}
			<div in:fly={{ y: 20, delay: i * 100 }}>
				<SvaKoshCard class="relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
					<div class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground uppercase tracking-widest">{metric.label}</span>
						<div class="flex flex-col gap-0.5 mt-1 xl:flex-row xl:items-baseline xl:gap-2 xl:whitespace-nowrap">
							<span class="text-lg tracking-tight sm:text-xl">{formatNumber(metric.value)}</span>
							<span class="text-[0.6875rem] sm:text-xs {sentimentClasses[getSentiment(metric.change_pct)]}">
								{metric.change > 0 ? '+' : ''}{formatNumber(metric.change)} ({metric.change_pct}%)
							</span>
						</div>
					</div>
					<div class="absolute right-4 bottom-1 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
						<Monitoring class="!text-6xl" />
					</div>
				</SvaKoshCard>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2" in:fly={{ y: 20, delay: 400 }}>
			<SvaKoshCard class="flex flex-col lg:h-[25rem]">
				<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<div class="w-1 h-5 bg-primary rounded-full"></div>
						<h3 class="text-lg tracking-tight whitespace-nowrap">Market Intraday</h3>
					</div>
					<div class="order-3 flex basis-full justify-end lg:order-2 lg:ml-auto lg:basis-auto">
						<SvaKoshTabs tabs={INTRADAY_INTERVALS} activeTab={interval} onTabChange={handleIntervalChange} />
					</div>
					<div class="order-2 lg:order-3">
						<SvaKoshSelector
							class="w-40"
							placement="bottom"
							options={INDEX_OPTIONS}
							bind:value={selectedIndex}
							bind:isOpen={isSelectorOpen}
							onSelect={handleIndexChange}
							placeholder="Select Index"
						/>
					</div>
				</div>
				<div class="relative h-[19.5rem] w-full">
					<div bind:this={intradayChartEl} class="h-full w-full"></div>
					{#if intradayLoading}
						<SvaKoshLoader inline message="" />
					{/if}
				</div>
			</SvaKoshCard>
		</div>

		<div in:fly={{ y: 20, delay: 500 }}>
			<SvaKoshCard class="flex flex-col h-[25rem]">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-1 h-5 bg-bullish rounded-full"></div>
					<h3 class="text-lg tracking-tight">Market Breadth</h3>
				</div>
				<div bind:this={breadthChartEl} class="h-[13.75rem] w-full"></div>
				<div class="grid grid-cols-3 gap-3 mt-4">
					<div class="glass-panel p-3 rounded-xl border-bullish/10">
						<span class="text-[0.625rem] text-muted-foreground uppercase block mb-1 truncate">Advances</span>
						<span class="text-lg text-bullish">{breadth.advances}</span>
					</div>
					<div class="glass-panel p-3 rounded-xl border-bearish/10">
						<span class="text-[0.625rem] text-muted-foreground uppercase block mb-1 truncate">Declines</span>
						<span class="text-lg text-bearish">{breadth.declines}</span>
					</div>
					<div class="glass-panel p-3 rounded-xl border-border-muted">
						<span class="text-[0.625rem] text-muted-foreground uppercase block mb-1 truncate">Unchanged</span>
						<span class="text-lg text-muted-foreground">{breadth.unchanged}</span>
					</div>
				</div>
			</SvaKoshCard>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div in:fly={{ y: 20, delay: 600 }}>
			<SvaKoshCard class="flex flex-col h-[21.875rem]">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-1 h-5 bg-primary rounded-full"></div>
					<h3 class="text-lg tracking-tight">Sectoral Performance</h3>
				</div>
				<div bind:this={sectorChartEl} class="h-[15.625rem] w-full"></div>
			</SvaKoshCard>
		</div>

		<div in:fly={{ y: 20, delay: 700 }}>
			<SvaKoshCard class="flex flex-col h-[21.875rem]">
				<div class="flex items-center gap-3 mb-6">
					<div class="w-1 h-5 bg-bullish rounded-full"></div>
					<h3 class="text-lg tracking-tight">Top Movers</h3>
				</div>
				<div class="overflow-y-auto hide-scrollbar flex-1">
					<table class="w-full text-left">
						<thead>
							<tr class="text-[0.625rem] text-muted-foreground uppercase tracking-widest border-b border-white/5">
								<th class="py-2">Symbol</th>
								<th class="py-2">LTP</th>
								<th class="py-2 text-right">Change</th>
								<th class="py-2 text-right">Chg%</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-white/5">
							{#each topMovers as stock (stock.sk_token)}
								<tr class="group hover:bg-white/[0.02] transition-colors">
									<td class="py-3 text-sm text-foreground">{stock.symbol}</td>
									<td class="py-3 text-sm text-muted-foreground">{formatNumber(stock.ltp)}</td>
									<td class="py-3 text-right text-sm text-bullish">+{formatNumber(stock.change)}</td>
									<td class="py-3 text-right text-sm text-bullish">+{stock.change_pct}%</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</SvaKoshCard>
		</div>
	</div>
</div>
