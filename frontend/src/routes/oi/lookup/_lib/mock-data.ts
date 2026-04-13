import type { TFullLookupData, TSymbolLookupDetail, TCategoryMetrics } from './types';
import { LOOKUP_SYMBOLS, LOOKUP_TIMEFRAMES, EXPIRIES, LOOKUP_CATEGORIES } from './const';
import { roundLakh } from '$lib/utils';

function generateRandomMetrics(): TCategoryMetrics {
	const metrics: any = {};
	LOOKUP_TIMEFRAMES.forEach(tf => {
		metrics[tf] = roundLakh((Math.random() - 0.4) * 100);
	});
	return metrics as TCategoryMetrics;
}

function generateSymbolLookup(): TSymbolLookupDetail {
	const detail: any = { CE: {}, PE: {} };
	LOOKUP_CATEGORIES.forEach(cat => {
		detail.CE[cat] = generateRandomMetrics();
		detail.PE[cat] = generateRandomMetrics();
	});
	return detail as TSymbolLookupDetail;
}

export const LOADED_LOOKUP_DATA: TFullLookupData = EXPIRIES.reduce((acc, exp) => {
	acc[exp] = LOOKUP_SYMBOLS.reduce((sAcc, symbol) => {
		sAcc[symbol] = generateSymbolLookup();
		return sAcc;
	}, {} as any);
	return acc;
}, {} as any);

export function generateGraphData(symbol: string, expiry: string) {
	const timestamps = [];
	const now = new Date();
	for (let i = 100; i >= 0; i--) {
		const t = new Date(now.getTime() - i * 3 * 60000);
		timestamps.push(`${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`);
	}

	const data: any = {};
	timestamps.forEach(ts => {
		data[ts] = { CE: {}, PE: {} };
		['ATM', 'ITM', 'OTM', 'DITM', 'FOTM'].forEach(cat => {
			data[ts].CE[cat] = { 
				Total: roundLakh(Math.random() * 500), 
				Day: roundLakh(Math.random() * 50) 
			};
			data[ts].PE[cat] = { 
				Total: roundLakh(Math.random() * 500), 
				Day: roundLakh(Math.random() * 50) 
			};
		});
	});

	return {
		data,
		range: {
			'CE Range': { ATM: 21500, ITM: 21000, OTM: 22000, DITM: 20500, FOTM: 22500 },
			'PE Range': { ATM: 21500, ITM: 21000, OTM: 22000, DITM: 20500, FOTM: 22500 }
		}
	};
}
