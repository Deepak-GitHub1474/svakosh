import type { MultiOIDataMap } from './types';

const formatNumber = (val: number) => {
	if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
	if (val >= 100000) return (val / 100000).toFixed(2) + ' L';
	if (val >= 1000) return (val / 1000).toFixed(1) + ' K';
	return val.toString();
};

export function getMultiCallVsPutChartOptions(data: MultiOIDataMap, bullishColor: string = '#00ff88', bearishColor: string = '#ff3d00', chartType: 'line' | 'bar' = 'line') {
	const timestamps = Object.keys(data).sort();
	const ceData = timestamps.map((t) => data[t].ceOI);
	const peData = timestamps.map((t) => data[t].peOI);

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
								<span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; box-shadow: 0 0 4px ${p.color}80;"></span>
								<span class="text-[10px] text-slate-300 font-normal">${p.seriesName}</span>
							</div>
							<span class="text-[10px] text-slate-50 font-mono">${formatNumber(p.value)}</span>
						</div>
					`;
				});
				
				html += '</div>';
				return html;
			}
		},
		legend: {
			data: ['Combined Call OI', 'Combined Put OI'],
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { color: '#94a3b8', fontSize: 10 },
			top: 0
		},
		grid: {
			top: '15%',
			left: '4%',
			right: '4%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			name: 'TIME',
			nameLocation: 'middle',
			nameGap: 35,
			nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal' },
			data: timestamps,
			axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
			axisLabel: { color: '#64748b', fontSize: 10, margin: 12 },
			axisTick: { show: false },
			boundaryGap: chartType === 'bar'
		},
		yAxis: {
			type: 'value',
			name: 'OI (LAKHS)',
			nameLocation: 'end',
			nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal', padding: [0, 0, 10, 0] },
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
			}
		},
		dataZoom: [
			{ type: 'inside', start: 0, end: 100 }
		],
		series: [
			{
				name: 'Combined Call OI',
				type: chartType,
				data: ceData,
				smooth: true,
				showSymbol: false,
				barGap: '0%',
				barCategoryGap: '30%',
				lineStyle: { width: 1.6, color: bullishColor },
				itemStyle: { 
					color: bullishColor,
					borderRadius: chartType === 'bar' ? [2, 2, 0, 0] : 0
				},
				emphasis: {
					focus: 'series',
					lineStyle: { width: 2, opacity: 1 }
				},
				areaStyle: chartType === 'line' ? {
					color: {
						type: 'linear',
						x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: `${bullishColor}33` },
							{ offset: 1, color: `${bullishColor}00` }
						]
					}
				} : undefined
			},
			{
				name: 'Combined Put OI',
				type: chartType,
				data: peData,
				smooth: true,
				showSymbol: false,
				barGap: '0%',
				barCategoryGap: '30%',
				lineStyle: { width: 1.6, color: bearishColor },
				itemStyle: { 
					color: bearishColor,
					borderRadius: chartType === 'bar' ? [2, 2, 0, 0] : 0
				},
				emphasis: {
					focus: 'series',
					lineStyle: { width: 2, opacity: 1 }
				},
				areaStyle: chartType === 'line' ? {
					color: {
						type: 'linear',
						x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: `${bearishColor}33` },
							{ offset: 1, color: `${bearishColor}00` }
						]
					}
				} : undefined
			}
		]
	};
}

export function aggregateStrikeData(allStrikeData: Record<string, any>, selectedCallStrikes: string[], selectedPutStrikes: string[]): MultiOIDataMap {
	const aggregated: MultiOIDataMap = {};
	const timestamps = Object.keys(Object.values(allStrikeData)[0] || {}).sort();

	timestamps.forEach((t) => {
		let totalCE = 0;
		let totalPE = 0;

		const showAllIfNone = selectedCallStrikes.length === 0 && selectedPutStrikes.length === 0;

		Object.entries(allStrikeData).forEach(([strike, data]: [string, any]) => {
			if (showAllIfNone || selectedCallStrikes.includes(strike)) {
				totalCE += data[t]?.ceOI || 0;
			}
			if (showAllIfNone || selectedPutStrikes.includes(strike)) {
				totalPE += data[t]?.peOI || 0;
			}
		});

		aggregated[t] = {
			ceOI: totalCE,
			peOI: totalPE
		};
	});

	return aggregated;
}

export function generateStrikeList(atmStrike: number, difference: number): number[] {
	const strikes = [];
	for (let i = -30; i <= 30; i++) {
		strikes.push(atmStrike + i * difference);
	}
	return strikes.sort((a, b) => a - b);
}
