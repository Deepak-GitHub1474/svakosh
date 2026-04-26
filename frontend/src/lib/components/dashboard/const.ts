import * as echarts from 'echarts';

export const GRADIENTS = {
	bullish: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
		{ offset: 0, color: 'rgba(0, 255, 136, 0.9)' },
		{ offset: 1, color: 'rgba(0, 255, 136, 0.2)' }
	]),
	bearish: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
		{ offset: 0, color: 'rgba(255, 61, 0, 0.9)' },
		{ offset: 1, color: 'rgba(255, 61, 0, 0.2)' }
	]),
	neutral: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
		{ offset: 0, color: 'rgba(148, 163, 184, 0.8)' },
		{ offset: 1, color: 'rgba(148, 163, 184, 0.2)' }
	]),
	sectorBull: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
		{ offset: 0, color: 'rgba(0, 255, 136, 0.1)' },
		{ offset: 1, color: 'rgba(0, 255, 136, 0.8)' }
	]),
	sectorBear: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
		{ offset: 0, color: 'rgba(255, 61, 0, 0.8)' },
		{ offset: 1, color: 'rgba(255, 61, 0, 0.1)' }
	]),
	intraday: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
		{ offset: 0, color: 'rgba(212, 175, 55, 0.2)' },
		{ offset: 1, color: 'rgba(212, 175, 55, 0)' }
	])
};

export const CHART_CONFIGS = {
	tooltip: { 
		backgroundColor: 'rgba(15, 17, 20, 0.98)',
		borderColor: 'rgba(212, 175, 55, 0.4)',
		borderWidth: 1.5,
		padding: [10, 14],
		textStyle: { color: 'rgba(226, 232, 240, 1)', fontSize: 10 },
		axisPointer: {
			type: 'line',
			lineStyle: { color: 'rgba(212, 175, 55, 0.3)', width: 2, type: 'solid' }
		}
	},
	axisLabel: { color: 'rgba(100, 116, 139, 1)', fontSize: 10 },
	splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)', type: 'dashed' } },
	axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.08)' } }
};

export const INDEX_OPTIONS = [
	{ label: 'NIFTY 50', value: 'NIFTY 50', base: 22419 },
	{ label: 'BANK NIFTY', value: 'BANK NIFTY', base: 47286 },
	{ label: 'SENSEX', value: 'SENSEX', base: 73903 }
];
