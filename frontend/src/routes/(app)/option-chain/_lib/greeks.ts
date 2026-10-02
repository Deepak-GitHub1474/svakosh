import type { TGreeksRow, TStrikeData } from './types';

const RATE = 0.07;

type TCacheEntry = { ce: number; pe: number; row: TGreeksRow };

let worker: Worker | null = null;
let pending: ((rows: TGreeksRow[]) => void) | null = null;
const cache = new Map<string, TCacheEntry>();

function ensureWorker(): Worker | null {
	if (typeof window === 'undefined') return null;
	if (worker) return worker;

	worker = new Worker(new URL('./greeks.worker.ts', import.meta.url), { type: 'module' });
	worker.onmessage = (event: MessageEvent<TGreeksRow[]>) => {
		const resolve = pending;
		pending = null;
		resolve?.(event.data);
	};
	return worker;
}

export function clearGreeksCache(): void {
	cache.clear();
}

export function destroyGreeks(): void {
	worker?.terminate();
	worker = null;
	pending = null;
	cache.clear();
}

export async function computeGreeks(
	spot: number,
	tte: number,
	strikes: string[],
	data: Record<string, TStrikeData>
): Promise<Record<string, TGreeksRow>> {
	const results: Record<string, TGreeksRow> = {};
	const needsCompute: { strike: string; ce_ltp: number; pe_ltp: number }[] = [];

	for (const strike of strikes) {
		const row = data[strike];
		if (!row) continue;
		const callLtp = row.ce_ltp ?? 0;
		const putLtp = row.pe_ltp ?? 0;
		const cached = cache.get(strike);
		if (cached && cached.ce === callLtp && cached.pe === putLtp) {
			results[strike] = cached.row;
			continue;
		}
		needsCompute.push({ strike, ce_ltp: callLtp, pe_ltp: putLtp });
	}

	if (needsCompute.length === 0) return results;

	const instance = ensureWorker();
	if (!instance || spot <= 0 || tte <= 0) return results;

	if (pending) return results;

	const rows = await new Promise<TGreeksRow[]>((resolve) => {
		pending = resolve;
		instance.postMessage({ spot, tte, rate: RATE, strikes: needsCompute });
	});

	for (const row of rows) {
		const source = needsCompute.find((entry) => entry.strike === row.strike);
		cache.set(row.strike, { ce: source?.ce_ltp ?? 0, pe: source?.pe_ltp ?? 0, row });
		results[row.strike] = row;
	}

	return results;
}
