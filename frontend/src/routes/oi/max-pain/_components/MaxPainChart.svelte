<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as echarts from 'echarts';
	import type { TMaxPainData } from '../_lib/types';
	import { getMaxPainChartOptions } from '../_lib/helper';

	interface Props {
		data: TMaxPainData;
		strikes: number[];
		maxPainStrike: number;
		height?: string;
	}

	let { data, strikes, maxPainStrike, height = '500px' }: Props = $props();

	let chartContainer: HTMLDivElement | undefined = $state();
	let chartInstance: echarts.ECharts | undefined;
	let primaryColor: string = $state('#bc922b');

	function initChart(): void {
		if (!chartContainer) return;
		if (chartInstance) chartInstance.dispose();
		chartInstance = echarts.init(chartContainer);
		updateOptions();
	}

	function updateOptions(): void {
		if (!chartInstance || chartInstance.isDisposed()) return;
		const options = getMaxPainChartOptions(data, strikes, maxPainStrike, primaryColor);
		chartInstance.setOption(options);
	}

	$effect(() => {
		if (data && strikes.length > 0) {
			if (!chartInstance) {
				initChart();
			} else {
				updateOptions();
			}
		}
	});

	onMount(() => {
		const style = getComputedStyle(document.documentElement);
		primaryColor = style.getPropertyValue('--primary').trim() || '#bc922b';

		const handleResize = (): void => {
            if (chartInstance && !chartInstance.isDisposed()) {
                chartInstance.resize();
            }
        };
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (chartInstance) {
            chartInstance.dispose();
            chartInstance = undefined;
        }
	});
</script>

<div bind:this={chartContainer} class="w-full" style="height: {height}"></div>
