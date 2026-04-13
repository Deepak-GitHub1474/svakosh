import type { TFullGlimpseData, TGlimpseSymbolDetail, TMetricDetails } from './types';
import { OI_SYMBOLS, OI_TIMEFRAMES, EXPIRIES, GLIMPSE_CATEGORIES } from './const';
import { roundLakh } from '$lib/utils';

function generateRandomMetrics(): TMetricDetails {
	const writing = roundLakh(Math.random() * 50);
	const unwinding = roundLakh(Math.random() * 50);
	return {
		Writing: writing,
		Unwinding: unwinding,
		Net: roundLakh(writing - unwinding)
	};
}

function generateSymbolGlimpse(): TGlimpseSymbolDetail {
	const detail: any = { CE: {}, PE: {}, Overall: {} };
	GLIMPSE_CATEGORIES.forEach(cat => {
		detail.CE[cat] = generateRandomMetrics();
		detail.PE[cat] = generateRandomMetrics();
		detail.Overall[cat] = {
			Writing: roundLakh(detail.PE[cat].Writing - detail.CE[cat].Writing),
			Unwinding: roundLakh(detail.PE[cat].Unwinding - detail.CE[cat].Unwinding),
			Net: 0
		};
		detail.Overall[cat].Net = roundLakh(detail.Overall[cat].Writing - detail.Overall[cat].Unwinding);
	});
	return detail as TGlimpseSymbolDetail;
}

export const LOADED_GLIMPSE_DATA: TFullGlimpseData = EXPIRIES.reduce((acc, exp) => {
	acc[exp] = OI_SYMBOLS.reduce((sAcc, symbol) => {
		sAcc[symbol] = OI_TIMEFRAMES.reduce((tAcc, tf) => {
			tAcc[tf] = generateSymbolGlimpse();
			return tAcc;
		}, {} as any);
		return sAcc;
	}, {} as any);
	return acc;
}, {} as any);
