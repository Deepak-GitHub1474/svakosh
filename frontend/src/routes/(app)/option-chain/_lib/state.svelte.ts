import {
	DEFAULT_STRIKE_RANGE,
	DEFAULT_SYMBOL,
	GREEKS_INTERVAL,
	MAX_STRIKE_RANGE,
	MIN_STRIKE_RANGE,
	PREFERRED_SYMBOL_ORDER
} from './const';
import { openFeed, type TFeed } from './feed';
import { clearGreeksCache, computeGreeks, destroyGreeks } from './greeks';
import { nearestAtm, parseChainId, timeToExpiry, visibleStrikes } from './helper';
import type {
	TChainData,
	TChainId,
	TFeedMessage,
	TGreeksRow,
	TStrikeData,
	TTokenTick,
	TViewMode
} from './types';

let feed: TFeed | null = null;
let tokenIndex = new Map<string, { strike: string; isCe: boolean }>();
let tickBuffer = new Map<string, TTokenTick>();
let flushFrame = 0;
let greeksIntervalId = 0;

let chainData = $state<TChainData | null>(null);
let chainIds = $state<TChainId[]>([]);
let activeId = $state<string | null>(null);
let symbol = $state(DEFAULT_SYMBOL);
let expiry = $state<string | null>(null);
let view = $state<TViewMode>('OI');
let range = $state(DEFAULT_STRIKE_RANGE);
let connected = $state(false);
let loading = $state(true);
let error = $state<string | null>(null);
let greeks = $state<Record<string, TGreeksRow>>({});
let windowAnchor = $state('');

const symbols = $derived(
	[...new Set(chainIds.map((entry) => entry.symbol))].sort((left, right) => {
		const leftRank = PREFERRED_SYMBOL_ORDER.indexOf(left);
		const rightRank = PREFERRED_SYMBOL_ORDER.indexOf(right);
		return (leftRank === -1 ? 99 : leftRank) - (rightRank === -1 ? 99 : rightRank);
	})
);
const expiries = $derived(
	chainIds.filter((entry) => entry.symbol === symbol).map((entry) => entry.expiry)
);

const atm = $derived.by(() => {
	if (!chainData) return '0';
	return nearestAtm(chainData.spot_ltp, chainData.strike_difference);
});

const strikes = $derived.by(() => {
	if (!chainData) return [];
	return visibleStrikes(chainData.all_strikes, windowAnchor || atm, range);
});

function reanchorWindow() {
	if (!chainData) return;
	const driftFromAnchor = Math.abs(Number(atm) - Number(windowAnchor));
	if (!windowAnchor || driftFromAnchor >= chainData.strike_difference * 2) windowAnchor = atm;
}

function applyTick(token: string, tick: TTokenTick): boolean {
	if (!chainData) return false;

	if (token === chainData.spot) {
		const ltp = tick.ltp ?? chainData.spot_ltp;
		const prev = tick.prev_close ?? chainData.spot_ltp - chainData.spot_change;
		chainData.spot_ltp = ltp;
		chainData.spot_change = ltp - prev;
		chainData.spot_change_pct = prev ? ((ltp - prev) / prev) * 100 : 0;
		return true;
	}

	const location = tokenIndex.get(token);
	if (!location) return false;

	const row = chainData.options_data[location.strike];
	if (!row) return false;

	const prefix = location.isCe ? 'ce' : 'pe';
	const assign = (field: keyof TStrikeData, incoming: number | undefined) => {
		if (incoming === undefined) return;
		(row[field] as number) = incoming;
	};

	assign(`${prefix}_ltp` as keyof TStrikeData, tick.ltp);
	assign(`${prefix}_oi` as keyof TStrikeData, tick.oi);
	assign(`${prefix}_volume` as keyof TStrikeData, tick.volume);
	assign(`${prefix}_bid` as keyof TStrikeData, tick.bid);
	assign(`${prefix}_ask` as keyof TStrikeData, tick.ask);
	return true;
}

function flush() {
	flushFrame = 0;
	if (!chainData || tickBuffer.size === 0) return;

	let changed = false;
	for (const [token, tick] of tickBuffer) {
		if (applyTick(token, tick)) changed = true;
	}
	tickBuffer.clear();

	if (changed) {
		chainData = { ...chainData };
		reanchorWindow();
	}
}

function schedule() {
	if (flushFrame) return;
	flushFrame = requestAnimationFrame(flush);
}

function buildTokenMap(data: TChainData) {
	tokenIndex = new Map();
	for (const [strike, row] of Object.entries(data.options_data)) {
		if (row.ce_token) tokenIndex.set(row.ce_token, { strike, isCe: true });
		if (row.pe_token) tokenIndex.set(row.pe_token, { strike, isCe: false });
	}
}

function pickChain(): string | null {
	const exact = chainIds.find(
		(entry) => entry.symbol === symbol && (!expiry || entry.expiry === expiry)
	);
	return exact?.id ?? chainIds.find((entry) => entry.symbol === symbol)?.id ?? null;
}

function handleMessage(message: TFeedMessage) {
	if (message.type === 'ids_list') {
		chainIds = message.data
			.map(parseChainId)
			.filter((entry): entry is TChainId => entry !== null)
			.sort((left, right) => left.expiry.localeCompare(right.expiry));

		if (!symbols.includes(symbol) && symbols.length) symbol = symbols[0];
		const nextChainId = pickChain();
		if (nextChainId) subscribe(nextChainId);
		return;
	}

	if (message.type === 'option_chain_initial') {
		chainData = message.data;
		activeId = message.chain_id;
		expiry = parseChainId(message.chain_id)?.expiry ?? expiry;
		buildTokenMap(message.data);
		windowAnchor = message.data.atm_strike;
		tickBuffer.clear();
		clearGreeksCache();
		greeks = {};
		loading = false;
		error = null;
		if (view === 'Greeks') refreshGreeks();
		return;
	}

	for (const [token, value] of Object.entries(message)) {
		if (token === 'type' || typeof value !== 'object' || value === null) continue;
		tickBuffer.set(token, value as TTokenTick);
	}
	schedule();
}

async function refreshGreeks() {
	if (!chainData || !expiry) return;
	const tte = timeToExpiry(expiry);
	const rows = await computeGreeks(chainData.spot_ltp, tte, strikes, chainData.options_data);
	greeks = { ...greeks, ...rows };
}

function startGreeksLoop() {
	stopGreeksLoop();
	greeksIntervalId = window.setInterval(() => {
		if (view === 'Greeks') void refreshGreeks();
	}, GREEKS_INTERVAL);
}

function stopGreeksLoop() {
	if (greeksIntervalId) clearInterval(greeksIntervalId);
	greeksIntervalId = 0;
}

function subscribe(id: string) {
	if (!feed) return;
	if (activeId && activeId !== id) feed.unsubscribe(activeId);
	activeId = id;
	loading = true;
	feed.subscribe(id);
}

export function startChain() {
	if (feed) return;
	loading = true;
	feed = openFeed({
		onMessage: handleMessage,
		onStatus: (isConnected) => {
			connected = isConnected;
			if (isConnected) feed?.requestIds();
		},
		onError: (message) => {
			error = message;
			loading = false;
		}
	});
	startGreeksLoop();
}

export function stopChain() {
	if (flushFrame) cancelAnimationFrame(flushFrame);
	flushFrame = 0;
	stopGreeksLoop();
	if (activeId) feed?.unsubscribe(activeId);
	feed?.close();
	feed = null;
	tokenIndex.clear();
	tickBuffer.clear();
	destroyGreeks();
	chainData = null;
	activeId = null;
}

export function setSymbol(next: string) {
	if (next === symbol) return;
	symbol = next;
	expiry = null;
	greeks = {};
	const nextChainId = pickChain();
	if (nextChainId) subscribe(nextChainId);
}

export function setExpiry(next: string) {
	if (next === expiry) return;
	expiry = next;
	greeks = {};
	const nextChainId = pickChain();
	if (nextChainId) subscribe(nextChainId);
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
		return chainData;
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
		return connected;
	},
	get loading() {
		return loading;
	},
	get error() {
		return error;
	}
};
