<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import type { TMarketPulseData, TMarketPulseRow } from './_lib/types';
	import { PULSE_SYMBOLS } from './_lib/const';
	import { callSignal, optionSignal, putSignal } from './_lib/helper';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { SymbolOI } from '$lib/market/oi.svelte';
	import { TodayBars } from '$lib/market/bars.svelte';
	import { totalAt, type TStrikeLeg } from '$lib/market/oi';
	import { barAt, legsByTime, withLive } from '$lib/market/series';
	import { inSession, istTime } from '$lib/market/time';
	import MarketPulseTable from './_components/MarketPulseTable.svelte';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';

	const INTERVAL = 5;

	let selectedSymbol: string = $state('NIFTY');
	let isSymbolOpen: boolean = $state(false);
	let options = $state.raw<SymbolOI | null>(null);
	const spotBars = new TodayBars();
	const futureBars = new TodayBars();

	const view = $derived(options?.chain.view ?? null);
	const spotToken = $derived(view?.spot ?? '');
	const futureToken = $derived(Object.keys(futureBars.data).sort()[0] ?? '');

	const rows = $derived.by((): TMarketPulseRow[] => {
		if (!options || !spotToken) return [];
		const spot = withLive(spotBars.data[spotToken], marketFeed.quotes[spotToken], INTERVAL);
		const future = legsByTime(withLive(futureBars.data[futureToken], marketFeed.quotes[futureToken], INTERVAL), []);
		const ce: TStrikeLeg[] = options.legs('CE');
		const pe: TStrikeLeg[] = options.legs('PE');
		let high = -Infinity;
		let low = Infinity;
		let previous = { ce: 0, pe: 0, fut: 0 };
		return spot.map((bar, index) => {
			const ts = bar[0];
			const time = istTime(ts);
			const ceTotal = totalAt(ce, ts);
			const peTotal = totalAt(pe, ts);
			const fut = future.find((point) => point.time === time)?.ce;
			const ceChange = index ? ceTotal - previous.ce : 0;
			const peChange = index ? peTotal - previous.pe : 0;
			const futChange = index && fut ? fut.oi - previous.fut : 0;
			const atm = ce.reduce<TStrikeLeg | null>(
				(best, leg) => (!best || Math.abs(leg.strike - bar[4]) < Math.abs(best.strike - bar[4]) ? leg : best),
				null
			);
			const atmPe = pe.find((leg) => leg.strike === atm?.strike);
			const dayHL = bar[2] >= high ? 'High' : bar[3] <= low ? 'Low' : 'Normal';
			high = Math.max(high, bar[2]);
			low = Math.min(low, bar[3]);
			previous = { ce: ceTotal, pe: peTotal, fut: fut?.oi ?? previous.fut };
			return {
				time,
				spot: bar[4],
				ceOIChange: ceChange,
				peOIChange: peChange,
				oiChange: ceChange + peChange,
				dayHL: index ? dayHL : 'Normal',
				optionSignal: optionSignal(ceChange, peChange),
				vwap: fut?.atp ?? 0,
				callSignal: callSignal(ceChange),
				putSignal: putSignal(peChange),
				futCOI: futChange,
				atmStraddle:
					Math.round(
						((barAt(atm?.series ?? [], ts)?.[4] ?? 0) + (barAt(atmPe?.series ?? [], ts)?.[4] ?? 0)) * 100
					) / 100
			};
		});
	});

	const forming = $derived(rows.length > 0 && inSession(Date.now()));
	const pulseData: TMarketPulseData = $derived(
		Object.fromEntries((forming ? rows.slice(0, -1) : rows).map((row) => [row.time, row]))
	);
	const liveRow: TMarketPulseRow | null = $derived(forming ? (rows.at(-1) ?? null) : null);

	$effect(() => {
		if (!view) return;
		void spotBars.load(`${view.spot.split(':')[0]}.${view.underlying}`, view.spot, INTERVAL);
		void futureBars.load(`${view.exchange}.${view.underlying}`, `${view.exchange}:FUT:${view.underlying}:`, INTERVAL);
	});

	$effect(() => {
		if (!futureToken) return;
		return marketFeed.subscribe([futureToken], ['ltp', 'oi']);
	});

	function load(symbol: string) {
		options?.stop();
		const next = new SymbolOI(symbol, INTERVAL);
		next.start();
		options = next;
	}

	function handleSymbolChange(val: string): void {
		selectedSymbol = val;
		load(val);
	}

	onMount(() => load(selectedSymbol));

	onDestroy(() => {
		options?.stop();
		spotBars.stop();
		futureBars.stop();
	});
</script>

<svelte:head>
	<title>Market Pulse | SvaKosh</title>
</svelte:head>

<div class="flex flex-col gap-6" in:fade>
	<header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl tracking-tight text-primary mb-1">
				Market Pulse
			</h1>
			<p class="text-muted-foreground text-sm">
				Real-time intraday sentiment and open interest snapshots
			</p>
		</div>

		<div class="flex items-center gap-3">
			<div class="w-full sm:w-40">
				<SvaKoshSelector 
					options={PULSE_SYMBOLS} 
					bind:value={selectedSymbol} 
					bind:isOpen={isSymbolOpen}
					onSelect={handleSymbolChange}
					placeholder="Symbol"
				/>
			</div>
		</div>
	</header>

	<div class="glass-panel p-4 rounded-xl border border-border-subtle bg-surface/5">
		<h4 class="text-xs text-primary uppercase tracking-wider mb-2">How to read Market Pulse?</h4>
		<p class="text-xs text-muted-foreground leading-relaxed">
			Market Pulse provides cumulative intraday trend analysis. Observe the <span class="text-bullish">Option Signal</span> and 
			<span class="text-primary">VWAP</span> correlations to identify momentum. 
			Snapshots are calculated every 5 minutes, while the latest row updates every 10 seconds with the latest tick.
		</p>
	</div>

	<div class="w-full" in:slide={{ delay: 200 }}>
		{#if Object.keys(pulseData).length > 0}
			<MarketPulseTable {pulseData} {liveRow} />
		{:else}
			<SvaKoshCard class="h-[500px] flex items-center justify-center">
				<div class="flex flex-col items-center gap-4">
					<div class="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
					<p class="text-xs text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Scanning Market Pulse...</p>
				</div>
			</SvaKoshCard>
		{/if}
	</div>
</div>
