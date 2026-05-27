import type { TOIEntry } from './types';

export function calculateTotalOI(entries: TOIEntry[]): number {
	return entries.reduce((total, item) => total + item.OI, 0);
}

export function getPriceClass(value: number): string {
	return value >= 0 ? 'text-bullish' : 'text-bearish';
}
