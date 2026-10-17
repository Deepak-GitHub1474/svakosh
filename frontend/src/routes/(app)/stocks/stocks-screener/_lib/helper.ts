import { changeOf, type TQuote, type TQuoteField } from '$lib/market/feed.svelte';
import type { TStockItem } from '$lib/market/types';
import type { TSortConfig, TSortKey, TStock } from './types';

const QUOTE_FIELD: Partial<Record<TSortKey, TQuoteField>> = { avg_price: 'atp' };

export function toStock(item: TStockItem, quote: TQuote = {}): TStock {
	return {
		symbol: item.symbol,
		display_name: item.name,
		ltp: quote.ltp ?? 0,
		...changeOf(quote),
		open: quote.open ?? 0,
		high: quote.high ?? 0,
		low: quote.low ?? 0,
		prev_close: quote.prev_close ?? 0,
		volume: quote.volume ?? 0,
		avg_price: quote.atp ?? 0,
		upper_circuit: quote.upper_circuit ?? 0,
		lower_circuit: quote.lower_circuit ?? 0
	};
}

function sortValue(item: TStockItem, key: TSortKey, quote: TQuote = {}): number | string {
	if (key === 'symbol') return item.symbol;
	if (key === 'display_name') return item.name;
	if (key === 'change' || key === 'change_pct') return changeOf(quote)[key];
	return quote[QUOTE_FIELD[key] ?? (key as TQuoteField)] ?? 0;
}

export function filterStocks(items: TStockItem[], search: string): TStockItem[] {
	const q = search.trim().toLowerCase();
	if (!q) return items;
	return items.filter(
		(i) => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
	);
}

export function sortStocks(
	items: TStockItem[],
	quotes: Record<string, TQuote>,
	config: TSortConfig
): TStockItem[] {
	const sign = config.direction === 'asc' ? 1 : -1;
	return [...items].sort((a, b) => {
		const x = sortValue(a, config.key, quotes[a.sk_token]);
		const y = sortValue(b, config.key, quotes[b.sk_token]);
		return x < y ? -sign : x > y ? sign : 0;
	});
}
