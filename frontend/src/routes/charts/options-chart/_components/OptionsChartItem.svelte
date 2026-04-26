<script lang="ts">
	import { onDestroy, tick, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import * as echarts from 'echarts/core';
	import { BarChart, LineChart } from 'echarts/charts';
	import {
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent
	} from 'echarts/components';
	import { CanvasRenderer } from 'echarts/renderers';
	import { getOptionsChartOptions } from '../_lib/helper';
	import { chartTypeTabs } from '../_lib/const';
	import type { OptionsChartDataMap, MetricType } from '../_lib/types';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import MaximizeIcon from '$lib/components/svg-provider/MaximizeIcon.svelte';
	import MinimizeIcon from '$lib/components/svg-provider/MinimizeIcon.svelte';

	echarts.use([
		BarChart,
		LineChart,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent,
		CanvasRenderer
	]);

	interface Props {
		data: OptionsChartDataMap;
		side: 'CE' | 'PE';
		metric1: MetricType;
		metric2: MetricType;
		chartType?: 'line' | 'bar';
	}

	let { data, side, metric1, metric2, chartType = $bindable('line') }: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chart: echarts.ECharts | null = null;
	let isMaximized = $state(false);
	let resizeObserver: ResizeObserver | null = null;

	let colors = $state({
		bullish: '#00ff88',
		bearish: '#ff3d00',
		primary: '#d4af37',
		foreground: '#e2e8f0'
	});

	onMount(() => {
		const style = getComputedStyle(document.documentElement);
		colors = {
			bullish: style.getPropertyValue('--bullish').trim() || '#00ff88',
			bearish: style.getPropertyValue('--bearish').trim() || '#ff3d00',
			primary: style.getPropertyValue('--primary').trim() || '#d4af37',
			foreground: style.getPropertyValue('--foreground').trim() || '#e2e8f0'
		};
	});

	async function initChart() {
		if (!chartContainer) return;
		chart?.dispose();
		resizeObserver?.disconnect();
		await tick();
		chart = echarts.init(chartContainer, 'dark');
		updateOptions();
		resizeObserver = new ResizeObserver(() => chart?.resize());
		resizeObserver.observe(chartContainer);
	}

	function updateOptions() {
		if (!chart || chart.isDisposed() || !data) return;
		chart.setOption(getOptionsChartOptions(data, side, metric1, metric2, colors, chartType), true);
	}

	function toggleMaximize() {
		isMaximized = !isMaximized;
	}

	$effect(() => {
		if (chartContainer) initChart();
	});

	$effect(() => {
		data; colors; metric1; metric2; chartType;
		if (chart && !chart.isDisposed()) updateOptions();
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
		class="transition-all duration-500 ease-in-out hover:border-primary/20 flex flex-col pt-3 relative h-[calc(100vh-10rem)]"
		meta={title}
	>
		<div 
			bind:this={chartContainer} 
			class="w-full h-[calc(100vh-14rem)] lg:h-[calc(100vh-12rem)]"
		></div>
	</SvaKoshCard>
{/if}

{#snippet title()}
	<div class="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 -mt-1 sm:mt-0 pb-2 sm:pb-0 px-2">
		<div class="flex items-center gap-3">
			<h4 class="text-[0.625rem] text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
				<span class="w-1 h-3.5 rounded-full shrink-0" style="background-color: {side === 'CE' ? colors.bullish : colors.bearish}"></span>
				<span class="text-foreground font-normal whitespace-nowrap">{side} Chart</span> 
				<span class="text-primary-muted ml-1 whitespace-nowrap uppercase">{metric1} vs {metric2}</span>
			</h4>
		</div>
		
		<div class="flex items-center gap-2 self-end sm:self-auto">
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
