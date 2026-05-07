import type { T52WeekBreakout, TSortConfig, TBreakoutFilters } from './types';

export function filter52WeekBreakouts(data: T52WeekBreakout[], filters: TBreakoutFilters): T52WeekBreakout[] {
	return data.filter((item) => {
		const searchMatch =
			filters.search === '' ||
			item.symbol.toLowerCase().includes(filters.search.toLowerCase()) ||
			item.display_name.toLowerCase().includes(filters.search.toLowerCase());

		return searchMatch;
	});
}

export function sort52WeekBreakouts(data: T52WeekBreakout[], config: TSortConfig): T52WeekBreakout[] {
	return [...data].sort((a, b) => {
		const valA = a[config.key];
		const valB = b[config.key];

		if (valA < valB) return config.direction === 'asc' ? -1 : 1;
		if (valA > valB) return config.direction === 'asc' ? 1 : -1;
		return 0;
	});
}
