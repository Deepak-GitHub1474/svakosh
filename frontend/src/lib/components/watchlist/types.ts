export type TWatchlistItem = {
	name: string;
	predefined: boolean;
	count: number;
};

export type TWatchlistSortBy = 'name' | 'ltp' | 'change' | 'changePct';

export type TSortDirection = 'asc' | 'desc';

export type { TResult } from '$lib/api';

export type TOpResult =
	| { ok: true }
	| { ok: false; error: string; status?: number };

export type TSymbol = {
	sk_token: string;
	trading_symbol: string;
	exchange: string;
	instrument: string;
	lot_size: number;
	expiry: string | null;
	strike: number | null;
	option_type: string | null;
	underlying_symbol: string;
};

export type TWatchlistEntry = TSymbol & {
	company_name?: string | null;
	symbol_note?: string | null;
};

export type TWatchlistEntriesPayload = {
	watchlist: string;
	predefined: boolean;
	entries: TWatchlistEntry[];
};

const NON_TRADABLE_INSTRUMENTS = new Set(['INDEX', 'CURRENCY', 'CURRENCYPAIR', 'COMMODITY']);

export function isTradable(instrument: string): boolean {
	const inst = (instrument ?? '').toUpperCase();
	if (!inst) return true;
	return !NON_TRADABLE_INSTRUMENTS.has(inst);
}
