import type { TQuote } from './feed.svelte';
import { inSession, istDate, istTime } from './time';
import type { TBar } from './types';

export function withLive(bars: TBar[] = [], quote: TQuote | undefined, interval: number): TBar[] {
	const now = Date.now();
	if (!quote?.ltp || !inSession(now)) return bars;
	const step = interval * 60_000;
	const bucket = now - (now % step);
	const last = bars.at(-1);
	if (last && istDate(last[0]) !== istDate(now)) return bars;
	const oi = quote.oi ?? last?.[6] ?? 0;
	if (last && last[0] === bucket) {
		return [
			...bars.slice(0, -1),
			[
				bucket,
				last[1],
				Math.max(last[2], quote.ltp),
				Math.min(last[3], quote.ltp),
				quote.ltp,
				last[5],
				oi
			]
		];
	}
	return [...bars, [bucket, quote.ltp, quote.ltp, quote.ltp, quote.ltp, 0, oi]];
}

export function oiByTime(ce: TBar[], pe: TBar[]): Record<string, { ceOI: number; peOI: number }> {
	const out: Record<string, { ceOI: number; peOI: number }> = {};
	for (const bar of ce) (out[istTime(bar[0])] ??= { ceOI: 0, peOI: 0 }).ceOI = bar[6];
	for (const bar of pe) (out[istTime(bar[0])] ??= { ceOI: 0, peOI: 0 }).peOI = bar[6];
	return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

export type TLeg = {
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	oi: number;
	atp: number;
};

const EMPTY_LEG: TLeg = { open: 0, high: 0, low: 0, close: 0, volume: 0, oi: 0, atp: 0 };

function legs(bars: TBar[]): Map<string, TLeg> {
	const out = new Map<string, TLeg>();
	let value = 0;
	let volume = 0;
	for (const [ts, open, high, low, close, vol, oi] of bars) {
		value += ((high + low + close) / 3) * vol;
		volume += vol;
		const atp = volume ? Math.round((value / volume) * 100) / 100 : close;
		out.set(istTime(ts), { open, high, low, close, volume: vol, oi, atp });
	}
	return out;
}

export function legsByTime(ce: TBar[], pe: TBar[]): { time: string; ce: TLeg; pe: TLeg }[] {
	const left = legs(ce);
	const right = legs(pe);
	return [...new Set([...left.keys(), ...right.keys()])]
		.sort()
		.map((time) => ({ time, ce: left.get(time) ?? EMPTY_LEG, pe: right.get(time) ?? EMPTY_LEG }));
}

export function barAt(series: TBar[], ts: number): TBar | undefined {
	for (let i = series.length - 1; i >= 0; i--) {
		if (series[i][0] <= ts) return series[i];
	}
	return undefined;
}
