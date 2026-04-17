import { LOOKUP_TIMEFRAMES, LOOKUP_CATEGORIES } from './const';
import { formatNumber } from '$lib/utils/helper';

export function calculateLookupTotals(sideData: Record<string, any>) {
	const totals: any = { Category: 'Total' };
	LOOKUP_TIMEFRAMES.forEach(tf => {
		totals[tf] = 0;
	});

	LOOKUP_CATEGORIES.forEach(cat => {
		LOOKUP_TIMEFRAMES.forEach(tf => {
			totals[tf] += sideData[cat][tf];
		});
	});

	return totals;
}

export function getPCRValue(ceTotal: number, peTotal: number): string {
	if (ceTotal === 0) return '0.00';
	return formatNumber(peTotal / ceTotal);
}

export function getTrendChartOptions(
	data: any, 
	type: string, 
	oiOption: string, 
	combined: boolean, 
	existingSelection?: Record<string, boolean>
) {
	const timestamps = Object.keys(data).sort();
	const optionKey = oiOption === 'Total OI' ? 'Total' : 'Day';
	const categories = ['ATM', 'ITM', 'OTM', 'DITM', 'FOTM'];
	
	const colors = {
		ATM: '#d4af37',
		ITM: '#00ff88',
		OTM: '#ff3d00',
		DITM: '#7b3de7',
		FOTM: '#1ed3af'
	};

	const series: any[] = [];
	const selectedLegend: Record<string, boolean> = existingSelection || {};

	if (combined) {
		['CE', 'PE'].forEach((side) => {
			categories.forEach((cat) => {
				const seriesName = `${side} ${cat}`;
				if (!existingSelection) {
					selectedLegend[seriesName] = true;
				}

				const color = side === 'CE' ? '#21af30' : '#f64343'; 
				series.push({
					name: seriesName,
					type: 'line',
					smooth: false,
					symbol: 'none',
					data: timestamps.map(ts => data[ts][side][cat][optionKey]),
					emphasis: {
						focus: 'series',
						lineStyle: { width: 0.8, opacity: 1 }
					},
					lineStyle: { 
						width: 0.8,
						opacity: 0.7
					},
					itemStyle: { color }
				});
			});
		});
	} else {
		categories.forEach((cat, idx) => {
			if (!existingSelection) {
				selectedLegend[cat] = true;
			}

			series.push({
				name: cat,
				type: 'line',
				smooth: false,
				symbol: 'none',
				data: timestamps.map(ts => data[ts][type][cat][optionKey]),
				emphasis: {
					focus: 'series',
					lineStyle: { width: 1.2, opacity: 1 }
				},
				lineStyle: { 
					width: 1.2,
					color: Object.values(colors)[idx],
					opacity: 0.7
				}
			});
		});
	}

	return {
		backgroundColor: 'transparent',
		animation: true,
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
					<div class="flex flex-col gap-2.5 min-w-[120px]">
						<div class="flex items-center gap-2 border-b border-white/5 pb-2 mb-0.5">
							<svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"></circle>
								<polyline points="12 6 12 12 16 14"></polyline>
							</svg>
							<span class="text-[10px] text-muted-foreground tracking-wide uppercase">TIME : ${time}</span>
						</div>
				`;
				
				params.forEach((p: any) => {
					html += `
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; box-shadow: 0 0 4px ${p.color}80;"></span>
								<span class="text-[10px] text-slate-300 font-normal">${p.seriesName}</span>
							</div>
							<span class="text-[10px] text-slate-50">${formatNumber(p.value)}</span>
						</div>
					`;
				});
				
				html += '</div>';
				return html;
			}
		},
		legend: {
			show: true,
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { color: '#94a3b8', fontSize: 10 },
			top: 0,
			selected: selectedLegend
		},
		grid: {
			top: '12%',
			left: '4%',
			right: '2%',
			bottom: '12%',
			containLabel: false
		},
		xAxis: {
			type: 'category',
			data: timestamps,
			name: 'TIME',
			nameLocation: 'middle',
			nameGap: 35,
			nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal', letterSpacing: 1 },
			axisLabel: { 
				color: '#64748b', 
				fontSize: 10, 
				margin: 15,
				interval: (index: number) => index % 10 === 0 || index === timestamps.length - 1
			},
			axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
			axisTick: { show: false },
			boundaryGap: false
		},
		yAxis: {
			type: 'value',
			position: 'left',
			name: 'OI (LAKHS)',
			nameLocation: 'end',
			nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal', letterSpacing: 1, padding: [0, 0, 10, 0] },
			splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
			axisLabel: { color: '#64748b', fontSize: 10 },
			axisLine: { show: false }
		},
		series,
		toolbox: {
			show: true,
			right: '2%',
			top: 0,
			feature: {
				saveAsImage: { title: 'Save' },
				restore: { title: 'Refresh' }
			},
			iconStyle: {
				borderColor: 'rgba(212, 175, 55, 0.5)'
			}
		},
		dataZoom: [
			{ type: 'inside', start: 0, end: 100 }
		]
	};
}

export function getValClass(val: number) {
	if (val > 0) return 'text-bullish';
	if (val < 0) return 'text-bearish';
	return 'text-muted-foreground';
}
