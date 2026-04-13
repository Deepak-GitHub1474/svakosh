<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts/core';
	import { LineChart } from 'echarts/charts';
	import {
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent
	} from 'echarts/components';
	import { CanvasRenderer } from 'echarts/renderers';
	import { getTrendChartOptions } from '../_lib/helper';

	echarts.use([
		LineChart,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		DataZoomComponent,
		CanvasRenderer
	]);

	interface Props {
		data: any;
		type: string;
		oiOption: string;
		combined: boolean;
	}

	let { data, type, oiOption, combined }: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chart: echarts.ECharts | null = null;

	function initChart() {
		if (!chartContainer) return;
		chart = echarts.init(chartContainer, 'dark');
		updateOptions();
		window.addEventListener('resize', handleResize);
	}

	function updateOptions() {
		if (!chart) return;
		const options = getTrendChartOptions(data, type, oiOption, combined);
		chart.setOption(options, true);
	}

	function handleResize() {
		chart?.resize();
	}

	$effect(() => {
		if (data && type && oiOption !== undefined && combined !== undefined) {
			updateOptions();
		}
	});

	onMount(() => {
		initChart();
	});

	onDestroy(() => {
		window.removeEventListener('resize', handleResize);
		chart?.dispose();
	});
</script>

<div class="glass-panel p-4 rounded-xl border border-white/5 bg-[#14171a]/40 h-[450px]">
	<div class="flex items-center justify-between mb-2">
		<h4 class="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
			<span class={type === 'CE' ? 'bg-bearish w-1 h-3 rounded-full' : 'bg-bullish w-1 h-3 rounded-full'}></span>
			{type} {combined ? '& PE Combined' : 'Trend'}
		</h4>
	</div>
	<div bind:this={chartContainer} class="w-full h-[400px]"></div>
</div>
