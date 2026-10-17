import { roundLakh } from '$lib/utils';
import type { TBar } from './types';

export type TSide = 'CE' | 'PE';
export type TBucket = { name: string; zone: 'ATM' | 'ITM' | 'OTM'; from: number; to: number };

export const OI_RANGE = 10;

export type TStrikeLeg = { strike: number; offset: number; series: TBar[]; prevOi: number };

export function lakh(value: number): number {
	return roundLakh(value / 100000);
}

export function minutesOf(timeframe: string): number {
	return parseInt(timeframe, 10) || 0;
}

export function inBucket(offset: number, side: TSide, bucket: TBucket): boolean {
	if (bucket.zone === 'ATM') return offset === 0;
	const itm = side === 'CE' ? -offset : offset;
	if ((bucket.zone === 'ITM') !== itm > 0 || offset === 0) return false;
	const distance = Math.abs(offset);
	return distance >= bucket.from && distance <= bucket.to;
}

function oiBefore(series: TBar[], ts: number): number {
	for (let i = series.length - 1; i >= 0; i--) {
		if (series[i][0] <= ts) return series[i][6];
	}
	return series[0]?.[6] ?? 0;
}

export function oiChange(series: TBar[], minutes: number): number {
	const last = series.at(-1);
	if (!last) return 0;
	return last[6] - oiBefore(series, last[0] - minutes * 60_000);
}

export function dayChange(series: TBar[], prevOi?: number): number {
	const last = series.at(-1);
	if (!last) return 0;
	return last[6] - (prevOi || series[0][6]);
}

export function legChange(leg: TStrikeLeg, timeframe: string): number {
	if (timeframe === 'Day') return dayChange(leg.series, leg.prevOi);
	if (timeframe.startsWith('Total')) return leg.series.at(-1)?.[6] ?? 0;
	return oiChange(leg.series, minutesOf(timeframe));
}

export function bucketMetrics(legs: TStrikeLeg[], timeframes: string[]): Record<string, number> {
	return Object.fromEntries(
		timeframes.map((tf) => [tf, lakh(legs.reduce((sum, leg) => sum + legChange(leg, tf), 0))])
	);
}

export function timeline(legs: TStrikeLeg[]): number[] {
	const set = new Set<number>();
	for (const leg of legs) for (const bar of leg.series) set.add(bar[0]);
	return [...set].sort((a, b) => a - b);
}

export function totalAt(legs: TStrikeLeg[], ts: number): number {
	return legs.reduce((sum, leg) => sum + oiBefore(leg.series, ts), 0);
}

export function dayStart(legs: TStrikeLeg[]): number {
	return legs.reduce((sum, leg) => sum + (leg.prevOi || leg.series[0]?.[6] || 0), 0);
}

const ATM: TBucket = { name: 'ATM', zone: 'ATM', from: 0, to: 0 };

export const TRACKER_BUCKETS: TBucket[] = [
	ATM,
	{ name: 'ITM', zone: 'ITM', from: 1, to: 3 },
	{ name: 'OTM', zone: 'OTM', from: 1, to: 3 },
	{ name: 'DITM', zone: 'ITM', from: 4, to: OI_RANGE },
	{ name: 'FOTM', zone: 'OTM', from: 4, to: OI_RANGE }
];

export const LOOKUP_BUCKETS: TBucket[] = [
	ATM,
	{ name: 'ITM', zone: 'ITM', from: 1, to: 3 },
	{ name: 'DITM-1', zone: 'ITM', from: 4, to: 6 },
	{ name: 'DITM-2', zone: 'ITM', from: 7, to: OI_RANGE },
	{ name: 'OTM', zone: 'OTM', from: 1, to: 3 },
	{ name: 'FOTM-1', zone: 'OTM', from: 4, to: 6 },
	{ name: 'FOTM-2', zone: 'OTM', from: 7, to: OI_RANGE }
];

export const GLIMPSE_BUCKETS: TBucket[] = [
	ATM,
	{ name: 'OTM', zone: 'OTM', from: 1, to: 3 },
	{ name: 'FOTM', zone: 'OTM', from: 4, to: OI_RANGE },
	{ name: 'ITM', zone: 'ITM', from: 1, to: OI_RANGE }
];

export function writingUnwinding(legs: TStrikeLeg[], minutes: number) {
	let writing = 0;
	let unwinding = 0;
	for (const leg of legs) {
		const change = oiChange(leg.series, minutes);
		if (change > 0) writing += change;
		else unwinding -= change;
	}
	return { Writing: lakh(writing), Unwinding: lakh(unwinding), Net: lakh(writing - unwinding) };
}

export function topChanges(legs: TStrikeLeg[], minutes: number, count: number) {
	const rows = legs.map((leg) => ({ Strike: leg.strike, change: oiChange(leg.series, minutes) }));
	const pick = (list: typeof rows) =>
		list.slice(0, count).map((row) => ({ Strike: row.Strike, OI: lakh(row.change) }));
	return {
		Writing: pick(rows.filter((r) => r.change > 0).sort((a, b) => b.change - a.change)),
		Unwinding: pick(rows.filter((r) => r.change < 0).sort((a, b) => a.change - b.change))
	};
}
