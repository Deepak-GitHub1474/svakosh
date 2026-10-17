import type { TGreeksRow, TStrikeData } from './types';

const RATE = 0.07;
const MINUTES_PER_YEAR = 365 * 24 * 60;

type TRequest = {
	spot: number;
	tte: number;
	rate: number;
	strikes: { strike: string; ce_ltp: number; pe_ltp: number }[];
};
type TResolve = (rows: TGreeksRow[] | null) => void;

let worker: Worker | null = null;
let inFlight: TResolve | null = null;
let queued: { request: TRequest; resolve: TResolve } | null = null;
let lastSignature = '';

function ensureWorker(): Worker | null {
	if (typeof window === 'undefined') return null;
	if (worker) return worker;
	worker = new Worker(new URL('./greeks.worker.ts', import.meta.url), { type: 'module' });
	worker.onmessage = (event: MessageEvent<TGreeksRow[]>) => {
		const done = inFlight;
		inFlight = null;
		done?.(event.data);
		if (queued) {
			const next = queued;
			queued = null;
			post(next.request, next.resolve);
		}
	};
	return worker;
}

function post(request: TRequest, resolve: TResolve) {
	inFlight = resolve;
	worker?.postMessage(request);
}

export function clearGreeksCache(): void {
	lastSignature = '';
}

export function destroyGreeks(): void {
	worker?.terminate();
	worker = null;
	inFlight?.(null);
	queued?.resolve(null);
	inFlight = null;
	queued = null;
	lastSignature = '';
}

export function computeGreeks(
	spot: number,
	tte: number,
	strikes: string[],
	data: Record<string, TStrikeData>
): Promise<Record<string, TGreeksRow> | null> {
	const inputs = strikes.map((strike) => ({
		strike,
		ce_ltp: data[strike]?.ce_ltp ?? 0,
		pe_ltp: data[strike]?.pe_ltp ?? 0
	}));
	const signature = `${spot}|${Math.round(tte * MINUTES_PER_YEAR)}|${inputs
		.map((i) => `${i.strike}:${i.ce_ltp}:${i.pe_ltp}`)
		.join(',')}`;
	const instance = ensureWorker();
	if (!instance || spot <= 0 || tte <= 0 || signature === lastSignature) {
		return Promise.resolve(null);
	}
	lastSignature = signature;

	return new Promise((resolve) => {
		const done: TResolve = (rows) =>
			resolve(rows ? Object.fromEntries(rows.map((row) => [row.strike, row])) : null);
		const request = { spot, tte, rate: RATE, strikes: inputs };
		if (inFlight) {
			queued?.resolve(null);
			queued = { request, resolve: done };
		} else {
			post(request, done);
		}
	});
}
