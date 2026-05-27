import type { AirInPremiumsData } from './types';

function addAlpha(hex: string, alpha: number): string {
	if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
	const cleanHex = hex.replace('#', '');
	let r, g, b;
	if (cleanHex.length === 3) {
		r = parseInt(cleanHex[0] + cleanHex[0], 16);
		g = parseInt(cleanHex[1] + cleanHex[1], 16);
		b = parseInt(cleanHex[2] + cleanHex[2], 16);
	} else if (cleanHex.length === 6) {
		r = parseInt(cleanHex.substring(0, 2), 16);
		g = parseInt(cleanHex.substring(2, 4), 16);
		b = parseInt(cleanHex.substring(4, 6), 16);
	} else {
		return hex;
	}
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const getAirInPremiumsOptions = (
	data: AirInPremiumsData,
	strikes: number[],
	colors: {
		bullish: string;
		bearish: string;
		primary: string;
		foreground: string;
	},
	chartType: 'line' | 'bar' = 'bar'
) => {
	const ceData = strikes.map(s => data[s]?.extCE || 0);
	const peData = strikes.map(s => data[s]?.extPE || 0);
	const atmStrike = data.atm_strike;
	const atmIndex = strikes.indexOf(atmStrike);

	const createMarkPoint = (seriesIndex: number, color: string) => {
		if (atmIndex === -1) return null;
		const value = seriesIndex === 0 ? ceData[atmIndex] : peData[atmIndex];
		return {
			symbol: 'diamond',
			symbolSize: 36,
			itemStyle: { 
				color: color,
				borderColor: 'rgba(255,255,255,0.2)',
				borderWidth: 1,
				shadowBlur: 10,
				shadowColor: addAlpha(color, 0.4)
			},
			label: {
				show: true,
				formatter: 'ATM',
				fontSize: 8,
				fontWeight: 'bold',
				color: '#ffffff',
				offset: [0, 0]
			},
			data: [{ coord: [atmIndex, value] }]
		};
	};

	return {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(15, 17, 20, 0.98)',
			borderColor: 'rgba(212, 175, 55, 0.4)',
			borderWidth: 1.5,
			padding: [10, 14],
			textStyle: { color: '#e2e8f0', fontSize: 10 },
			axisPointer: { type: chartType === 'bar' ? 'shadow' : 'line' },
			formatter: function(params: any) {
				const strike = params[0].axisValue;
				const isATM = Number(strike) === atmStrike;
				let html = `
					<div class="flex flex-col gap-2.5 min-w-[140px]">
						<div class="flex items-center gap-2 border-b border-white/5 pb-2 mb-0.5">
							<span class="text-[10px] text-muted-foreground tracking-wide uppercase font-medium">STRIKE : ${strike} ${isATM ? '(ATM)' : ''}</span>
						</div>
				`;
				
				params.forEach((p: any) => {
					html += `
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 rounded-full" style="background-color: ${p.color}; box-shadow: 0 0 4px ${addAlpha(p.color, 0.5)};"></span>
								<span class="text-[10px] text-slate-300 font-normal">${p.seriesName}</span>
							</div>
							<span class="text-[10px] text-slate-50 font-mono">${p.value.toFixed(2)}</span>
						</div>
					`;
				});
				
				html += '</div>';
				return html;
			}
		},
		legend: {
			data: ['Ext CE', 'Ext PE'],
			icon: 'circle',
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { color: '#94a3b8', fontSize: 10 },
			top: 0
		},
		grid: {
			left: '4%',
			right: '4%',
			top: '15%',
			bottom: '15%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			data: strikes.map(s => s.toString()),
			axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
			axisLabel: { 
				color: (value: string) => Number(value) === atmStrike ? colors.primary : '#64748b', 
				fontSize: 10, 
				margin: 12,
				fontWeight: (value: string) => Number(value) === atmStrike ? 'bold' : 'normal'
			},
			axisTick: { show: false },
			name: 'STRIKES',
			nameLocation: 'middle',
			nameGap: 35,
			nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal' }
		},
		yAxis: {
			type: 'value',
			name: 'EXTRINSIC VALUE',
			splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
			axisLabel: { color: '#64748b', fontSize: 10 },
			nameTextStyle: { color: '#64748b', fontSize: 10, fontWeight: 'normal', padding: [0, 0, 10, 0] }
		},
		series: [
			{
				name: 'Ext CE',
				type: chartType,
				data: ceData,
				smooth: true,
				symbol: chartType === 'line' ? 'circle' : 'none',
				symbolSize: 6,
				barGap: '10%',
				itemStyle: {
					color: chartType === 'bar' ? {
						type: 'linear',
						x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: addAlpha(colors.bullish, 0.8) },
							{ offset: 1, color: addAlpha(colors.bullish, 0.1) }
						]
					} : colors.bullish,
					borderRadius: [4, 4, 0, 0]
				},
				lineStyle: { width: 2, color: colors.bullish },
				markPoint: createMarkPoint(0, colors.bullish),
				emphasis: { focus: 'series' }
			},
			{
				name: 'Ext PE',
				type: chartType,
				data: peData,
				smooth: true,
				symbol: chartType === 'line' ? 'circle' : 'none',
				symbolSize: 6,
				itemStyle: {
					color: chartType === 'bar' ? {
						type: 'linear',
						x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: addAlpha(colors.bearish, 0.8) },
							{ offset: 1, color: addAlpha(colors.bearish, 0.1) }
						]
					} : colors.bearish,
					borderRadius: [4, 4, 0, 0]
				},
				lineStyle: { width: 2, color: colors.bearish },
				markPoint: createMarkPoint(1, colors.bearish),
				emphasis: { focus: 'series' }
			}
		]
	};
};
