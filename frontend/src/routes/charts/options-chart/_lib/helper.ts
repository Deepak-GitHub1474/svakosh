import type { OptionsChartDataMap, MetricType } from './types';

const formatNumber = (val: number) => {
	if (val === null || val === undefined) return '-';
	if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
	if (val >= 100000) return (val / 100000).toFixed(2) + ' L';
	if (val >= 1000) return (val / 1000).toFixed(1) + ' K';
	return val.toFixed(1);
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

const MARKET_TIMESTAMPS: string[] = (() => {
	const times = [];
	const start = 9 * 60 + 15;
	const end = 15 * 60 + 30;
	for (let t = start; t <= end; t += 5) {
		const h = Math.floor(t / 60);
		const m = t % 60;
		times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
	}
	return times;
})();

export function getOptionKey(side: 'CE' | 'PE', metric: MetricType): string {
	const prefix = side.toLowerCase();
	const mapping: Record<string, string> = {
		OI: `${prefix}OI`,
		LTP: `${prefix}LTP`,
		Volume: `${prefix}Volume`,
		ATP: `${prefix}ATP`,
		'LTP Change': `${prefix}Change`,
		Open: `${prefix}Open`,
		High: `${prefix}High`,
		Low: `${prefix}Low`,
		Close: `${prefix}Close`
	};
	return mapping[metric] || `${prefix}LTP`;
}

export const getOptionsChartOptions = (
	data: OptionsChartDataMap,
	side: 'CE' | 'PE',
	metric1: MetricType,
	metric2: MetricType,
	colors: {
		bullish: string;
		bearish: string;
		primary: string;
		foreground: string;
	},
	chartType: 'line' | 'bar' = 'line'
) => {
	const key1 = getOptionKey(side, metric1);
	const key2 = getOptionKey(side, metric2);
	const val1 = MARKET_TIMESTAMPS.map((t) => (data[t] ? (data[t] as any)[key1] : null));
	const val2 = MARKET_TIMESTAMPS.map((t) => (data[t] ? (data[t] as any)[key2] : null));
	const sideColor = side === 'CE' ? colors.bullish : colors.bearish;

	return {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(15, 17, 20, 0.98)',
			borderColor: 'rgba(212, 175, 55, 0.4)',
			borderWidth: 1.5,
			padding: [10, 14],
			textStyle: { color: '#e2e8f0', fontSize: 10 },
			axisPointer: { type: 'line', lineStyle: { color: 'rgba(255,255,255,0.1)', width: 1 } },
			formatter: function (params: any) {
				const time = params[0].axisValue;
				let html = `<div class="flex flex-col gap-2.5 min-w-[140px]">
					<div class="flex items-center gap-2 border-b border-white/5 pb-2 mb-0.5">
						<svg class="w-3 h-3 text-primary/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
						<span class="text-[10px] text-muted-foreground tracking-wide uppercase font-medium">TIME : ${time}</span>
					</div>`;
				params.forEach((p: any) => {
					if (p.value !== null) {
						html += `<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${p.color};"></span>
								<span class="text-[10px] text-slate-300 font-normal">${p.seriesName}</span>
							</div>
							<span class="text-[10px] text-slate-50 font-mono">${formatNumber(p.value)}</span>
						</div>`;
					}
				});
				html += '</div>';
				return html;
			}
		},
		legend: {
			data: [metric1, metric2],
			icon: 'circle',
			itemWidth: 8,
			itemHeight: 8,
			textStyle: { color: '#94a3b8', fontSize: 10 },
			top: 0
		},
		grid: { left: '4%', right: '4%', top: '15%', bottom: '10%', containLabel: true },
		xAxis: {
			type: 'category',
			name: 'TIME',
			nameLocation: 'middle',
			nameGap: 40,
			nameTextStyle: { color: '#64748b', fontSize: 10, letterSpacing: 2 },
			data: MARKET_TIMESTAMPS,
			axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
			axisLabel: { color: '#64748b', fontSize: 10, margin: 12 },
			axisTick: { show: false },
			boundaryGap: chartType === 'bar'
		},
		yAxis: [
			{
				type: 'value',
				name: metric1.toUpperCase(),
				position: 'left',
				scale: true,
				splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
				axisLabel: {
					color: '#64748b',
					fontSize: 10,
					formatter: (val: number) => formatNumber(val)
				},
				nameTextStyle: { color: '#64748b', fontSize: 10, align: 'left', padding: [0, 0, 10, 0] }
			},
			{
				type: 'value',
				name: metric2.toUpperCase(),
				position: 'right',
				scale: true,
				splitLine: { show: false },
				axisLabel: {
					color: '#64748b',
					fontSize: 10,
					formatter: (val: number) => formatNumber(val)
				},
				nameTextStyle: { color: '#64748b', fontSize: 10, align: 'right', padding: [0, 0, 10, 0] }
			}
		],
		dataZoom: [{ type: 'inside', start: 0, end: 100 }],
		series: [
			{
				name: metric1,
				type: chartType,
				data: val1,
				smooth: 0.3,
				symbol: 'none',
				itemStyle: {
					color:
						chartType === 'bar'
							? {
									type: 'linear',
									x: 0,
									y: 0,
									x2: 0,
									y2: 1,
									colorStops: [
										{ offset: 0, color: addAlpha(sideColor, 0.8) },
										{ offset: 1, color: addAlpha(sideColor, 0.1) }
									]
								}
							: sideColor
				},
				lineStyle: { width: 2, color: sideColor },
				areaStyle:
					chartType === 'line'
						? {
								color: {
									type: 'linear',
									x: 0,
									y: 0,
									x2: 0,
									y2: 1,
									colorStops: [
										{ offset: 0, color: addAlpha(sideColor, 0.2) },
										{ offset: 1, color: addAlpha(sideColor, 0) }
									]
								}
							}
						: undefined
			},
			{
				name: metric2,
				type: 'line',
				yAxisIndex: 1,
				data: val2,
				smooth: 0.3,
				symbol: 'none',
				itemStyle: { color: '#d4af37' },
				lineStyle: { width: 2, color: '#d4af37', type: 'dashed' }
			}
		]
	};
};
