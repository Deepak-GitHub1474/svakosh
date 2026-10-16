import { changeOf, marketFeed, type TQuoteField } from '$lib/market/feed.svelte';
import { getChain, getChains } from '$lib/market/service';
import { optionToken } from '$lib/market/token';
import type { TChainRef, TChainView } from '$lib/market/types';
import {
	DEFAULT_STRIKE_RANGE,
	DEFAULT_SYMBOL,
	GREEKS_INTERVAL,
	MAX_STRIKE_RANGE,
	MIN_STRIKE_RANGE,
	PREFERRED_SYMBOL_ORDER
} from './const';
import { clearGreeksCache, computeGreeks, destroyGreeks } from './greeks';
import { nearestAtm, timeToExpiry, visibleStrikes } from './helper';
import type { TChainData, TGreeksRow, TStrikeData, TViewMode } from './types';

const OPTION_FIELDS: TQuoteField[] = ['ltp', 'prev_close', 'oi', 'prev_oi', 'volume', 'bid', 'ask'];

let refs = $state<TChainRef[]>([]);
let detail = $state<TChainView | null>(null);
let symbol = $state(DEFAULT_SYMBOL);
let expiry = $state<string | null>(null);
let view = $state<TViewMode>('OI');
let range = $state(DEFAULT_STRIKE_RANGE);
let loading = $state(true);
let error = $state<string | null>(null);
let greeks = $state<Record<string, TGreeksRow>>({});
let windowAnchor = $state('');

let stopRoot: (() => void) | undefined;
let greeksIntervalId = 0;
let requestId = 0;

const symbols = $derived(
	refs
		.map((ref) => ref.underlying)
		.sort((left, right) => rank(left) - rank(right) || left.localeCompare(right))
);
const expiries = $derived(detail?.expiries.map((entry) => entry.date) ?? []);
const current = $derived(detail?.expiries.find((entry) => entry.date === expiry));
const allStrikes = $derived(current?.strikes.map(String) ?? []);
const step = $derived(strikeStep(current?.strikes ?? []));
const spotQuote = $derived(detail ? marketFeed.quotes[detail.spot] : undefined);
const atm = $derived(nearestAtm(spotQuote?.ltp ?? 0, step));
const strikes = $derived(
	spotQuote?.ltp ? visibleStrikes(allStrikes, windowAnchor || atm, range) : []
);
const optionsData = $derived(Object.fromEntries(strikes.map((strike) => [strike, rowOf(strike)])));

const data = $derived.by((): TChainData | null => {
	if (!detail || !current) return null;
	return {
		spot: detail.spot,
		get spot_ltp() {
			return spotQuote?.ltp ?? 0;
		},
		get spot_change() {
			return changeOf(spotQuote).change;
		},
		get spot_change_pct() {
			return changeOf(spotQuote).change_pct;
		},
		get atm_strike() {
			return atm;
		},
		strike_difference: step,
		all_strikes: allStrikes,
		options_data: optionsData,
		lot_size: current.lot_size
	};
});

function rank(underlying: string) {
	const index = PREFERRED_SYMBOL_ORDER.indexOf(underlying);
	return index === -1 ? PREFERRED_SYMBOL_ORDER.length : index;
}

function strikeStep(values: number[]): number {
	let smallest = 0;
	for (let i = 1; i < values.length; i++) {
		const gap = values[i] - values[i - 1];
		if (gap > 0 && (smallest === 0 || gap < smallest)) smallest = gap;
	}
	return smallest;
}

function rowOf(strike: string): TStrikeData {
	if (!detail || !expiry) return {};
	const row: TStrikeData = {
		ce_token: optionToken(detail.exchange, detail.underlying, expiry, strike, 'CE'),
		pe_token: optionToken(detail.exchange, detail.underlying, expiry, strike, 'PE')
	};
	for (const side of ['ce', 'pe'] as const) {
		const token = row[`${side}_token`] as string;
		for (const field of OPTION_FIELDS) {
			Object.defineProperty(row, `${side}_${field}`, {
				get: () => marketFeed.quotes[token]?.[field],
				enumerable: true
			});
		}
	}
	return row;
}

async function loadChain(next: string) {
	const ref = refs.find((entry) => entry.underlying === next);
	if (!ref) return;
	const id = ++requestId;
	loading = true;
	const res = await getChain(ref.exchange, ref.underlying);
	if (id !== requestId) return;
	if (!res.ok) {
		error = res.error;
		loading = false;
		return;
	}
	detail = res.data;
	if (!expiry || !res.data.expiries.some((entry) => entry.date === expiry)) {
		expiry = res.data.expiries[0]?.date ?? null;
	}
	windowAnchor = '';
	resetGreeks();
	error = null;
	loading = false;
}

function resetGreeks() {
	clearGreeksCache();
	greeks = {};
}

async function refreshGreeks() {
	if (!data || !expiry) return;
	const rows = await computeGreeks(data.spot_ltp, timeToExpiry(expiry), strikes, optionsData);
	if (rows) greeks = rows;
}

function watch() {
	$effect(() => {
		if (!detail) return;
		return marketFeed.subscribe([detail.spot]);
	});
	$effect(() => {
		const tokens = strikes.flatMap((strike) => {
			const row = optionsData[strike];
			return row?.ce_token && row.pe_token ? [row.ce_token, row.pe_token] : [];
		});
		if (tokens.length) return marketFeed.subscribe(tokens, OPTION_FIELDS);
	});
	$effect(() => {
		if (!step || atm === '0') return;
		if (!windowAnchor || Math.abs(Number(atm) - Number(windowAnchor)) >= step * 2) {
			windowAnchor = atm;
		}
	});
}

export async function startChain() {
	if (stopRoot) return;
	stopRoot = $effect.root(watch);
	greeksIntervalId = window.setInterval(() => {
		if (view === 'Greeks') void refreshGreeks();
	}, GREEKS_INTERVAL);
	loading = true;
	const res = await getChains();
	if (!stopRoot) return;
	if (!res.ok) {
		error = res.error;
		loading = false;
		return;
	}
	refs = res.data;
	if (!refs.some((entry) => entry.underlying === symbol)) symbol = symbols[0] ?? DEFAULT_SYMBOL;
	await loadChain(symbol);
}

export function stopChain() {
	stopRoot?.();
	stopRoot = undefined;
	clearInterval(greeksIntervalId);
	greeksIntervalId = 0;
	requestId++;
	destroyGreeks();
	detail = null;
	greeks = {};
}

export function setSymbol(next: string) {
	if (next === symbol) return;
	symbol = next;
	expiry = null;
	void loadChain(next);
}

export function setExpiry(next: string) {
	if (next === expiry) return;
	expiry = next;
	windowAnchor = '';
	resetGreeks();
}

export function setView(next: TViewMode) {
	view = next;
	if (next === 'Greeks') void refreshGreeks();
}

export function setRange(next: number) {
	if (!Number.isFinite(next)) return;
	range = Math.max(MIN_STRIKE_RANGE, Math.min(MAX_STRIKE_RANGE, Math.round(next)));
	if (view === 'Greeks') void refreshGreeks();
}

export const chain = {
	get data() {
		return data;
	},
	get symbols() {
		return symbols;
	},
	get expiries() {
		return expiries;
	},
	get symbol() {
		return symbol;
	},
	get expiry() {
		return expiry;
	},
	get view() {
		return view;
	},
	get range() {
		return range;
	},
	get strikes() {
		return strikes;
	},
	get atm() {
		return atm;
	},
	get greeks() {
		return greeks;
	},
	get connected() {
		return marketFeed.connected;
	},
	get loading() {
		return loading;
	},
	get error() {
		return error;
	}
};
