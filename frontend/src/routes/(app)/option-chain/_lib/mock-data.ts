import type { TChainData, TFeedMessage, TStrikeData, TTokenTick } from './types';

type TSpec = {
	symbol: string;
	exchange: string;
	segment: string;
	spot: number;
	step: number;
	lotSize: number;
	expiries: string[];
};

const SPECS: TSpec[] = [
	{
		symbol: 'NIFTY',
		exchange: 'NSE',
		segment: '',
		spot: 24022.98,
		step: 50,
		lotSize: 75,
		expiries: upcomingExpiries(4, 4)
	},
	{
		symbol: 'BANKNIFTY',
		exchange: 'NSE',
		segment: 'BANK',
		spot: 54120.85,
		step: 100,
		lotSize: 30,
		expiries: upcomingExpiries(3, 3)
	},
	{
		symbol: 'SENSEX',
		exchange: 'BSE',
		segment: 'SENSEX',
		spot: 81402.7,
		step: 100,
		lotSize: 20,
		expiries: upcomingExpiries(2, 3)
	}
];

const STRIKE_SPAN = 30;
const MONTH_CODES = [
	'JAN',
	'FEB',
	'MAR',
	'APR',
	'MAY',
	'JUN',
	'JUL',
	'AUG',
	'SEP',
	'OCT',
	'NOV',
	'DEC'
];
const BASE_IV = 0.14;
const RATE = 0.07;

function normalCdf(z: number): number {
	const scale = 1 / (1 + 0.2316419 * Math.abs(z));
	const density = 0.3989423 * Math.exp((-z * z) / 2);
	const tail =
		density *
		scale *
		(0.3193815 +
			scale * (-0.3565638 + scale * (1.781478 + scale * (-1.821256 + scale * 1.330274))));
	return z > 0 ? 1 - tail : tail;
}

function bsPrice(spot: number, strike: number, term: number, vol: number, isCall: boolean): number {
	if (term <= 0 || vol <= 0) {
		return Math.max(isCall ? spot - strike : strike - spot, 0);
	}
	const d1 = (Math.log(spot / strike) + (RATE + 0.5 * vol * vol) * term) / (vol * Math.sqrt(term));
	const d2 = d1 - vol * Math.sqrt(term);
	const discount = strike * Math.exp(-RATE * term);
	const value = isCall
		? spot * normalCdf(d1) - discount * normalCdf(d2)
		: discount * normalCdf(-d2) - spot * normalCdf(-d1);
	return Math.max(value, 0.05);
}

function yearsTo(expiry: string): number {
	const [year, month, day] = expiry.split('-').map(Number);
	const expiryClose = new Date(year, month - 1, day, 15, 30, 0, 0);
	return Math.max((expiryClose.getTime() - Date.now()) / (365 * 86400000), 1 / 8760);
}

function upcomingExpiries(weekday: number, count: number): string[] {
	const dates: string[] = [];
	const cursor = new Date();
	cursor.setHours(0, 0, 0, 0);
	while (dates.length < count) {
		cursor.setDate(cursor.getDate() + 1);
		if (cursor.getDay() !== weekday) continue;
		const year = cursor.getFullYear();
		const month = String(cursor.getMonth() + 1).padStart(2, '0');
		const day = String(cursor.getDate()).padStart(2, '0');
		dates.push(`${year}-${month}-${day}`);
	}
	return dates;
}

let randomSeed = 20260928;
function nextRandom(): number {
	randomSeed ^= randomSeed << 13;
	randomSeed ^= randomSeed >>> 17;
	randomSeed ^= randomSeed << 5;
	return (randomSeed >>>= 0) / 4294967296;
}

function chainId(spec: TSpec, expiry: string): string {
	return `${spec.exchange}_${spec.segment}_${expiry}_INDEX`;
}

function optionToken(spec: TSpec, expiry: string, strike: number, side: 'CE' | 'PE'): string {
	const [year, month, day] = expiry.split('-');
	const exchangeCode = spec.exchange === 'NSE' ? 1 : 2;
	return `CT:${exchangeCode}:6:${spec.symbol}${day}${MONTH_CODES[Number(month) - 1]}${year}${strike}${side}`;
}

function specFor(id: string): { spec: TSpec; expiry: string } | null {
	for (const spec of SPECS) {
		for (const expiry of spec.expiries) {
			if (chainId(spec, expiry) === id) return { spec, expiry };
		}
	}
	return null;
}

function buildChain(spec: TSpec, expiry: string): TChainData {
	const atm = Math.round(spec.spot / spec.step) * spec.step;
	const term = yearsTo(expiry);
	const strikes: string[] = [];
	const options: Record<string, TStrikeData> = {};

	for (let step = -STRIKE_SPAN; step <= STRIKE_SPAN; step++) {
		const strike = atm + step * spec.step;
		if (strike <= 0) continue;
		strikes.push(String(strike));

		const strikeIv = BASE_IV + Math.abs(step) * 0.0016;
		const callPrice = bsPrice(spec.spot, strike, term, strikeIv, true);
		const putPrice = bsPrice(spec.spot, strike, term, strikeIv, false);

		const ceOi = Math.round((40000 + nextRandom() * 90000) * (step >= 0 ? 1.25 : 0.7));
		const peOi = Math.round((40000 + nextRandom() * 90000) * (step <= 0 ? 1.25 : 0.7));

		options[String(strike)] = {
			ce_token: optionToken(spec, expiry, strike, 'CE'),
			pe_token: optionToken(spec, expiry, strike, 'PE'),
			ce_ltp: Number(callPrice.toFixed(2)),
			pe_ltp: Number(putPrice.toFixed(2)),
			ce_prev_close: Number((callPrice * (0.82 + nextRandom() * 0.3)).toFixed(2)),
			pe_prev_close: Number((putPrice * (0.82 + nextRandom() * 0.3)).toFixed(2)),
			ce_oi: ceOi,
			pe_oi: peOi,
			ce_prev_oi: Math.round(ceOi * (0.9 + nextRandom() * 0.2)),
			pe_prev_oi: Math.round(peOi * (0.9 + nextRandom() * 0.2)),
			ce_volume: Math.round(nextRandom() * 250000),
			pe_volume: Math.round(nextRandom() * 250000),
			ce_bid: Number(Math.max(callPrice - 0.5, 0.05).toFixed(2)),
			ce_ask: Number((callPrice + 0.5).toFixed(2)),
			pe_bid: Number(Math.max(putPrice - 0.5, 0.05).toFixed(2)),
			pe_ask: Number((putPrice + 0.5).toFixed(2))
		};
	}

	return {
		spot: `CT:${spec.exchange === 'NSE' ? 1 : 2}:1:${spec.symbol}`,
		spot_ltp: spec.spot,
		spot_change: 0,
		spot_change_pct: 0,
		atm_strike: String(atm),
		strike_difference: spec.step,
		all_strikes: strikes,
		options_data: options,
		lot_size: spec.lotSize
	};
}

export function createMockFeed(onMessage: (message: TFeedMessage) => void) {
	let timer: ReturnType<typeof setInterval> | null = null;
	let active: { spec: TSpec; expiry: string; chain: TChainData } | null = null;

	function stop() {
		if (timer) clearInterval(timer);
		timer = null;
	}

	function tick() {
		if (!active) return;
		const { spec, chain } = active;

		const drift = (nextRandom() - 0.48) * spec.step * 0.4;
		chain.spot_ltp = Number((chain.spot_ltp + drift).toFixed(2));
		chain.spot_change = Number((chain.spot_ltp - spec.spot).toFixed(2));
		chain.spot_change_pct = Number(((chain.spot_change / spec.spot) * 100).toFixed(2));

		const update: Record<string, TTokenTick | string> = { type: 'market_data' };
		update[chain.spot] = { ltp: chain.spot_ltp, prev_close: spec.spot };

		const strikes = chain.all_strikes;
		const tickCount = 6 + Math.floor(nextRandom() * 8);

		for (let emitted = 0; emitted < tickCount; emitted++) {
			const strike = strikes[Math.floor(nextRandom() * strikes.length)];
			const row = chain.options_data[strike];
			if (!row) continue;

			const side = nextRandom() > 0.5 ? 'ce' : 'pe';
			const ltpKey = `${side}_ltp` as 'ce_ltp' | 'pe_ltp';
			const oiKey = `${side}_oi` as 'ce_oi' | 'pe_oi';
			const tokenKey = `${side}_token` as 'ce_token' | 'pe_token';

			const token = row[tokenKey];
			if (!token) continue;

			const previousLtp = row[ltpKey] ?? 0;
			const nextLtp = Math.max(
				0.05,
				Number((previousLtp + (nextRandom() - 0.5) * Math.max(previousLtp * 0.02, 0.2)).toFixed(2))
			);
			const nextOi = Math.max(0, Math.round((row[oiKey] ?? 0) + (nextRandom() - 0.5) * 4000));

			row[ltpKey] = nextLtp;
			row[oiKey] = nextOi;

			update[token] = { ltp: nextLtp, oi: nextOi };
		}

		onMessage(update as TFeedMessage);
	}

	return {
		requestIds() {
			const ids = SPECS.flatMap((spec) => spec.expiries.map((expiry) => chainId(spec, expiry)));
			queueMicrotask(() => onMessage({ type: 'ids_list', data: ids }));
		},

		subscribe(id: string) {
			stop();
			const found = specFor(id);
			if (!found) return;

			const chain = buildChain(found.spec, found.expiry);
			active = { spec: found.spec, expiry: found.expiry, chain };

			queueMicrotask(() => onMessage({ type: 'option_chain_initial', chain_id: id, data: chain }));
			timer = setInterval(tick, 250);
		},

		unsubscribe() {
			stop();
			active = null;
		},

		close() {
			stop();
			active = null;
		}
	};
}
