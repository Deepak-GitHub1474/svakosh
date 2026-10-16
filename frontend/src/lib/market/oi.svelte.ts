import { ChainSource } from './chain.svelte';
import { TodayBars } from './bars.svelte';
import { marketFeed, type TQuoteField } from './feed.svelte';
import { inBucket, OI_RANGE, type TBucket, type TSide, type TStrikeLeg } from './oi';
import { nearestIndex, windowAround } from './options';
import { withLive } from './series';

const OI_FIELDS: TQuoteField[] = ['ltp', 'oi', 'prev_oi'];

export class SymbolOI {
	readonly chain = new ChainSource();
	readonly bars = new TodayBars();
	expirySymbolic = $state('CURRENT_WEEK');
	#stop: (() => void) | undefined;

	readonly expiry = $derived(this.chain.view ? this.chain.expiry(this.expirySymbolic) : '');
	readonly strikes = $derived(this.expiry ? this.chain.strikes(this.expiry) : []);
	readonly hasSpot = $derived(this.chain.spot > 0);
	readonly atmIndex = $derived(nearestIndex(this.strikes, this.chain.spot));
	readonly window = $derived(
		this.hasSpot ? windowAround(this.strikes, this.atmIndex, OI_RANGE) : []
	);

	constructor(
		readonly underlying: string,
		readonly interval: number,
		readonly minutes = 0
	) {}

	start() {
		void this.chain.load(this.underlying);
		this.#stop = $effect.root(() => {
			$effect(() => this.refresh());
			$effect(() => {
				if (!this.chain.view) return;
				return marketFeed.subscribe([this.chain.view.spot]);
			});
			$effect(() => {
				if (this.window.length === 0) return;
				return marketFeed.subscribe(
					this.window.flatMap((s) => [this.token(s, 'CE'), this.token(s, 'PE')]),
					OI_FIELDS
				);
			});
		});
	}

	refresh() {
		if (!this.expiry) return;
		void this.bars.load(
			this.chain.subject,
			this.chain.optionPrefix(this.expiry),
			this.interval,
			this.minutes
		);
	}

	stop() {
		this.#stop?.();
		this.chain.stop();
		this.bars.stop();
	}

	token(strike: number, side: TSide): string {
		return this.chain.token(this.expiry, strike, side);
	}

	legs(side: TSide): TStrikeLeg[] {
		const atm = this.strikes[this.atmIndex];
		return this.window.map((strike) => {
			const token = this.token(strike, side);
			const quote = marketFeed.quotes[token];
			return {
				strike,
				offset: this.strikes.indexOf(strike) - this.strikes.indexOf(atm),
				series: withLive(this.bars.data[token], quote, this.interval),
				prevOi: quote?.prev_oi ?? 0
			};
		});
	}

	bucket(side: TSide, bucket: TBucket): TStrikeLeg[] {
		return this.legs(side).filter((leg) => inBucket(leg.offset, side, bucket));
	}
}

export function trackSymbols(interval: number, minutes = 0) {
	let sources: Record<string, SymbolOI> = {};
	return {
		sync(symbols: string[], expiry: string): SymbolOI[] {
			const next: Record<string, SymbolOI> = {};
			for (const symbol of symbols) {
				next[symbol] = sources[symbol] ?? new SymbolOI(symbol, interval, minutes);
				if (!sources[symbol]) next[symbol].start();
				next[symbol].expirySymbolic = expiry;
			}
			for (const [symbol, source] of Object.entries(sources)) if (!next[symbol]) source.stop();
			sources = next;
			return Object.values(next);
		},
		stop() {
			Object.values(sources).forEach((source) => source.stop());
			sources = {};
		}
	};
}
