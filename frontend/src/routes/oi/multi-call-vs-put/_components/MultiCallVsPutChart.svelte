<script lang="ts">
	import { onDestroy, tick, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import * as echarts from 'echarts/core';
	import { LineChart, BarChart } from 'echarts/charts';
	import {
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent,
		ToolboxComponent
	} from 'echarts/components';
	import { CanvasRenderer } from 'echarts/renderers';
	import { getMultiCallVsPutChartOptions } from '../_lib/helper';
	import { chartTypeTabs } from '../_lib/const';
	import type { MultiOIDataMap } from '../_lib/types';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import MaximizeIcon from '$lib/components/svg-provider/MaximizeIcon.svelte';
	import MinimizeIcon from '$lib/components/svg-provider/MinimizeIcon.svelte';

	echarts.use([
		LineChart,
		BarChart,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent,
		ToolboxComponent,
		CanvasRenderer
	]);

	interface Props {
		data: MultiOIDataMap;
		symbol: string;
		selectedCallCount: number;
		selectedPutCount: number;
		chartType?: 'line' | 'bar';
		onRefresh?: () => void;
	}

	let { data, symbol, selectedCallCount, selectedPutCount, chartType = $bindable('line'), onRefresh }: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chart: echarts.ECharts | null = null;
	let isMaximized = $state(false);
	let resizeObserver: ResizeObserver | null = null;
	
	let bullishColor = $state('#00ff88');
	let bearishColor = $state('#ff3d00');

	onMount(() => {
		const style = getComputedStyle(document.documentElement);
		bullishColor = style.getPropertyValue('--bullish').trim() || '#00ff88';
		bearishColor = style.getPropertyValue('--bearish').trim() || '#ff3d00';
	});

	function updateOptions() {
		if (!chart || chart.isDisposed() || !data) return;
		const options = getMultiCallVsPutChartOptions(data, bullishColor, bearishColor, chartType);
		chart.setOption(options, true);
	}

	function toggleMaximize() {
		isMaximized = !isMaximized;
	}

	async function initChart() {
		if (!chartContainer) return;
		
		chart?.dispose();
		resizeObserver?.disconnect();

		await tick();
		chart = echarts.init(chartContainer, 'dark');
		
		chart.on('restore', () => {
			if (onRefresh) onRefresh();
		});

		updateOptions();

		resizeObserver = new ResizeObserver(() => {
			chart?.resize();
		});
		resizeObserver.observe(chartContainer);
	}

	$effect(() => {
		if (chartContainer) {
			initChart();
		}
	});

	$effect(() => {
		data; chartType; bullishColor; bearishColor;
		
		if (chart && !chart.isDisposed()) {
			updateOptions();
		}
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
		chart?.dispose();
	});
</script>

{#if isMaximized}
	<div 
		role="button"
		tabindex="-1"
		aria-label="Close maximized view"
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500"
		onclick={toggleMaximize}
		onkeydown={(e) => e.key === 'Escape' && toggleMaximize()}
		transition:fade={{ duration: 300 }}
	></div>

	<div 
		class="maximized-chart-container fixed top-40 left-4 right-4 md:left-8 md:right-8 bottom-4 z-[101]"
		transition:fly={{ y: '100%', duration: 600, opacity: 1, easing: cubicInOut }}
	>
		<SvaKoshCard 
			class="h-full w-full bg-background/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-border-muted flex flex-col pt-3"
			meta={title}
		>
			<div 
				bind:this={chartContainer} 
				class="w-full h-[calc(100vh-11rem)]"
			></div>
		</SvaKoshCard>
	</div>
{:else}
	<SvaKoshCard 
		class="transition-all duration-500 ease-in-out hover:border-primary/20 flex flex-col pt-3 h-[540px] relative"
		meta={title}
	>
		<div 
			bind:this={chartContainer} 
			class="w-full h-[540px]"
		></div>
	</SvaKoshCard>
{/if}

{#snippet title()}
	<div class="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 -mt-1 sm:mt-0 pb-2 sm:pb-0">
		<div class="flex items-center gap-3">
			<h4 class="text-[0.625rem] text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
				<span class="bg-primary w-1 h-3.5 rounded-full shrink-0"></span>
				<span class="text-foreground font-normal whitespace-nowrap">{symbol} MULTI OI - CALL VS PUT</span> 
				<span class="text-primary-muted ml-1 whitespace-nowrap">CE: {selectedCallCount} | PE: {selectedPutCount}</span>
			</h4>
		</div>
		
		<div class="flex items-center gap-3 self-end sm:self-auto">
			<SvaKoshTabs 
				tabs={chartTypeTabs}
				activeTab={chartType}
				onTabChange={(val) => chartType = val}
				class="scale-[0.8] origin-right mr-0.5"
			/>

			<button 
				type="button"
				onclick={toggleMaximize}
				class="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
				title={isMaximized ? "Minimize" : "Maximize"}
			>
				{#if isMaximized}
					<MinimizeIcon class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
				{:else}
					<MaximizeIcon class="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
				{/if}
			</button>
		</div>
	</div>
{/snippet}
