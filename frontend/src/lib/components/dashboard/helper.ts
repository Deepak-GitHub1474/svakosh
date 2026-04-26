import * as echarts from 'echarts';
import { GRADIENTS, CHART_CONFIGS } from './const';

export function getNextMetricValue(current: any) {
	const change = (Math.random() - 0.5) * 5;
	const newValue = current.value + change;
	const newNetChange = current.change + change;
	return {
		...current,
		value: newValue,
		change: newNetChange,
		changePct: Number(((newNetChange / (newValue - newNetChange)) * 100).toFixed(2))
	};
}

export function getSentiment(val: number) {
	if (val > 0.05) return 'bullish';
	if (val < -0.05) return 'bearish';
	return 'muted';
}

export function generateMockIntraday(baseValue: number): [string, number][] {
	const data: [string, number][] = [];
	let current = baseValue;
	for (let i = 0; i < 24; i++) {
		const h = 9 + Math.floor(i / 4);
		const m = (i % 4) * 15;
		const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
		current += (Math.random() - 0.5) * 30;
		data.push([time, current]);
	}
	return data;
}

export function getNextIntradayTick(last: any[]): [string, number] {
	const lastTime = last[0] as string;
	const [h, m] = lastTime.split(':').map(Number);
	let nm = m + 1, nh = h;
	if (nm >= 60) { nm = 0; nh++; }
	const nextTime = `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
	const nextValue = (last[1] as number) + (Math.random() - 0.5) * 10;
	return [nextTime, nextValue];
}

export function getNextSectorValue(sector: any) {
	return {
		...sector,
		change: +(sector.change + (Math.random() - 0.5) * 0.05).toFixed(2)
	};
}

export const formatChartNumber = (val: number) => {
	if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
	if (val >= 100000) return (val / 100000).toFixed(2) + ' L';
	if (val >= 1000) return (val / 1000).toFixed(1) + ' K';
	return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function tooltipFormatter(params: any) {
	if (!params) return '';
	const isArray = Array.isArray(params);
	const title = isArray ? params[0].axisValue : params.name;
	const isTime = typeof title === 'string' && title.includes(':');

	let html = `<div class="flex flex-col gap-2.5 min-w-[140px]">`;
	
	if (isTime) {
		html += `
			<div class="flex items-center gap-2 border-b border-white/5 pb-2 mb-0.5">
				<svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<polyline points="12 6 12 12 16 14"></polyline>
				</svg>
				<span class="text-[10px] text-slate-400 tracking-wide uppercase font-semibold">TIME : ${title}</span>
			</div>`;
	} else {
		html += `
			<div class="border-b border-white/5 pb-2 mb-0.5 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
				${title}
			</div>`;
	}
	
	const items = isArray ? params : [params];
	items.forEach((p: any) => {
		const color = typeof p.color === 'string' ? p.color : (p.color?.colorStops ? p.color.colorStops[0].color : '#fff');
		html += `<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<span class="w-1.5 h-1.5 rounded-full" style="background-color: ${color}"></span>
				<span class="text-[10px] text-slate-300 font-normal">${p.seriesName || p.name}</span>
			</div>
			<span class="text-[10px] text-white font-mono font-medium">${formatChartNumber(p.value)}</span>
		</div>`;
	});
	html += '</div>';
	return html;
}

export function getIntradayOptions(data: [string, number][], symbol: string) {
	return {
		backgroundColor: 'transparent',
		tooltip: { trigger: 'axis', ...CHART_CONFIGS.tooltip, formatter: tooltipFormatter },
		grid: { top: 40, right: 20, bottom: 50, left: 65 },
		xAxis: { 
			type: 'category', 
			name: 'TIME',
			nameLocation: 'middle',
			nameGap: 35,
			nameTextStyle: { color: 'rgba(100, 116, 139, 1)', fontSize: 10 },
			data: data.map(d => d[0]), 
			axisLine: CHART_CONFIGS.axisLine, 
			axisLabel: CHART_CONFIGS.axisLabel 
		},
		yAxis: { 
			type: 'value', 
			name: symbol.includes('NIFTY') ? 'PRICE' : 'POINTS',
			nameLocation: 'end',
			nameTextStyle: { color: 'rgba(100, 116, 139, 1)', fontSize: 10, padding: [0, 40, 0, 0] },
			scale: true, 
			splitNumber: 4,
			splitLine: CHART_CONFIGS.splitLine, 
			axisLabel: { ...CHART_CONFIGS.axisLabel, margin: 12 } 
		},
		series: [{ 
			name: symbol,
			data: data.map(d => d[1]), 
			type: 'line', 
			smooth: true, 
			symbol: 'none', 
			lineStyle: { width: 2, color: 'rgba(212, 175, 55, 1)' }, 
			areaStyle: { color: GRADIENTS.intraday } 
		}]
	};
}

export function getBreadthOptions(data: any) {
	return {
		backgroundColor: 'transparent',
		tooltip: { trigger: 'item', ...CHART_CONFIGS.tooltip, formatter: tooltipFormatter },
		legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: 'rgba(148, 163, 184, 1)', fontSize: 11 }, itemWidth: 10, itemHeight: 10, icon: 'circle' },
		series: [{
			type: 'pie', radius: ['55%', '85%'], center: ['35%', '50%'], avoidLabelOverlap: false,
			itemStyle: { borderRadius: 6, borderColor: 'rgba(0,0,0,0.5)', borderWidth: 2 },
			label: { show: false }, emphasis: { label: { show: false }, scaleSize: 5 },
			data: [
				{ value: data.advances, name: 'Advances', itemStyle: { color: GRADIENTS.bullish } },
				{ value: data.declines, name: 'Declines', itemStyle: { color: GRADIENTS.bearish } },
				{ value: data.unchanged, name: 'Unchanged', itemStyle: { color: GRADIENTS.neutral } }
			]
		}]
	};
}

export function getSectorOptions(sectors: any[]) {
	return {
		backgroundColor: 'transparent',
		tooltip: { trigger: 'axis', ...CHART_CONFIGS.tooltip, axisPointer: { type: 'shadow' }, formatter: tooltipFormatter },
		grid: { top: 10, right: 30, bottom: 30, left: 70 },
		xAxis: { type: 'value', axisLine: { show: false }, splitLine: CHART_CONFIGS.splitLine, axisLabel: CHART_CONFIGS.axisLabel },
		yAxis: { type: 'category', data: sectors.map(s => s.name), axisLine: CHART_CONFIGS.axisLine, axisLabel: { ...CHART_CONFIGS.axisLabel, fontSize: 11, fontWeight: 500 } },
		series: [{
			name: 'Change %', type: 'bar', barWidth: '55%', emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
			data: sectors.map(s => ({
				value: s.change,
				itemStyle: { color: s.change >= 0 ? GRADIENTS.sectorBull : GRADIENTS.sectorBear, borderRadius: s.change >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4] }
			}))
		}]
	};
}
