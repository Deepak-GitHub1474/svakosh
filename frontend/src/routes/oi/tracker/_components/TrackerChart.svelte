<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import { getTrackerChartOptions } from '../_lib/helper';

	interface Props {
		timestamps: string[];
		data: any;
		type: 'CE' | 'PE' | 'Combined';
		oiOption: string;
		combined: boolean;
	}

	let { timestamps, data, type, oiOption, combined }: Props = $props();
	let chartDom: HTMLDivElement;
	let myChart: echarts.ECharts;

	$effect(() => {
		if (myChart && timestamps && data) {
			const options = getTrackerChartOptions(timestamps, data, oiOption, combined);
			myChart.setOption(options);
		}
	});

	onMount(() => {
		myChart = echarts.init(chartDom);
		const options = getTrackerChartOptions(timestamps, data, oiOption, combined);
		myChart.setOption(options);

		const handleResize = () => myChart.resize();
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
			myChart.dispose();
		};
	});
</script>

<div class="glass-panel p-4 rounded-xl border border-white/5 bg-surface/30 backdrop-blur-sm h-full flex flex-col shadow-xl">
	<div class="flex items-center justify-between mb-4 px-2">
		<h3 class="text-sm font-semibold text-foreground/80 flex items-center gap-2">
			<span class="w-1.5 h-1.5 rounded-full {type === 'CE' ? 'bg-bearish' : type === 'PE' ? 'bg-bullish' : 'bg-primary'}"></span>
			{type} Tracker Chart
		</h3>
		<span class="text-[0.6rem] text-muted-foreground uppercase tracking-widest opacity-60">Real-time Trends</span>
	</div>
	<div bind:this={chartDom} class="flex-1 min-h-[300px]"></div>
</div>
