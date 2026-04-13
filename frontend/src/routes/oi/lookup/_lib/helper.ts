import { LOOKUP_TIMEFRAMES, LOOKUP_CATEGORIES } from './const';

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

import { formatNumber } from '$lib/utils/helper';

export function getPCRValue(ceTotal: number, peTotal: number): string {
	if (ceTotal === 0) return '0.00';
	return formatNumber(peTotal / ceTotal);
}

export function getTrendChartOptions(data: any, type: string, oiOption: string, combined: boolean) {
	const timestamps = Object.keys(data).sort();
	const optionKey = oiOption === 'Total OI' ? 'Total' : 'Day';
	const categories = ['ATM', 'ITM', 'OTM', 'DITM', 'FOTM'];
	
	const colors = ['#d4af37', '#00ff88', '#ff3d00', '#7b3de7', '#1ed3af'];

	const series: any[] = [];

	if (combined) {
		['CE', 'PE'].forEach((side) => {
			categories.forEach((cat, catIdx) => {
				series.push({
					name: `${side}_${cat}`,
					type: 'line',
					symbol: 'none',
					data: timestamps.map(ts => data[ts][side][cat][optionKey]),
					lineStyle: { width: 1.5 },
					itemStyle: { color: side === 'CE' ? `rgba(255, 61, 0, ${1 - catIdx * 0.15})` : `rgba(0, 255, 136, ${1 - catIdx * 0.15})` }
				});
			});
		});
	} else {
		categories.forEach((cat, idx) => {
			series.push({
				name: cat,
				type: 'line',
				symbol: 'none',
				data: timestamps.map(ts => data[ts][type][cat][optionKey]),
				lineStyle: { 
					width: 2,
					color: colors[idx]
				}
			});
		});
	}

	return {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(28, 31, 36, 0.9)',
			borderColor: 'rgba(212, 175, 55, 0.3)',
			borderWidth: 1,
			textStyle: { color: '#e2e8f0', fontSize: 11 }
		},
		legend: {
			data: series.map(s => s.name),
			textStyle: { color: '#94a3b8', fontSize: 10 },
			type: 'scroll',
			bottom: 10
		},
		grid: {
			top: '12%',
			left: '3%',
			right: '3%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: timestamps,
			axisLabel: { color: '#94a3b8', fontSize: 10 },
			axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
		},
		yAxis: {
			type: 'value',
			name: 'OI (Lakhs)',
			nameTextStyle: { color: '#94a3b8', fontSize: 10 },
			axisLabel: { color: '#94a3b8', fontSize: 10 },
			splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
		},
		series,
		dataZoom: [{ type: 'inside' }]
	};
}
