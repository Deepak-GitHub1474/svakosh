import { changeOf, type TQuote } from './feed.svelte';
import type { TBreadth, TStockItem } from './types';

export const TOP_MOVERS_LIMIT = 10;

export function breadthOf(stocks: TStockItem[], quotes: Record<string, TQuote>): TBreadth {
	let advances = 0;
	let declines = 0;
	let total = 0;
	for (const s of stocks) {
		const q = quotes[s.sk_token];
		if (!q?.ltp || !q.prev_close) continue;
		total++;
		if (q.ltp > q.prev_close) advances++;
		else if (q.ltp < q.prev_close) declines++;
	}
	return { advances, declines, unchanged: total - advances - declines, total };
}

export function moversOf(stocks: TStockItem[], quotes: Record<string, TQuote>) {
	const ranked = stocks
		.filter((s) => quotes[s.sk_token]?.ltp && quotes[s.sk_token]?.prev_close)
		.map((s) => ({ ...s, ltp: quotes[s.sk_token].ltp ?? 0, ...changeOf(quotes[s.sk_token]) }))
		.sort((a, b) => b.change_pct - a.change_pct);
	return {
		gainers: ranked.filter((s) => s.change_pct > 0).slice(0, TOP_MOVERS_LIMIT),
		losers: ranked
			.filter((s) => s.change_pct < 0)
			.reverse()
			.slice(0, TOP_MOVERS_LIMIT)
	};
}
