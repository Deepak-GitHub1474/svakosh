<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import * as echarts from 'echarts/core';
	import { LineChart } from 'echarts/charts';
	import {
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent,
		ToolboxComponent
	} from 'echarts/components';
	import { CanvasRenderer } from 'echarts/renderers';
	import { getTrackerChartOptions } from '../_lib/helper';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import MaximizeIcon from '$lib/components/svg-provider/MaximizeIcon.svelte';
	import MinimizeIcon from '$lib/components/svg-provider/MinimizeIcon.svelte';

	echarts.use([
		LineChart,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent,
		ToolboxComponent,
		CanvasRenderer
	]);

	interface Props {
		timestamps: string[];
		data: any;
		type: 'CE' | 'PE' | 'Combined';
		oiOption: string;
		combined: boolean;
		onRefresh?: () => void;
	}

	let { timestamps, data, type, oiOption, combined, onRefresh }: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chart: echarts.ECharts | null = null;
	let isMaximized = $state(false);
	let resizeObserver: ResizeObserver | null = null;
	let currentSelection = $state<Record<string, boolean> | null>(null);

	function initChart() {
		if (!chartContainer) return;
		
		chart?.dispose();
		resizeObserver?.disconnect();

		chart = echarts.init(chartContainer, 'dark');
		
		chart.on('legendselectchanged', (params: any) => {
			currentSelection = params.selected;
		});

		chart.on('restore', () => {
			if (onRefresh) onRefresh();
		});

		chart.on('legendmouseover', (params: any) => {
			chart?.dispatchAction({ type: 'highlight', seriesName: params.name });
		});

		chart.on('legendmouseout', (params: any) => {
			chart?.dispatchAction({ type: 'downplay', seriesName: params.name });
		});

		updateOptions();

		resizeObserver = new ResizeObserver(() => {
			chart?.resize();
		});
		resizeObserver.observe(chartContainer);
	}

	function updateOptions() {
		if (!chart) return;
		const options = getTrackerChartOptions(timestamps, data, oiOption, combined, currentSelection || undefined);
		chart.setOption(options, true);
	}

	function toggleMaximize() {
		isMaximized = !isMaximized;
	}

	$effect(() => {
		if (chartContainer) {
			initChart();
		}
	});

	$effect(() => {
		if (isMaximized) {
			const handleGlobalClick = (e: MouseEvent) => {
				const card = document.querySelector('.maximized-tracker-container');
				if (card && !card.contains(e.target as Node)) {
					isMaximized = false;
				}
			};
			window.addEventListener('click', handleGlobalClick, true);
			return () => window.removeEventListener('click', handleGlobalClick, true);
		}
	});

	$effect(() => {
		if (data && timestamps && oiOption !== undefined && combined !== undefined) {
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
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[35] transition-opacity duration-500"
		onkeydown={(e) => e.key === 'Escape' && toggleMaximize()}
		transition:fade={{ duration: 300 }}
	></div>

	<div 
		class="maximized-tracker-container fixed top-40 left-4 right-4 md:left-8 md:right-8 bottom-4 z-[40]"
		transition:fly={{ y: '100%', duration: 600, opacity: 1 }}
	>
		<SvaKoshCard 
			class="h-full w-full bg-background/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col pt-3"
			meta={title}
		>
			<div 
				bind:this={chartContainer} 
				class="w-full mt-2 h-[calc(100vh-14rem)]"
			></div>
		</SvaKoshCard>
	</div>
{:else}
	<SvaKoshCard 
		class="transition-all duration-500 ease-in-out hover:border-primary/20 flex flex-col pt-3 h-[460px] relative"
		meta={title}
	>
		<div 
			bind:this={chartContainer} 
			class="w-full mt-2 h-[405px]"
		></div>
	</SvaKoshCard>
{/if}

{#snippet title()}
	<div class="flex items-center justify-between w-full gap-2 -mt-1">
		<div class="flex items-center gap-3">
			<h4 class="text-[0.625rem] text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 whitespace-nowrap">
				<span class={type === 'CE' ? 'bg-bullish w-1 h-3.5 rounded-full' : (type === 'PE' ? 'bg-bearish w-1 h-3.5 rounded-full' : 'bg-primary w-1 h-3.5 rounded-full')}></span>
				<span class="text-foreground font-normal">{type} TRACKER</span> 
				<span class={type === 'CE' ? 'text-bullish' : (type === 'PE' ? 'text-bearish' : 'text-primary')}>{combined ? 'CE & PE' : ''}</span>
			</h4>
		</div>
		
		<div class="flex items-center gap-3">
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
