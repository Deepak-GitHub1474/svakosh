import type { StrangleDataMap } from './types';

const formatNumber = (val: number) => {
	if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
	if (val >= 100000) return (val / 100000).toFixed(2) + ' L';
	if (val >= 1000) return (val / 1000).toFixed(1) + ' K';
	return val.toString();
};

function addAlpha(hex: string, alpha: number): string {
	if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
	const cleanHex = hex.replace('#', '');
	let r, g, b;
	if (cleanHex.length === 3) {
		r = parseInt(cleanHex[0] + cleanHex[0], 16);
		g = parseInt(cleanHex[1] + cleanHex[1], 16);
		b = parseInt(cleanHex[2] + cleanHex[2], 16);
	} else if (cleanHex.length === 6) {
		r = parseInt(cleanHex.substring(0, 2), 16);
		g = parseInt(cleanHex.substring(2, 4), 16);
		b = parseInt(cleanHex.substring(4, 6), 16);
	} else {
		return hex;
	}
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const getStrangleChartOptions = (
	data: StrangleDataMap,
	colors: {
		bullish: string;
		bearish: string;
		primary: string;
		foreground: string;
		surfaceBorder: string;
	},
	chartType: 'line' | 'bar' = 'line'
) => {
	const timestamps = Object.keys(data).sort();
	const ceOI = timestamps.map((t) => data[t].ceOI);
	const peOI = timestamps.map((t) => data[t].peOI);
	const strangleRate = timestamps.map((t) => data[t].strangleRate);
	const strangleATP = timestamps.map((t) => data[t].strangleATP);

	return {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(15, 17, 20, 0.98)',
			borderColor: 'rgba(212, 175, 55, 0.4)',
			borderWidth: 1.5,
			padding: [10, 14],
			textStyle: { color: '#e2e8f0', fontSize: 10 },
			axisPointer: {
				type: 'line',
				lineStyle: { color: 'rgba(212, 175, 55, 0.3)', width: 2, type: 'solid' }
			},
			formatter: function(params: any) {
				const time = params[0].axisValue;
				let html = `
					<div class="flex flex-col gap-2.5 min-w-[140px]">
						<div class="flex items-center gap-2 border-b border-white/5 pb-2 mb-0.5">
							<svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<polyline points="12 6 12 12 16 14"></polyline>
							</svg>
							<span class="text-[10px] text-muted-foreground tracking-wide uppercase font-medium">TIME : ${time}</span>
						</div>
				`;
				
				params.forEach((p: any) => {
					html += `
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; box-shadow: 0 0 4px ${addAlpha(p.color, 0.5)};"></span>
								<span class="text-[10px] text-slate-300 font-normal">${p.seriesName}</span>
							</div>
							<span class="text-[10px] text-slate-50 font-mono">${p.seriesIndex < 2 ? formatNumber(p.value) : p.value.toFixed(2)}</span>
						</div>
					`;
				});
				
				html += '</div>';
				return html;
			}
		},
		legend: {
			data: ['CE OI', 'PE OI', 'Strangle Rate', 'Strangle ATP'],
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { color: '#94a3b8', fontSize: 10 },
			top: 0
		},
		grid: {
			left: '4%',
			right: '4%',
			top: '15%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: timestamps,
			axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
			axisLabel: { color: '#64748b', fontSize: 10, margin: 12 },
			axisTick: { show: false },
			name: 'TIME',
			nameLocation: 'middle',
			nameGap: 45,
			nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal' },
			boundaryGap: chartType === 'bar'
		},
		yAxis: [
			{
				type: 'value',
				name: 'OI',
				position: 'right',
				splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
				axisLabel: {
					color: '#64748b',
					fontSize: 10,
					formatter: (value: number) => {
						if (value >= 10000000) return (value / 10000000).toFixed(1) + 'Cr';
						if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
						if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
						return value;
					}
				},
				nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal', padding: [0, 0, 10, 0] }
			},
			{
				type: 'value',
				name: 'RATE',
				position: 'left',
				splitLine: { show: false },
				axisLabel: { color: '#64748b', fontSize: 10 },
				nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal', padding: [0, 0, 10, 0] }
			}
		],
		dataZoom: [
			{
				type: 'inside',
				start: 0,
				end: 100
			}
		],
		series: [
			{
				name: 'CE OI',
				type: chartType,
				data: ceOI,
				symbol: 'none',
				smooth: true,
				barGap: '0%',
				barCategoryGap: '30%',
				lineStyle: { width: 1.6, color: colors.bearish },
				itemStyle: { 
					color: chartType === 'bar' ? {
						type: 'linear',
						x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: addAlpha(colors.bearish, 0.8) },
							{ offset: 1, color: addAlpha(colors.bearish, 0.1) }
						]
					} : colors.bearish,
					borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0
				},
				emphasis: { focus: 'series' }
			},
			{
				name: 'PE OI',
				type: chartType,
				data: peOI,
				symbol: 'none',
				smooth: true,
				barGap: '0%',
				barCategoryGap: '30%',
				lineStyle: { width: 1.6, color: colors.bullish },
				itemStyle: { 
					color: chartType === 'bar' ? {
						type: 'linear',
						x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: addAlpha(colors.bullish, 0.8) },
							{ offset: 1, color: addAlpha(colors.bullish, 0.1) }
						]
					} : colors.bullish,
					borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0
				},
				emphasis: { focus: 'series' }
			},
			{
				name: 'Strangle Rate',
				type: 'line',
				yAxisIndex: 1,
				data: strangleRate,
				symbol: 'none',
				smooth: true,
				lineStyle: { width: 2, color: colors.primary },
				itemStyle: { color: colors.primary },
				emphasis: { focus: 'series' }
			},
			{
				name: 'Strangle ATP',
				type: 'line',
				yAxisIndex: 1,
				data: strangleATP,
				symbol: 'none',
				smooth: true,
				lineStyle: { width: 1.5, color: colors.foreground, type: 'dashed' },
				itemStyle: { color: colors.foreground },
				emphasis: { focus: 'series' }
			}
		]
	};
};
