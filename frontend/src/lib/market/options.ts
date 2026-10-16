import type { TQuote, TQuoteField } from './feed.svelte';
import { optionToken } from './token';
import type { TChainView } from './types';

export const OI_FIELDS: TQuoteField[] = ['oi', 'prev_oi'];
export const OI_WINDOW = 30;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type TStrikeOI = {
	strike: number;
	ce_oi: number;
	ce_oi_change: number;
	pe_oi: number;
	pe_oi_change: number;
};

export function expiryLabel(iso: string): string {
	const [year, month, day] = iso.split('-');
	return `${day}-${MONTHS[Number(month) - 1]}-${year}`;
}

export function isMonthly(expiry: string, expiries: string[]): boolean {
	const month = expiry.slice(0, 7);
	return expiries.filter((e) => e.startsWith(month)).at(-1) === expiry;
}

export function nearestIndex(strikes: number[], price: number): number {
	let best = -1;
	for (let i = 0; i < strikes.length; i++) {
		if (best === -1 || Math.abs(strikes[i] - price) < Math.abs(strikes[best] - price)) best = i;
	}
	return best;
}

export function windowAround(strikes: number[], center: number, each = OI_WINDOW): number[] {
	if (center < 0) return [];
	return strikes.slice(Math.max(0, center - each), center + each + 1);
}

export function chainTokens(view: TChainView, expiry: string, strikes: number[]): string[] {
	return strikes.flatMap((strike) => [
		optionToken(view.exchange, view.underlying, expiry, strike, 'CE'),
		optionToken(view.exchange, view.underlying, expiry, strike, 'PE')
	]);
}

export function strikeOI(
	view: TChainView,
	expiry: string,
	strikes: number[],
	quotes: Record<string, TQuote>
): TStrikeOI[] {
	return strikes.map((strike) => {
		const ce = quotes[optionToken(view.exchange, view.underlying, expiry, strike, 'CE')] ?? {};
		const pe = quotes[optionToken(view.exchange, view.underlying, expiry, strike, 'PE')] ?? {};
		return {
			strike,
			ce_oi: ce.oi ?? 0,
			ce_oi_change: ce.prev_oi ? (ce.oi ?? 0) - ce.prev_oi : 0,
			pe_oi: pe.oi ?? 0,
			pe_oi_change: pe.prev_oi ? (pe.oi ?? 0) - pe.prev_oi : 0
		};
	});
}

export function totalsOf(rows: TStrikeOI[]) {
	let ce = 0;
	let pe = 0;
	for (const row of rows) {
		ce += row.ce_oi;
		pe += row.pe_oi;
	}
	return { ce, pe, pcr: ce ? Math.round((pe / ce) * 100) / 100 : 0 };
}

export function pcrView(pcr: number): string {
	if (pcr > 1) return 'Bullish';
	if (pcr < 0.7) return 'Bearish';
	return 'Neutral';
}

export type TPainPoint = {
	strike: number;
	value: number;
	callPayout: number;
	putPayout: number;
	totalPayout: number;
};

export function painCurve(rows: TStrikeOI[]): TPainPoint[] {
	return rows.map(({ strike }) => {
		let callPayout = 0;
		let putPayout = 0;
		for (const row of rows) {
			callPayout += row.ce_oi * Math.max(strike - row.strike, 0);
			putPayout += row.pe_oi * Math.max(row.strike - strike, 0);
		}
		const totalPayout = callPayout + putPayout;
		return { strike, value: totalPayout, callPayout, putPayout, totalPayout };
	});
}

export function maxPain(rows: TStrikeOI[]): number {
	let best: TPainPoint | null = null;
	for (const point of painCurve(rows)) {
		if (!best || point.totalPayout < best.totalPayout) best = point;
	}
	return best?.strike ?? 0;
}

export function extrinsic(
	ltp: number | undefined,
	spot: number,
	strike: number,
	type: 'CE' | 'PE'
) {
	if (!ltp || !spot) return 0;
	const intrinsic = type === 'CE' ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0);
	return Math.max(Math.round((ltp - intrinsic) * 100) / 100, 0);
}
