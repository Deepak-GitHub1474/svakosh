import * as echarts from 'echarts';
import type { TMaxPainData } from './types';
import { STRIKE_DIFFERENCES } from './const';

export const formatVal = (val: number): string => {
	if (Math.abs(val) >= 10000000) return (val / 10000000).toFixed(2) + ' Cr';
	if (Math.abs(val) >= 100000) return (val / 100000).toFixed(2) + ' L';
	if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1) + ' K';
	return val.toString();
};

export function calculateStrikes(base: number, symbol: string, count: number): number[] {
	const diff: number = STRIKE_DIFFERENCES[symbol] || 100;
	const result: number[] = [];
	for (let i = -count; i <= count; i++) {
		result.push(base + i * diff);
	}
	return result.sort((a, b) => a - b);
}

export function getMaxPainChartOptions(
	data: TMaxPainData,
	strikes: number[],
	maxPainStrike: number,
	primaryColor: string
): echarts.EChartsOption {
	const barGraphColor = '#3b82f6';
	const strikesStr = strikes.map((s: number) => s.toString());

	const callPayoutData = strikes.map((s: number) => ({
		value: data[s] ? data[s].callPayout : 0,
		itemStyle: {
			color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				{ offset: 0, color: 'rgba(16, 185, 129, 0.8)' },
				{ offset: 1, color: 'rgba(16, 185, 129, 0.2)' }
			]),
			borderRadius: [2, 2, 0, 0]
		}
	}));

	const putPayoutData = strikes.map((s: number) => ({
		value: data[s] ? data[s].putPayout : 0,
		itemStyle: {
			color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				{ offset: 0, color: 'rgba(239, 68, 68, 0.8)' },
				{ offset: 1, color: 'rgba(239, 68, 68, 0.2)' }
			]),
			borderRadius: [2, 2, 0, 0]
		}
	}));

	const totalPainData = strikes.map((s: number) => (data[s] ? data[s].totalPayout : 0));

	return {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(15, 17, 20, 0.98)',
			borderColor: 'rgba(188, 146, 43, 0.4)',
			borderWidth: 1.5,
			padding: [10, 14],
			textStyle: { color: '#e2e8f0', fontSize: 10 },
			axisPointer: {
				type: 'line',
				lineStyle: { color: 'rgba(188, 146, 43, 0.3)', width: 2, type: 'solid' }
			},
			formatter: (params: any): string => {
				const strike = params[0].name;
				const d = data[Number(strike)];
				if (!d) return '';

				return `
                    <div class="flex flex-col gap-2.5 min-w-[160px]">
                        <div class="flex items-center gap-2 border-b border-white/5 pb-2 mb-0.5">
                            <svg class="w-3.5 h-3.5 text-[#bc922b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="5"></circle>
                                <circle cx="12" cy="12" r="1"></circle>
                            </svg>
                            <span class="text-[10px] text-muted-foreground tracking-wide uppercase font-medium">STRIKE : ${strike}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-[#10b981]" style="box-shadow: 0 0 4px #10b98180;"></span>
                                <span class="text-[10px] text-slate-300">CALL PAYOUT</span>
                            </div>
                            <span class="text-[10px] text-slate-50 font-mono">${formatVal(d.callPayout)}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-[#ef4444]" style="box-shadow: 0 0 4px #ef444480;"></span>
                                <span class="text-[10px] text-slate-300">PUT PAYOUT</span>
                            </div>
                            <span class="text-[10px] text-slate-50 font-mono">${formatVal(d.putPayout)}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4 border-t border-white/5 pt-2">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-[#bc922b]" style="box-shadow: 0 0 4px #bc922b80;"></span>
                                <span class="text-[10px] text-slate-300 font-bold">TOTAL PAIN</span>
                            </div>
                            <span class="text-[10px] text-primary font-mono font-bold">${formatVal(d.totalPayout)}</span>
                        </div>
                    </div>
                `;
			}
		},
		legend: {
			show: true,
			top: 0,
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { color: '#94a3b8', fontSize: 10 },
			data: [
				{ name: 'Bar Graph', itemStyle: { color: barGraphColor } },
				{ name: 'Line Graph', itemStyle: { color: primaryColor } }
			]
		},
		grid: {
			top: '15%',
			left: '3%',
			right: '3%',
			bottom: '10%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			name: 'STRIKES',
			nameLocation: 'middle',
			nameGap: 40,
			nameTextStyle: { color: '#64748b', fontSize: 10 },
			data: strikesStr,
			axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.08)' } },
			axisLabel: { color: '#64748b', fontSize: 10, margin: 10 },
			axisTick: { show: false }
		},
		yAxis: {
			type: 'value',
			name: 'PAYOUT / PAIN',
			nameLocation: 'end',
			nameTextStyle: { color: '#64748b', fontSize: 10, padding: [0, 0, 10, 0] },
			splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
			axisLabel: {
				color: '#64748b',
				fontSize: 10,
				formatter: (val: number) => formatVal(val)
			},
			axisLine: { show: false }
		},
		series: [
			{
				name: 'Bar Graph',
				type: 'bar',
				data: callPayoutData,
				barGap: '20%',
				barWidth: '40%',
				emphasis: { focus: 'series', itemStyle: { opacity: 1 } },
				blur: { itemStyle: { opacity: 0.15 } }
			},
			{
				name: 'Bar Graph',
				type: 'bar',
				data: putPayoutData,
				barWidth: '40%',
				emphasis: { focus: 'series', itemStyle: { opacity: 1 } },
				blur: { itemStyle: { opacity: 0.15 } }
			},
			{
				name: 'Line Graph',
				type: 'line',
				data: totalPainData,
				smooth: true,
				showSymbol: true,
				symbol: 'circle',
				symbolSize: 4,
				lineStyle: { color: primaryColor, width: 1.8 },
				itemStyle: { color: primaryColor, borderColor: '#fff', borderWidth: 1 },
				emphasis: {
					focus: 'series',
					lineStyle: { width: 2.2, opacity: 1 },
					itemStyle: { opacity: 1 }
				},
				blur: { lineStyle: { opacity: 0.1 }, itemStyle: { opacity: 0.1 } },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(188, 146, 43, 0.1)' },
						{ offset: 1, color: 'rgba(188, 146, 43, 0)' }
					])
				}
			},
			{
				name: 'Max Pain Indicator',
				type: 'line',
				silent: true,
				z: 10,
				markLine: {
					symbol: ['none', 'none'],
					data: [
						{
							xAxis: maxPainStrike.toString(),
							lineStyle: {
								color: primaryColor,
								type: 'dashed',
								width: 2
							},
							label: {
								show: true,
								position: 'end',
								formatter: `Max Pain: ${maxPainStrike}`,
								backgroundColor: primaryColor,
								color: '#000',
								padding: [4, 10],
								borderRadius: 100,
								fontSize: 10,
								fontWeight: 'bold',
								shadowBlur: 10,
								shadowColor: 'rgba(188, 146, 43, 0.5)',
								distance: 10
							}
						}
					]
				}
			}
		],
		dataZoom: [{ type: 'inside', start: 0, end: 100 }]
	};
}
