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
	intradayBull: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
		{ offset: 0, color: 'rgba(0, 255, 136, 0.16)' },
		{ offset: 1, color: 'rgba(0, 255, 136, 0)' }
	]),
	intradayBear: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
		{ offset: 0, color: 'rgba(255, 61, 0, 0.16)' },
		{ offset: 1, color: 'rgba(255, 61, 0, 0)' }
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
	{ label: 'NIFTY 50', value: 'NIFTY 50', token: 'NSE:IDX:NIFTY' },
	{ label: 'SENSEX', value: 'SENSEX', token: 'BSE:IDX:SENSEX' },
	{ label: 'BANK NIFTY', value: 'BANK NIFTY', token: 'NSE:IDX:BANKNIFTY' },
	{ label: 'FIN NIFTY', value: 'FIN NIFTY', token: 'NSE:IDX:FINNIFTY' },
	{ label: 'MIDCAP NIFTY', value: 'MIDCAP NIFTY', token: 'NSE:IDX:MIDCPNIFTY' },
	{ label: 'NIFTY NEXT 50', value: 'NIFTY NEXT 50', token: 'NSE:IDX:NIFTYNXT50' },
	{ label: 'BANKEX', value: 'BANKEX', token: 'BSE:IDX:BANKEX' },
	{ label: 'SENSEX 50', value: 'SENSEX 50', token: 'BSE:IDX:SENSEX50' }
];

export const METRICS = INDEX_OPTIONS.map(({ label, token }) => ({ label, sk_token: token }));

export const SECTORS = [
	{ name: 'IT', sk_token: 'NSE:IDX:NIFTYIT' },
	{ name: 'Auto', sk_token: 'NSE:IDX:NIFTYAUTO' },
	{ name: 'Pharma', sk_token: 'NSE:IDX:NIFTYPHARMA' },
	{ name: 'Banking', sk_token: 'NSE:IDX:BANKNIFTY' },
	{ name: 'FMCG', sk_token: 'NSE:IDX:NIFTYFMCG' },
	{ name: 'Metal', sk_token: 'NSE:IDX:NIFTYMETAL' },
	{ name: 'Energy', sk_token: 'NSE:IDX:NIFTYENERGY' }
];

export const TOP_MOVERS_LIMIT = 5;
export const INTRADAY_INTERVALS = [
	{ label: '1m', value: '1' },
	{ label: '3m', value: '3' },
	{ label: '5m', value: '5' },
	{ label: '15m', value: '15' }
];
export const DEFAULT_INTRADAY_INTERVAL = '3';
