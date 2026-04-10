<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
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
	import { fade, fly } from 'svelte/transition';
	import { UNDERLYINGS, MOCK_DATA } from './mock-data';
	import type { OptionsAnalyticsData, StrikeOIItem } from './types';

	let symbol = $state('NIFTY');
	let selectedExpiry = $state<string | null>(null);
	let loading = $state(false);
	let showSymbolDropdown = $state(false);
	let showExpiryDropdown = $state(false);
	let searchQuery = $state('');
	let chartContainer = $state<HTMLDivElement | null>(null);

	const currentData = $derived(MOCK_DATA[symbol] || MOCK_DATA['NIFTY']);
	const filteredUnderlyings = $derived.by(() => {
		const q = searchQuery.trim().toUpperCase();
		if (!q) return UNDERLYINGS;
		return UNDERLYINGS.filter((u) => u.symbol.includes(q));
	});

	const oiStats = $derived.by(() => {
		const strikes = currentData.strikes;
		const buildups = [...strikes]
			.sort((a, b) => (b.ce_oi_change + b.pe_oi_change) - (a.ce_oi_change + a.pe_oi_change))
			.slice(0, 5);
		const unwindings = [...strikes]
			.sort((a, b) => (a.ce_oi_change + b.pe_oi_change) - (b.ce_oi_change + a.pe_oi_change))
			.filter(s => s.ce_oi_change + s.pe_oi_change < 0)
			.slice(0, 5);
		return { buildups, unwindings };
	});


	let chart: echarts.ECharts | null = null;

	function initChart() {
		if (!chartContainer) return;
		
		chart = echarts.init(chartContainer, 'dark', { renderer: 'canvas' });
		updateChartOptions();

		window.addEventListener('resize', () => chart?.resize());
	}


	const activeStrikes = $derived.by(() => {
		if (!selectedExpiry) return currentData.strikes;
		
		// Create a hash from the expiry string to ensure unique variations for each date
		let hash = 0;
		for (let i = 0; i < selectedExpiry.length; i++) {
			hash = (hash << 5) - hash + selectedExpiry.charCodeAt(i);
			hash |= 0;
		}
		const seed = Math.abs(hash);

		return currentData.strikes.map((s, i) => ({
			...s,
			ce_oi: s.ce_oi * (0.8 + ((i + seed) % 10) / 20),
			pe_oi: s.pe_oi * (0.8 + ((i + seed + 3) % 10) / 20),
			ce_oi_change: s.ce_oi_change * (0.8 + ((i + seed + 7) % 10) / 20),
			pe_oi_change: s.pe_oi_change * (0.8 + ((i + seed + 11) % 10) / 20)
		}));
	});

	function updateChartOptions() {
		if (!chart) return;

		const data = currentData;
		const strikes = activeStrikes.map(s => s.strike.toString());
		const ceOI = activeStrikes.map(s => s.ce_oi / 100000);
		const peOI = activeStrikes.map(s => s.pe_oi / 100000);
		const ceChange = activeStrikes.map(s => s.ce_oi_change / 100000);
		const peChange = activeStrikes.map(s => s.pe_oi_change / 100000);

		const option: echarts.EChartsOption = {
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
					let html = `<div class="font-bold mb-2 border-b border-white/10 pb-1">Strike: ${strike}</div>`;
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
					fontWeight: (val: string) => parseInt(val) === data.atm_strike ? 'bold' : 'normal'
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
							formatter: 'Max Pain ₹{c}',
							backgroundColor: 'rgba(212, 175, 55, 0.1)',
							color: '#d4af37',
							padding: [4, 8],
							borderRadius: 4,
							borderWidth: 1,
							borderColor: 'rgba(212, 175, 55, 0.3)',
							fontSize: 10,
							fontWeight: 'bold'
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
					itemStyle: { color: '#ff8a80' },
					lineStyle: { width: 1.5, type: 'dashed', opacity: 0.5 }
				},
				{
					name: 'PE Change',
					type: 'line',
					data: peChange,
					smooth: true,
					symbol: 'none',
					itemStyle: { color: '#b9f6ca' },
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

	function formatLakh(v: number) {
		return (v / 100000).toFixed(2) + 'L';
	}

	function formatCurrency(v: number) {
		return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
	}

	function selectSymbol(s: string) {
		symbol = s;
		showSymbolDropdown = false;
		searchQuery = '';
		selectedExpiry = MOCK_DATA[s].expiry;
	}

	function selectExpiry(exp: string) {
		selectedExpiry = exp;
		showExpiryDropdown = false;
	}
</script>

<div class="min-h-screen bg-[#08090a] p-6 md:p-10 font-sans text-[#e2e8f0]">

	<header class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
		<div in:fade>
			<h1 class="text-4xl font-bold tracking-tight text-[#d4af37] mb-2 flex items-center gap-3">
				Options Analytics
			</h1>
			<p class="text-[#94a3b8]">Advanced Open Interest and Strike Analysis</p>
		</div>

		<div class="flex items-center gap-4">
			<!-- Symbol Search -->
			<div class="relative w-64 dropdown-trigger">
				<button 
					onclick={() => { showSymbolDropdown = !showSymbolDropdown; showExpiryDropdown = false; }}
					class="w-full glass-panel px-4 py-3 rounded-xl flex items-center justify-between group hover:border-[#d4af37]/40 transition-all"
				>
					<span class="font-bold text-sm tracking-wide">{symbol}</span>
					<svg class="w-4 h-4 text-[#94a3b8] group-hover:text-[#d4af37] transition-colors {showSymbolDropdown ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showSymbolDropdown}
					<div 
						class="absolute top-full mt-2 left-0 w-full glass-panel border border-[#d4af37]/20 rounded-xl z-50 overflow-hidden shadow-2xl"
						transition:fly={{ y: -10, duration: 200 }}
					>
						<div class="p-2 border-b border-white/5">
							<input 
								bind:value={searchQuery}
								placeholder="Search symbol..."
								class="w-full bg-[#08090a] px-3 py-2 rounded-lg text-xs border border-white/5 focus:outline-none focus:border-[#d4af37]/30"
							/>
						</div>
						<div class="max-h-60 overflow-y-auto">
							{#each filteredUnderlyings as u}
								<button 
									onclick={() => selectSymbol(u.symbol)}
									class="w-full px-4 py-3 text-left text-sm hover:bg-[#d4af37]/5 transition-colors flex items-center justify-between {symbol === u.symbol ? 'text-[#d4af37] bg-[#d4af37]/5' : ''}"
								>
									<span class="font-bold">{u.symbol}</span>
									<span class="text-[10px] text-[#94a3b8]">{u.exchange}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Expiry Selector -->
			<div class="relative w-48 dropdown-trigger">
				<button 
					onclick={() => { showExpiryDropdown = !showExpiryDropdown; showSymbolDropdown = false; }}
					class="w-full glass-panel px-4 py-3 rounded-xl flex items-center justify-between group hover:border-[#d4af37]/40 transition-all font-bold text-sm tracking-wide"
				>
					<span>{selectedExpiry}</span>
					<svg class="w-4 h-4 text-[#94a3b8] group-hover:text-[#d4af37] transition-colors {showExpiryDropdown ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showExpiryDropdown}
					<div 
						class="absolute top-full mt-2 left-0 w-full glass-panel border border-[#d4af37]/20 rounded-xl z-50 overflow-hidden shadow-2xl"
						transition:fly={{ y: -10, duration: 200 }}
					>
						<div class="max-h-60 overflow-y-auto">
							{#each currentData.expiries as exp}
								<button 
									onclick={() => selectExpiry(exp)}
									class="w-full px-4 py-3 text-left text-sm hover:bg-[#d4af37]/5 transition-colors flex items-center justify-between {selectedExpiry === exp ? 'text-[#d4af37] bg-[#d4af37]/10 border-l-2 border-[#d4af37]' : ''}"
								>
									<span class="font-bold">{exp}</span>
									{#if selectedExpiry === exp}
										<span class="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</header>


	<section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
		<div class="glass-panel p-5 rounded-2xl relative overflow-hidden group">
			<div class="text-[10px] text-[#94a3b8] uppercase tracking-widest mb-1">Spot Price</div>
			<div class="text-xl font-bold">{formatCurrency(currentData.spot_price)}</div>
			<div class="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
				<svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
			</div>
		</div>
		<div class="glass-panel p-5 rounded-2xl">
			<div class="text-[10px] text-[#94a3b8] uppercase tracking-widest mb-1">Max Pain</div>
			<div class="text-xl font-bold text-[#d4af37]">{formatCurrency(currentData.max_pain_strike)}</div>
		</div>
		<div class="glass-panel p-5 rounded-2xl">
			<div class="text-[10px] text-[#94a3b8] uppercase tracking-widest mb-1">PCR</div>
			<div class="flex items-baseline gap-2">
				<span class="text-xl font-bold {currentData.pcr > 1 ? 'text-[#00ff88]' : 'text-[#ff3d00]'}">{currentData.pcr}</span>
				<span class="text-[10px] opacity-60">({currentData.pcr_interpretation})</span>
			</div>
		</div>
		<div class="glass-panel p-5 rounded-2xl">
			<div class="text-[10px] text-[#94a3b8] uppercase tracking-widest mb-1">ATM Strike</div>
			<div class="text-xl font-bold">{formatCurrency(currentData.atm_strike)}</div>
		</div>
		<div class="glass-panel p-5 rounded-2xl">
			<div class="text-[10px] text-[#94a3b8] uppercase tracking-widest mb-1">Total CE OI</div>
			<div class="text-xl font-bold text-[#ff3d00]">{formatLakh(currentData.total_ce_oi)}</div>
		</div>
		<div class="glass-panel p-5 rounded-2xl">
			<div class="text-[10px] text-[#94a3b8] uppercase tracking-widest mb-1">Total PE OI</div>
			<div class="text-xl font-bold text-[#00ff88]">{formatLakh(currentData.total_pe_oi)}</div>
		</div>
	</section>


	<section class="glass-panel p-6 rounded-3xl mb-8">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-lg font-bold flex items-center gap-2">
					<span class="w-1.5 h-6 bg-[#d4af37] rounded-full"></span>
					Open Interest Distribution
				</h2>
				<p class="text-xs text-[#94a3b8] mt-1">Multi-Strike Analysis for {currentData.expiry}</p>
			</div>
		</div>
		<div bind:this={chartContainer} class="w-full h-[450px]"></div>
	</section>


	<section class="grid grid-cols-1 lg:grid-cols-2 gap-8">

		<div>
			<h3 class="text-sm font-bold uppercase tracking-widest text-[#00ff88] mb-4 flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
				Top OI Buildup
			</h3>
			<div class="glass-panel overflow-hidden rounded-2xl">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="bg-white/5 text-[#94a3b8]">
							<th class="px-6 py-4 font-medium">Strike</th>
							<th class="px-6 py-4 font-medium text-right">CE Change</th>
							<th class="px-6 py-4 font-medium text-right">PE Change</th>
							<th class="px-6 py-4 font-medium text-right">Net Chg</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each oiStats.buildups as s}
							<tr class="hover:bg-white/5 transition-colors group">
								<td class="px-6 py-4 font-bold">{formatCurrency(s.strike)}</td>
								<td class="px-6 py-4 text-right tabular-nums {s.ce_oi_change >= 0 ? 'text-[#ff3d00]' : 'text-[#00ff88]'}">
									{s.ce_oi_change >= 0 ? '+' : ''}{formatLakh(s.ce_oi_change)}
								</td>
								<td class="px-6 py-4 text-right tabular-nums {s.pe_oi_change >= 0 ? 'text-[#00ff88]' : 'text-[#ff3d00]'}">
									{s.pe_oi_change >= 0 ? '+' : ''}{formatLakh(s.pe_oi_change)}
								</td>
								<td class="px-6 py-4 text-right font-bold tabular-nums">
									+{formatLakh(s.ce_oi_change + s.pe_oi_change)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>


		<div>
			<h3 class="text-sm font-bold uppercase tracking-widest text-[#ff3d00] mb-4 flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"/></svg>
				Significant Unwinding
			</h3>
			<div class="glass-panel overflow-hidden rounded-2xl">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="bg-white/5 text-[#94a3b8]">
							<th class="px-6 py-4 font-medium">Strike</th>
							<th class="px-6 py-4 font-medium text-right">CE Change</th>
							<th class="px-6 py-4 font-medium text-right">PE Change</th>
							<th class="px-6 py-4 font-medium text-right">Net Chg</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each oiStats.unwindings as s}
							<tr class="hover:bg-white/5 transition-colors group">
								<td class="px-6 py-4 font-bold">{formatCurrency(s.strike)}</td>
								<td class="px-6 py-4 text-right tabular-nums {s.ce_oi_change >= 0 ? 'text-[#ff3d00]' : 'text-[#00ff88]'}">
									{s.ce_oi_change >= 0 ? '+' : ''}{formatLakh(s.ce_oi_change)}
								</td>
								<td class="px-6 py-4 text-right tabular-nums {s.pe_oi_change >= 0 ? 'text-[#00ff88]' : 'text-[#ff3d00]'}">
									{s.pe_oi_change >= 0 ? '+' : ''}{formatLakh(s.pe_oi_change)}
								</td>
								<td class="px-6 py-4 text-right font-bold tabular-nums text-[#ff3d00]">
									{formatLakh(s.ce_oi_change + s.pe_oi_change)}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="4" class="px-6 py-10 text-center text-[#94a3b8] italic">No significant unwinding detected</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
</div>

<style>
	:global(.glass-panel) {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
		border: 1px solid rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(12px);
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	}

	::-webkit-scrollbar {
		width: 4px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #d4af37;
	}
</style>
