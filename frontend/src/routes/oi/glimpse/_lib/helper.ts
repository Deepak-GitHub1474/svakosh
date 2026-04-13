import type { TGlimpseSymbolDetail, TGlimpseCategory } from './types';
import { GLIMPSE_CATEGORIES } from './const';

export function calculateGlimpseTotals(data: TGlimpseSymbolDetail) {
	const totals: any = {
		CE: { Writing: 0, Unwinding: 0, Net: 0 },
		PE: { Writing: 0, Unwinding: 0, Net: 0 },
		Overall: { Writing: 0, Unwinding: 0, Net: 0 }
	};

	GLIMPSE_CATEGORIES.forEach(cat => {
		(['CE', 'PE', 'Overall'] as const).forEach(side => {
			totals[side].Writing += data[side][cat].Writing;
			totals[side].Unwinding += data[side][cat].Unwinding;
			totals[side].Net += data[side][cat].Net;
		});
	});

	// Totals are raw numbers, UI will format

	return totals;
}

export function getMetricColor(value: number, type: 'CE' | 'PE' | 'Overall'): string {
	if (type === 'CE') {
		return value < 0 ? 'text-bullish' : 'text-bearish';
	}
	// PE and Overall: Positive is Green/Bullish, Negative is Red/Bearish
	return value > 0 ? 'text-bullish' : 'text-bearish';
}
