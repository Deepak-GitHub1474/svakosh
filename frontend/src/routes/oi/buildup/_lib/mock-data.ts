import type { TFullOIData, TOISymbolDetail, TOIEntry } from './types';
import { OI_SYMBOLS, OI_TIMEFRAMES } from './const';
import { roundLakh } from '$lib/utils';

function generateRandomEntries(baseStrike: number, count: number, direction: 1 | -1): TOIEntry[] {
	return Array.from({ length: count }, (_, i) => ({
		Strike: baseStrike + i * 100 * direction,
		OI: roundLakh(Math.random() * 5 * direction)
	}));
}

function generateRandomBuildup(): TOIEntry[] {
	const count = 5;
	const strikes = [22000, 22100, 22200, 22300, 22400];
	return Array.from({ length: count }, (_, i) => {
		const direction = Math.random() > 0.5 ? 1 : -1;
		return {
			Strike: strikes[i],
			OI: roundLakh(Math.random() * 5 * direction)
		};
	});
}

function generateSymbolDetail(symbol: string): TOISymbolDetail {
	const baseStrike = symbol.includes('NIFTY') ? 22000 : 70000;
	return {
		CE: {
			Writing: generateRandomEntries(baseStrike, 7, 1),
			Unwinding: generateRandomEntries(baseStrike - 500, 7, -1)
		},
		PE: {
			Writing: generateRandomEntries(baseStrike - 1000, 7, -1),
			Unwinding: generateRandomEntries(baseStrike + 500, 7, 1)
		}
	};
}

export const LOADED_OI_DATA: Record<string, TFullOIData> = {
	CURRENT_WEEK: OI_SYMBOLS.reduce((acc, symbol) => {
		acc[symbol] = OI_TIMEFRAMES.reduce((tAcc, tf) => {
			tAcc[tf] = generateSymbolDetail(symbol);
			return tAcc;
		}, {} as any);
		return acc;
	}, {} as any),
	NEXT_WEEK: OI_SYMBOLS.reduce((acc, symbol) => {
		acc[symbol] = OI_TIMEFRAMES.reduce((tAcc, tf) => {
			tAcc[tf] = generateSymbolDetail(symbol);
			return tAcc;
		}, {} as any);
		return acc;
	}, {} as any),
	CURRENT_MONTH: OI_SYMBOLS.reduce((acc, symbol) => {
		acc[symbol] = OI_TIMEFRAMES.reduce((tAcc, tf) => {
			tAcc[tf] = generateSymbolDetail(symbol);
			return tAcc;
		}, {} as any);
		return acc;
	}, {} as any)
};
