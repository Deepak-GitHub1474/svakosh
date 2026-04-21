<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
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
		calculateOiStats,
		calculateActiveStrikes,
		getSymbolUpdate,
		getExpiryUpdate
	} from './_lib/helper';
	import type { TStrikeOIItem } from './_lib/types';
	import { formatNumber as formatCurrency, formatLakh } from '$lib/utils';
	import Info from '$lib/components/svg-provider/Info.svelte';
	import SpotIcon from '$lib/components/svg-provider/SpotIcon.svelte';
	import PcrIcon from '$lib/components/svg-provider/PcrIcon.svelte';
	import StrikeIcon from '$lib/components/svg-provider/StrikeIcon.svelte';
	import DownArrow from '$lib/components/svg-provider/DownArrow.svelte';
	import UpArrow from '$lib/components/svg-provider/UpArrow.svelte';
	import BullishArrow from '$lib/components/svg-provider/BullishArrow.svelte';
	import BearishArrow from '$lib/components/svg-provider/BearishArrow.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';

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
	let selectedExpiry = $state<string | null>(null);
	let chartContainer = $state<HTMLDivElement | null>(null);

	let isSymbolOpen = $state(false);
	let isExpiryOpen = $state(false);

	$effect(() => {
		if (isSymbolOpen) isExpiryOpen = false;
	});

	$effect(() => {
		if (isExpiryOpen) isSymbolOpen = false;
	});

	const symbolOptions = UNDERLYINGS.map((u) => ({
		label: u.symbol,
		value: u.symbol,
		meta: u.exchange
	}));

	const currentData = $derived(MOCK_DATA[symbol] || MOCK_DATA['NIFTY']);

	const expiryOptions = $derived(
		currentData.expiries.map((exp) => ({
			label: exp,
			value: exp
		}))
	);

	const oiStats = $derived.by(() => calculateOiStats(currentData.strikes));

	const activeStrikes = $derived.by((): TStrikeOIItem[] => {
		return calculateActiveStrikes(currentData.strikes, selectedExpiry || currentData.expiry);
	});

	function selectSymbol(s: string) {
		const update = getSymbolUpdate(s);
		symbol = update.symbol;
		selectedExpiry = update.selectedExpiry;
	}

	function selectExpiry(exp: string) {
		const update = getExpiryUpdate(exp);
		selectedExpiry = update.selectedExpiry;
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
					let html = `<div class="mb-2 border-b border-border-muted pb-1">Strike: ${strike}</div>`;
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
							{ offset: 0, color: 'rgba(0, 255, 136, 0.8)' },
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
					itemStyle: { color: 'rgba(255, 61, 0, 0.7)' },
					lineStyle: { width: 1.5, type: 'dashed', opacity: 0.5 }
				},
				{
					name: 'PE Change',
					type: 'line',
					data: peChange,
					smooth: true,
					symbol: 'none',
					itemStyle: { color: 'rgba(0, 255, 136, 0.7)' },
					lineStyle: { width: 1.5, type: 'dashed', opacity: 0.5 }
				}
			]
		};

		chart.setOption(option, true);
	}


	$effect(() => {
		if (activeStrikes) {
			updateChartOptions();
		}
	});

	onMount(() => {
		initChart();
		if (!selectedExpiry) selectedExpiry = currentData.expiry;
	});

	onDestroy(() => {
		if (browser) {
			chart?.dispose();
		}
	});
</script>

<div class="min-h-screen bg-background text-foreground">
	<header class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
		<div in:fade>
			<h1 class="text-2xl tracking-tight text-primary mb-2 flex items-center gap-3">
				Options Analytics
			</h1>
			<p class="text-muted-foreground text-sm">Advanced Open Interest and Strike Analysis</p>
		</div>

		<div class="flex items-center gap-4">
			<SvaKoshSelector
				options={symbolOptions}
				bind:value={symbol}
				bind:isOpen={isSymbolOpen}
				searchable={true}
				onSelect={selectSymbol}
				class="w-52"
			/>

			<SvaKoshSelector
				options={expiryOptions}
				bind:value={selectedExpiry}
				bind:isOpen={isExpiryOpen}
				onSelect={selectExpiry}
				class="w-48"
			/>
		</div>
	</header>

	<section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
		<SvaKoshCard
			label="Spot Price"
			value={formatCurrency(currentData.spot_price)}
			ghostIcon={SpotIcon}
		/>
		<SvaKoshCard
			label="Max Pain"
			value={formatCurrency(currentData.max_pain_strike)}
			variant="primary"
			ghostIcon={Info}
		/>
		<SvaKoshCard
			label="PCR"
			value={currentData.pcr}
			variant={currentData.pcr > 1 ? 'bullish' : 'bearish'}
			meta={currentData.pcr_interpretation}
			ghostIcon={PcrIcon}
		/>
		<SvaKoshCard
			label="ATM Strike"
			value={formatCurrency(currentData.atm_strike)}
			ghostIcon={StrikeIcon}
		/>
		<SvaKoshCard
			label="Total CE OI"
			value={formatLakh(currentData.total_ce_oi)}
			variant="bearish"
			ghostIcon={DownArrow}
		/>
		<SvaKoshCard
			label="Total PE OI"
			value={formatLakh(currentData.total_pe_oi)}
			variant="bullish"
			ghostIcon={UpArrow}
		/>
	</section>

	<SvaKoshCard class="p-6 mb-10">
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
	</SvaKoshCard>

	<section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<div>
			<h3 class="uppercase tracking-widest text-sm text-bullish mb-4 flex items-center gap-2">
				<span class="w-1 h-4 bg-bullish rounded-full"></span>
				Top OI Buildup
				<BullishArrow class="w-4 h-4"/>
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
				<span class="w-1 h-4 bg-bearish rounded-full"></span>
				Significant Unwinding
				<BearishArrow class="w-4 h-4"/>
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
