import { GRADIENTS, CHART_CONFIGS } from './const';
import { inSession, istDate, istTime, SESSION_END_MINUTES, SESSION_START_MINUTES } from '$lib/market/time';
import type { TBreadth, TCandle } from '$lib/market/types';

export function getSentiment(val: number) {
	if (val > 0.05) return 'bullish';
	if (val < -0.05) return 'bearish';
	return 'muted';
}

export const formatChartNumber = (val: number) => {
	if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
	if (val >= 100000) return (val / 100000).toFixed(2) + ' L';
	if (val >= 1000) return (val / 1000).toFixed(1) + ' K';
	return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatPrice = (val: number) =>
	val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type TTooltipItem = {
	axisValue?: string;
	name?: string;
	seriesName?: string;
	value: number;
	color?: string | { colorStops?: { color: string }[] };
};

function tooltipHtml(params: unknown, format: (val: number) => string) {
	if (!params) return '';
	const items = (Array.isArray(params) ? params : [params]) as TTooltipItem[];
	const title = Array.isArray(params) ? items[0].axisValue : items[0].name;
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
	
	items.forEach((p) => {
		const color = typeof p.color === 'string' ? p.color : (p.color?.colorStops?.[0].color ?? '#fff');
		html += `<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<span class="w-1.5 h-1.5 rounded-full" style="background-color: ${color}"></span>
				<span class="text-[10px] text-slate-300 font-normal">${p.seriesName || p.name}</span>
			</div>
			<span class="text-[10px] text-white font-mono font-medium">${format(p.value)}</span>
		</div>`;
	});
	html += '</div>';
	return html;
}

export const tooltipFormatter = (params: unknown) => tooltipHtml(params, formatChartNumber);

const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const toMinutes = (label: string) => {
	const [h, m] = label.split(':').map(Number);
	return h * 60 + m;
};
const TIME_TICKS = new Set(['09:15', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']);

function sessionLabels(minutes: number, until: number): string[] {
	const count = Math.floor((until - SESSION_START_MINUTES) / minutes) + 1;
	const labels = Array.from({ length: count }, (_, i) => clock(SESSION_START_MINUTES + i * minutes));
	if (labels[labels.length - 1] !== clock(until)) labels.push(clock(until));
	return labels;
}

function priceAxis(values: (number | null)[], prevClose?: number) {
	const prices = values.filter((v): v is number => v !== null);
	if (prevClose) prices.push(prevClose);
	if (prices.length === 0) return {};
	const lo = Math.min(...prices);
	const hi = Math.max(...prices);
	const raw = Math.max(hi - lo, 1) / 4;
	const pow = 10 ** Math.floor(Math.log10(raw));
	const interval = ([1, 2, 5, 10].find((m) => m * pow >= raw) ?? 10) * pow;
	return { min: Math.floor(lo / interval) * interval, max: Math.ceil(hi / interval) * interval, interval };
}

export function getIntradayOptions(data: [string, number][], symbol: string, minutes: number, prevClose?: number) {
	const lastAt = data.length ? toMinutes(data[data.length - 1][0]) : 0;
	const until = inSession(Date.now()) || !data.length ? Math.max(SESSION_END_MINUTES, lastAt) : lastAt;
	const labels = sessionLabels(minutes, until);
	const byTime = new Map(data);
	const end = data.length ? labels.indexOf(data[data.length - 1][0]) : -1;
	const values = labels.slice(0, end + 1).map((t) => byTime.get(t) ?? null);
	const first = data.length ? data[0][1] : undefined;
	const last = data.length ? data[data.length - 1][1] : undefined;
	const base = prevClose ?? first;
	const up = base === undefined || last === undefined || last >= base;
	const line = up ? 'rgba(0, 255, 136, 1)' : 'rgba(255, 61, 0, 1)';
	const marks: object[] = [];
	if (prevClose) {
		marks.push({
			yAxis: prevClose,
			lineStyle: { color: 'rgba(148, 163, 184, 0.5)', type: 'dashed', width: 1 },
			label: { position: 'insideStartTop', color: 'rgba(148, 163, 184, 0.9)', fontSize: 10, formatter: () => `Prev close ${formatPrice(prevClose)}` }
		});
	}
	if (last !== undefined) {
		marks.push({
			yAxis: last,
			lineStyle: { color: line.replace(', 1)', ', 0.35)'), type: 'dotted', width: 1 },
			label: { position: 'insideEndTop', distance: 2, formatter: () => formatPrice(last), color: '#0b0d10', backgroundColor: line, padding: [3, 5], borderRadius: 3, fontSize: 10 }
		});
	}
	return {
		backgroundColor: 'transparent',
		animation: false,
		tooltip: { trigger: 'axis', ...CHART_CONFIGS.tooltip, formatter: (params: unknown) => tooltipHtml(params, formatPrice) },
		grid: { top: 22, right: 12, bottom: 42, left: 58 },
		xAxis: {
			type: 'category',
			name: 'TIME',
			nameLocation: 'middle',
			nameGap: 28,
			nameTextStyle: { color: 'rgba(100, 116, 139, 1)', fontSize: 10 },
			data: labels,
			boundaryGap: false,
			axisLine: CHART_CONFIGS.axisLine,
			axisLabel: {
				...CHART_CONFIGS.axisLabel,
				interval: (i: number, label: string) => TIME_TICKS.has(label) || i === labels.length - 1,
				hideOverlap: true
			}
		},
		yAxis: {
			type: 'value',
			name: symbol.includes('NIFTY') ? 'PRICE' : 'POINTS',
			nameLocation: 'end',
			nameTextStyle: { color: 'rgba(100, 116, 139, 1)', fontSize: 10, padding: [0, 40, 0, 0] },
			scale: true,
			...priceAxis(values, prevClose),
			splitLine: CHART_CONFIGS.splitLine,
			axisLabel: { ...CHART_CONFIGS.axisLabel, margin: 12 }
		},
		series: [{
			name: symbol,
			data: values,
			type: 'line',
			smooth: 0.3,
			smoothMonotone: 'x',
			connectNulls: true,
			sampling: 'lttb',
			symbol: 'none',
			lineStyle: { width: 2, color: line, cap: 'round', join: 'round' },
			areaStyle: { color: up ? GRADIENTS.intradayBull : GRADIENTS.intradayBear },
			markLine: marks.length ? { silent: true, symbol: 'none', data: marks } : undefined
		}]
	};
}

export function getBreadthOptions(data: TBreadth) {
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

export function getSectorOptions(sectors: { name: string; change: number }[]) {
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

export function intradayPoints(candles: TCandle[], minutes: number, ltp?: number): [string, number][] {
	const step = minutes * 60_000;
	const now = Date.now();
	const bucket = now - (now % step);
	if (candles.length === 0) return ltp && inSession(now) ? [[istTime(bucket), ltp]] : [];
	const points = candles.map((c) => [istTime(c.ts), c.close] as [string, number]);
	const last = candles[candles.length - 1].ts;
	if (!ltp || istDate(now) !== istDate(last) || !inSession(now)) return points;
	if (bucket <= last) points[points.length - 1] = [points[points.length - 1][0], ltp];
	else points.push([istTime(bucket), ltp]);
	return points;
}
