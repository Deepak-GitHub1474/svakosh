import type { TStock, TSortConfig, TScreenerFilters } from './types';

export function filterStocks(stocks: TStock[], filters: TScreenerFilters): TStock[] {
	return stocks.filter((stock) => {
		const searchMatch =
			filters.search === '' ||
			stock.symbol.toLowerCase().includes(filters.search.toLowerCase()) ||
			stock.display_name.toLowerCase().includes(filters.search.toLowerCase());

		return searchMatch;
	});
}

export function sortStocks(stocks: TStock[], config: TSortConfig): TStock[] {
	return [...stocks].sort((a, b) => {
		const valA = a[config.key];
		const valB = b[config.key];

		if (valA === null) return 1;
		if (valB === null) return -1;

		if (valA < valB) return config.direction === 'asc' ? -1 : 1;
		if (valA > valB) return config.direction === 'asc' ? 1 : -1;
		return 0;
	});
}

