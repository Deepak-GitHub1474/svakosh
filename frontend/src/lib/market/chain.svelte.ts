import { marketFeed } from './feed.svelte';
import { getChain } from './service';
import { isMonthly } from './options';
import { optionToken } from './token';
import type { TChainView } from './types';

const EXPIRY_INDEX: Record<string, number> = {
	CURRENT_WEEK: 0,
	NEXT_WEEK: 1,
	NEXT_TO_NEXT_WEEK: 2,
	FAR_WEEK: 2
};
const BSE_UNDERLYINGS = new Set(['SENSEX', 'BANKEX', 'SENSEX50']);

export function exchangeOf(underlying: string): string {
	return BSE_UNDERLYINGS.has(underlying) ? 'BFO' : 'NFO';
}

export class ChainSource {
	view = $state<TChainView | null>(null);
	#request = 0;

	async load(underlying: string): Promise<void> {
		const id = ++this.#request;
		const res = await getChain(exchangeOf(underlying), underlying);
		if (id === this.#request) this.view = res.ok ? res.data : null;
	}

	stop() {
		this.#request++;
	}

	expiry(symbolic: string): string {
		const dates = this.view?.expiries.map((entry) => entry.date) ?? [];
		if (symbolic === 'CURRENT_MONTH' || symbolic === 'NEXT_MONTH') {
			const monthly = dates.filter((date) => isMonthly(date, dates));
			return monthly[symbolic === 'NEXT_MONTH' ? 1 : 0] ?? monthly[0] ?? '';
		}
		return dates[Math.min(EXPIRY_INDEX[symbolic] ?? 0, dates.length - 1)] ?? '';
	}

	strikes(expiry: string): number[] {
		return this.view?.expiries.find((entry) => entry.date === expiry)?.strikes ?? [];
	}

	lotSize(expiry: string): number {
		return this.view?.expiries.find((entry) => entry.date === expiry)?.lot_size ?? 0;
	}

	get spot(): number {
		return this.view ? (marketFeed.quotes[this.view.spot]?.ltp ?? 0) : 0;
	}

	token(expiry: string, strike: number, type: 'CE' | 'PE'): string {
		return this.view
			? optionToken(this.view.exchange, this.view.underlying, expiry, strike, type)
			: '';
	}

	get subject(): string {
		return this.view ? `${this.view.exchange}.${this.view.underlying}` : '';
	}

	optionPrefix(expiry: string): string {
		return this.view
			? `${this.view.exchange}:OPT:${this.view.underlying}:${expiry.replaceAll('-', '')}:`
			: '';
	}
}
