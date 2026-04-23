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
        result.push(base + (i * diff));
    }
    return result.sort((a, b) => a - b);
}

export function getMaxPainChartOptions(
    data: TMaxPainData,
    strikes: number[],
    maxPainStrike: number,
    primaryColor: string
): echarts.EChartsOption {
    const barData = strikes.map((s: number) => {
        const isMax = s === maxPainStrike;
        return {
            value: data[s] ? data[s].totalPayout : 0,
            itemStyle: {
                color: isMax 
                    ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: primaryColor },
                        { offset: 1, color: 'rgba(188, 146, 43, 0.4)' }
                    ])
                    : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(148, 163, 184, 0.3)' },
                        { offset: 1, color: 'rgba(71, 85, 105, 0.1)' }
                    ]),
                borderRadius: [2, 2, 0, 0],
                borderWidth: isMax ? 1 : 0,
                borderColor: 'rgba(188, 146, 43, 0.5)'
            }
        };
    });

    const lineData = strikes.map((s: number) => data[s] ? data[s].totalPayout : 0);

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
                const p = params[0];
                const isMax = Number(p.name) === maxPainStrike;
                return `
                    <div class="flex flex-col gap-2.5 min-w-[140px]">
                        <div class="flex items-center gap-2 border-b border-white/5 pb-2 mb-0.5">
                            <svg class="w-3.5 h-3.5 text-[#bc922b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span class="text-[10px] text-muted-foreground tracking-wide uppercase font-medium">STRIKE : ${p.name}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" style="background-color: ${isMax ? '#bc922b' : '#94a3b8'}; box-shadow: 0 0 4px ${isMax ? '#bc922b' : '#94a3b8'}80;"></span>
                                <span class="text-[10px] text-slate-300 font-normal">${isMax ? 'MAX PAIN' : 'PAIN'}</span>
                            </div>
                            <span class="text-[10px] text-slate-50 font-mono">${formatVal(p.value)}</span>
                        </div>
                    </div>
                `;
            }
        },
        grid: {
            top: '10%',
            left: '3%',
            right: '3%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: strikes.map((s: number) => s.toString()),
            axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.08)' } },
            axisLabel: { color: '#64748b', fontSize: 10, margin: 20 },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
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
                name: 'Pain Bars',
                type: 'bar',
                data: barData,
                barWidth: '65%',
            },
            {
                name: 'Pain Trend',
                type: 'line',
                data: lineData,
                smooth: true,
                showSymbol: true,
                symbol: 'star',
                symbolSize: (val: any, params: any) => {
                    return Number(params.name) === maxPainStrike ? 14 : 0;
                },
                lineStyle: {
                    color: primaryColor,
                    width: 2
                },
                itemStyle: {
                    color: primaryColor
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(188, 146, 43, 0.15)' },
                        { offset: 1, color: 'rgba(188, 146, 43, 0)' }
                    ])
                },
                markPoint: {
                    symbol: 'path://M30 0 L70 0 L100 50 L70 100 L30 100 L0 50 Z',
                    symbolSize: [45, 25],
                    symbolOffset: [0, '120%'],
                    itemStyle: {
                        color: primaryColor,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,0.3)'
                    },
                    label: {
                        show: true,
                        formatter: 'ATM',
                        fontSize: 9,
                        color: '#fff',
                        fontWeight: 'bold',
                        position: 'inside',
                        offset: [0, 0]
                    },
                    data: [
                        {
                            coord: [strikes.indexOf(maxPainStrike).toString(), 0],
                            name: 'Max Pain ATM'
                        }
                    ]
                }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            }
        ]
    };
}
