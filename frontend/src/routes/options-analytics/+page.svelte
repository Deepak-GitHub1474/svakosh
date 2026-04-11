<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { browser } from '$app/environment';
	import * as echarts from 'echarts/core';
	import { BarChart, LineChart } from 'echarts/charts';
	import {
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent,
		MarkLineComponent
	} from 'echarts/components';
	import { CanvasRenderer } from 'echarts/renderers';
	import { UNDERLYINGS, MOCK_DATA } from './_lib/mock-data';
	import {
		formatLakh,
		formatCurrency,
		calculateOiStats,
		calculateActiveStrikes,
		getSymbolUpdate,
		getExpiryUpdate
	} from './_lib/helper';
	import type { TStrikeOIItem } from './_lib/types';

	if (browser) {
		echarts.use([
			BarChart,
			LineChart,
			TooltipComponent,
			GridComponent,
			LegendComponent,
			DataZoomComponent,
			MarkLineComponent,
			CanvasRenderer
		]);
	}

	let chart: echarts.ECharts | null = null;
	let symbol = $state('NIFTY');
	let searchQuery = $state('');
	let showSymbolDropdown = $state(false);
	let showExpiryDropdown = $state(false);
	let selectedExpiry = $state<string | null>(null);
	let chartContainer = $state<HTMLDivElement | null>(null);

	const currentData = $derived(MOCK_DATA[symbol] || MOCK_DATA['NIFTY']);
	
	const filteredUnderlyings = $derived.by(() => {
		const q = searchQuery.trim().toUpperCase();
		if (!q) return UNDERLYINGS;
		return UNDERLYINGS.filter((u) => u.symbol.includes(q));
	});

	const oiStats = $derived.by(() => calculateOiStats(currentData.strikes));

	const activeStrikes = $derived.by((): TStrikeOIItem[] => {
		return calculateActiveStrikes(currentData.strikes, selectedExpiry || currentData.expiry);
	});

	function selectSymbol(s: string) {
		const update = getSymbolUpdate(s);
		symbol = update.symbol;
		showSymbolDropdown = update.showSymbolDropdown;
		searchQuery = update.searchQuery;
		selectedExpiry = update.selectedExpiry;
	}

	function selectExpiry(exp: string) {
		const update = getExpiryUpdate(exp);
		selectedExpiry = update.selectedExpiry;
		showExpiryDropdown = update.showExpiryDropdown;
	}

	function initChart() {
		if (!chartContainer) return;

		chart = echarts.init(chartContainer, 'dark', { renderer: 'canvas' });
		updateChartOptions();

		window.addEventListener('resize', () => chart?.resize());
	}

	function updateChartOptions() {
		if (!chart) return;

		const data = currentData;
		const strikes = activeStrikes.map((s) => s.strike.toString());
		const ceOI = activeStrikes.map((s) => s.ce_oi / 100000);
		const peOI = activeStrikes.map((s) => s.pe_oi / 100000);
		const ceChange = activeStrikes.map((s) => s.ce_oi_change / 100000);
		const peChange = activeStrikes.map((s) => s.pe_oi_change / 100000);

		const option: echarts.EChartsCoreOption = {
			backgroundColor: 'transparent',
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				backgroundColor: 'rgba(28, 31, 36, 0.9)',
				borderColor: 'rgba(212, 175, 55, 0.3)',
				borderWidth: 1,
				textStyle: { color: '#e2e8f0', fontSize: 12 },
				formatter: (params: any) => {
					const strike = params[0].name;
					let html = `<div class="mb-2 border-b border-white/10 pb-1">Strike: ${strike}</div>`;
					params.forEach((p: any) => {
						const color = typeof p.color === 'object' ? p.color.colorStops[0].color : p.color;
						const val = p.value.toFixed(2);
						html += `<div class="flex justify-between gap-4 mb-1">
							<span style="color:${color}">● ${p.seriesName}</span>
							<span class="font-mono">${val}L</span>
						</div>`;
					});
					return html;
				}
			},
			legend: {
				data: ['CE OI', 'PE OI', 'CE Change', 'PE Change'],
				textStyle: { color: '#94a3b8' },
				bottom: 0
			},
			grid: {
				top: '12%',
				left: '3%',
				right: '3%',
				bottom: '15%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: strikes,
				axisLabel: { 
					color: (val: string) => parseInt(val) === data.atm_strike ? '#fff' : '#94a3b8',
					rotate: 45,
					fontSize: 10,
					fontWeight: 'normal'
				},
				axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
			},
			yAxis: {
				type: 'value',
				name: 'OI (Lakhs)',
				nameTextStyle: { color: '#94a3b8', fontSize: 10 },
				axisLabel: { color: '#94a3b8', fontSize: 10 },
				splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
			},
			dataZoom: [
				{ type: 'inside', start: 30, end: 70 },
				{ type: 'slider', start: 30, end: 70, height: 20, bottom: 40, borderColor: 'transparent', fillerColor: 'rgba(212, 175, 55, 0.1)', handleStyle: { color: '#d4af37' }, textStyle: { color: '#94a3b8', fontSize: 10 } }
			],
			series: [
				{
					name: 'CE OI',
					type: 'bar',
					data: ceOI,
					barWidth: 12,
					barCategoryGap: '20%',
					itemStyle: { 
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(255, 61, 0, 0.8)' },
							{ offset: 1, color: 'rgba(255, 61, 0, 0.1)' }
						]),
						borderRadius: [4, 4, 0, 0]
					},
					markLine: {
						symbol: ['none', 'none'],
						label: {
							show: true,
							position: 'end',
							formatter: 'Max Pain {c}',
							backgroundColor: 'rgba(212, 175, 55, 0.1)',
							color: '#d4af37',
							padding: [4, 8],
							borderRadius: 4,
							borderWidth: 1,
							borderColor: 'rgba(212, 175, 55, 0.3)',
							fontSize: 10,
							fontWeight: 'normal'
						},
						lineStyle: {
							color: '#d4af37',
							type: 'dashed',
							width: 1,
							opacity: 0.8
						},
						data: [{ xAxis: data.max_pain_strike.toString() }]
					}
				},
				{
					name: 'PE OI',
					type: 'bar',
					data: peOI,
					barWidth: 12,
					barCategoryGap: '10%',
					itemStyle: { 
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: 'rgba(0, 255, 136, 0.8)' }, // bullish
							{ offset: 1, color: 'rgba(0, 255, 136, 0.1)' }
						]),
						borderRadius: [4, 4, 0, 0]
					}
				},
				{
					name: 'CE Change',
					type: 'line',
					data: ceChange,
					smooth: true,
					symbol: 'none',
					itemStyle: { color: 'rgba(255, 61, 0, 0.7)' }, // bearish
					lineStyle: { width: 1.5, type: 'dashed', opacity: 0.5 }
				},
				{
					name: 'PE Change',
					type: 'line',
					data: peChange,
					smooth: true,
					symbol: 'none',
					itemStyle: { color: 'rgba(0, 255, 136, 0.7)' }, // bullish
					lineStyle: { width: 1.5, type: 'dashed', opacity: 0.5 }
				}
			]
		};

		chart.setOption(option, true);
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.dropdown-trigger')) {
			showSymbolDropdown = false;
			showExpiryDropdown = false;
		}
	}

	$effect(() => {
		if (activeStrikes) {
			updateChartOptions();
		}
	});

	onMount(() => {
		initChart();
		if (!selectedExpiry) selectedExpiry = currentData.expiry;
		window.addEventListener('click', handleOutsideClick);
	});

	onDestroy(() => {
		if (browser) {
			chart?.dispose();
			window.removeEventListener('click', handleOutsideClick);
		}
	});
</script>

<div class="min-h-screen bg-background p-4 md:px-8 md:pb-8 text-foreground">
	<header class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
		<div in:fade>
			<h1 class="text-2xl tracking-tight text-primary mb-2 flex items-center gap-3">
				Options Analytics
			</h1>
			<p class="text-muted-foreground text-sm">Advanced Open Interest and Strike Analysis</p>
		</div>

		<div class="flex items-center gap-4">
			<div class="relative w-52 dropdown-trigger">
				<button 
					onclick={() => { showSymbolDropdown = !showSymbolDropdown; showExpiryDropdown = false; }}
					class="w-full glass-panel px-4 py-3 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-all"
				>
					<span class="tracking-wide text-sm">{symbol}</span>
					<svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors {showSymbolDropdown ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showSymbolDropdown}
					<div 
						class="absolute top-full mt-2 left-0 w-full glass-panel border border-primary/20 rounded-xl z-50 overflow-hidden shadow-2xl"
						transition:fly={{ y: -10, duration: 200 }}
					>
						<div class="border-b border-white/5">
							<input 
								bind:value={searchQuery}
								placeholder="Search symbol..."
								class="w-full px-3 py-4 rounded-t-lg text-xs border border-white/5 focus:outline-0"
							/>
						</div>
						<div class="min-h-[130px] max-h-60 overflow-y-auto">
							{#each filteredUnderlyings as u}
								<button 
									onclick={() => selectSymbol(u.symbol)}
									class="w-full px-4 py-3 text-left text-xs hover:bg-primary/5 transition-colors flex items-center justify-between {symbol === u.symbol ? 'text-primary bg-primary/10 border-l-2 border-primary' : ''}"
								>
									<div class="flex items-center gap-2">
										<span>{u.symbol}</span>
										{#if symbol === u.symbol}
											<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
										{/if}
									</div>
									<span class="text-[0.714rem] text-muted-foreground">{u.exchange}</span>
								</button>
							{:else}
								<div class="p-8 text-center" in:fade>
									<svg class="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
									</svg>
									<p class="text-[0.786rem] text-muted-foreground">No matches for "<span class="text-foreground/70">{searchQuery}</span>"</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<div class="relative w-48 dropdown-trigger">
				<button 
					onclick={() => { showExpiryDropdown = !showExpiryDropdown; showSymbolDropdown = false; }}
					class="w-full glass-panel px-4 py-3 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-all tracking-wide"
				>
					<span class="text-sm">{selectedExpiry}</span>
					<svg class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors {showExpiryDropdown ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showExpiryDropdown}
					<div 
						class="absolute top-full mt-2 left-0 w-full glass-panel border border-primary/20 rounded-xl z-50 overflow-hidden shadow-2xl"
						transition:fly={{ y: -10, duration: 200 }}
					>
						<div class="max-h-60 overflow-y-auto">
							{#each currentData.expiries as exp}
								<button 
									onclick={() => selectExpiry(exp)}
									class="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors flex items-center justify-between {selectedExpiry === exp ? 'text-primary bg-primary/10 border-l-2 border-primary' : ''}"
								>
									<span class="text-sm">{exp}</span>
									{#if selectedExpiry === exp}
										<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
		<div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
			<div class="text-[0.714rem] text-muted-foreground uppercase tracking-widest mb-1">Spot Price</div>
			<div class="text-lg">{formatCurrency(currentData.spot_price)}</div>
			<div class="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
				<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
			</div>
		</div>
		<div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
			<div class="text-[0.714rem] text-muted-foreground uppercase tracking-widest mb-1">Max Pain</div>
			<div class="text-lg text-primary">{formatCurrency(currentData.max_pain_strike)}</div>
			<div class="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
				<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
			</div>
		</div>
		<div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
			<div class="text-[0.714rem] text-muted-foreground uppercase tracking-widest mb-1">PCR</div>
			<div class="flex items-baseline gap-2">
				<span class="text-lg {currentData.pcr > 1 ? 'text-bullish' : 'text-bearish'}">{currentData.pcr}</span>
				<span class="text-[0.714rem] opacity-60">({currentData.pcr_interpretation})</span>
			</div>
			<div class="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
				<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M13 11h9v2h-9v-2zm-2 0h-9v2h9v-2zm1-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
			</div>
		</div>
		<div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
			<div class="text-[0.714rem] text-muted-foreground uppercase tracking-widest mb-1">ATM Strike</div>
			<div class="text-lg">{formatCurrency(currentData.atm_strike)}</div>
			<div class="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
				<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v2c0 1.1.9 2 2 2h2v-2H5v-2zM5 5h2V3H5c-1.1 0-2 .9-2 2v2h2V5zm14-2h-2v2h2v2h2V5c0-1.1-.9-2-2-2zm0 16h-2v2h2c1.1 0 2-.9 2-2v-2h-2v2z"/></svg>
			</div>
		</div>
		<div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
			<div class="text-[0.714rem] text-muted-foreground uppercase tracking-widest mb-1">Total CE OI</div>
			<div class="text-lg text-bearish">{formatLakh(currentData.total_ce_oi)}</div>
			<div class="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
				<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>
			</div>
		</div>
		<div class="glass-panel p-4 rounded-xl relative overflow-hidden group">
			<div class="text-[0.714rem] text-muted-foreground uppercase tracking-widest mb-1">Total PE OI</div>
			<div class="text-lg text-bullish">{formatLakh(currentData.total_pe_oi)}</div>
			<div class="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
				<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>
			</div>
		</div>
	</section>

	<section class="glass-panel p-6 rounded-xl mb-10">
		<div class="flex items-center justify-between mb-2">
			<div>
				<h2 class="flex items-center gap-2">
					<span class="w-1 h-4 bg-primary rounded-full"></span>
					Open Interest Distribution
				</h2>
				<p class="text-xs text-muted-foreground mt-1">Multi-Strike Analysis for {selectedExpiry}</p>
			</div>
		</div>
		<div bind:this={chartContainer} class="w-full h-[450px]"></div>
	</section>

	<section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<div>
			<h3 class="uppercase tracking-widest text-sm text-bullish mb-4 flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
				Top OI Buildup
			</h3>
			<div class="glass-panel overflow-hidden rounded-xl">
				<table class="w-full text-left">
					<thead>
						<tr class="bg-white/5 text-muted-foreground">
							<th class="px-6 py-4">Strike</th>
							<th class="px-6 py-4 text-right">CE Change</th>
							<th class="px-6 py-4 text-right">PE Change</th>
							<th class="px-6 py-4 text-right">Net Chg</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each oiStats.buildups as s}
							<tr class="hover:bg-white/5 transition-colors group">
								<td class="px-6 py-4">{formatCurrency(s.strike)}</td>
								<td class="px-6 py-4 text-right tabular-nums {s.ce_oi_change >= 0 ? 'text-bearish' : 'text-bullish'}">
									{s.ce_oi_change >= 0 ? '+' : ''}{formatLakh(s.ce_oi_change)}
								</td>
								<td class="px-6 py-4 text-right tabular-nums {s.pe_oi_change >= 0 ? 'text-bullish' : 'text-bearish'}">
									{s.pe_oi_change >= 0 ? '+' : ''}{formatLakh(s.pe_oi_change)}
								</td>
								<td class="px-6 py-4 text-right tabular-nums">
									+{formatLakh(s.ce_oi_change + s.pe_oi_change)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div>
			<h3 class="uppercase tracking-widest text-sm text-bearish mb-4 flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/></svg>
				Significant Unwinding
			</h3>
			<div class="glass-panel overflow-hidden rounded-xl">
				<table class="w-full text-left">
					<thead>
						<tr class="bg-white/5 text-muted-foreground">
							<th class="px-6 py-4">Strike</th>
							<th class="px-6 py-4 text-right">CE Change</th>
							<th class="px-6 py-4 text-right">PE Change</th>
							<th class="px-6 py-4 text-right">Net Chg</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each oiStats.unwindings as s}
							<tr class="hover:bg-white/5 transition-colors group">
								<td class="px-6 py-4">{formatCurrency(s.strike)}</td>
								<td class="px-6 py-4 text-right tabular-nums {s.ce_oi_change >= 0 ? 'text-bearish' : 'text-bullish'}">
									{s.ce_oi_change >= 0 ? '+' : ''}{formatLakh(s.ce_oi_change)}
								</td>
								<td class="px-6 py-4 text-right tabular-nums {s.pe_oi_change >= 0 ? 'text-bullish' : 'text-bearish'}">
									{s.pe_oi_change >= 0 ? '+' : ''}{formatLakh(s.pe_oi_change)}
								</td>
								<td class="px-6 py-4 text-right tabular-nums text-bearish">
									{formatLakh(s.ce_oi_change + s.pe_oi_change)}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="4" class="px-6 py-10 text-center text-muted-foreground italic">No significant unwinding detected</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</div>
