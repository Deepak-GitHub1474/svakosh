import type { TFullTrackerData, TTrackerSymbolDetail, TTrackerMetrics } from './types';
import { TRACKER_SYMBOLS, TRACKER_TIMEFRAMES, EXPIRIES, TRACKER_CATEGORIES } from './const';
import { roundLakh } from '$lib/utils';

function generateRandomMetrics(): TTrackerMetrics {
	const metrics: any = {};
	TRACKER_TIMEFRAMES.forEach(tf => {
		metrics[tf] = roundLakh((Math.random() - 0.4) * 80);
	});
	return metrics as TTrackerMetrics;
}

function generateSymbolTracker(): TTrackerSymbolDetail {
	const detail: any = { CE: {}, PE: {} };
	TRACKER_CATEGORIES.forEach(cat => {
		detail.CE[cat] = generateRandomMetrics();
		detail.PE[cat] = generateRandomMetrics();
	});
	return detail as TTrackerSymbolDetail;
}

export const LOADED_TRACKER_DATA: TFullTrackerData = EXPIRIES.reduce((acc, exp) => {
	acc[exp] = {} as any;
	TRACKER_SYMBOLS.forEach(symbol => {
		acc[exp][symbol] = generateSymbolTracker();
	});
	return acc;
}, {} as any);

export function generateTrackerGraphData(symbol: string, expiry: string) {
	const timestamps: string[] = [];
	const marketStart = new Date();
	marketStart.setHours(9, 15, 0, 0);

	for (let i = 0; i <= 125; i++) {
		const t = new Date(marketStart.getTime() + i * 3 * 60000);
		timestamps.push(`${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`);
	}

	const data: any = { CE: {}, PE: {} };
	TRACKER_CATEGORIES.forEach(cat => {
		data.CE[cat] = timestamps.map(() => roundLakh(Math.random() * 500));
		data.PE[cat] = timestamps.map(() => roundLakh(Math.random() * 500));
	});

	return {
		timestamps,
		data
	};
}
