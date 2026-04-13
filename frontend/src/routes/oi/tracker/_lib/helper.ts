import { TRACKER_TIMEFRAMES, TRACKER_CATEGORIES } from './const';
import type { TTrackerMetrics } from './types';

export function calculateTrackerTotals(sideData: Record<string, TTrackerMetrics>) {
	const totals: any = { Category: 'Total' };
	TRACKER_TIMEFRAMES.forEach(tf => {
		totals[tf] = 0;
	});

	TRACKER_CATEGORIES.forEach(cat => {
		const metrics = sideData[cat];
		if (metrics) {
			TRACKER_TIMEFRAMES.forEach(tf => {
				totals[tf] += metrics[tf] || 0;
			});
		}
	});

	return totals;
}

export function getTrackerChartOptions(timestamps: string[], data: any, oiOption: string, combined: boolean) {
	const categories = TRACKER_CATEGORIES;
	const colors = ['#d4af37', '#00ff88', '#ff3d00', '#7b3de7', '#1ed3af'];
	const series: any[] = [];

	if (combined) {
		['CE', 'PE'].forEach(side => {
			categories.forEach((cat, idx) => {
				series.push({
					name: `${side} ${cat}`,
					type: 'line',
					symbol: 'none',
					data: data[side][cat],
					lineStyle: { width: 1.5 },
					itemStyle: { color: side === 'CE' ? `rgba(255, 61, 0, ${1 - idx * 0.15})` : `rgba(0, 255, 136, ${1 - idx * 0.15})` }
				});
			});
		});
	} else {
		// Individual view (data passed is already for one side)
		categories.forEach((cat, idx) => {
			series.push({
				name: cat,
				type: 'line',
				symbol: 'none',
				data: data[cat],
				lineStyle: { width: 2, color: colors[idx % colors.length] }
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
