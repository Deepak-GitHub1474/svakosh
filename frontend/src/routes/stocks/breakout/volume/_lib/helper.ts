import type { TVolumeBreakout, TSortConfig, TBreakoutFilters } from './types';

export function filterBreakouts(data: TVolumeBreakout[], filters: TBreakoutFilters): TVolumeBreakout[] {
	return data.filter((item) => {
		const searchMatch =
			filters.search === '' ||
			item.symbol.toLowerCase().includes(filters.search.toLowerCase()) ||
			item.display_name.toLowerCase().includes(filters.search.toLowerCase());

		return searchMatch;
	});
}

export function sortBreakouts(data: TVolumeBreakout[], config: TSortConfig): TVolumeBreakout[] {
	return [...data].sort((a, b) => {
		const valA = a[config.key];
		const valB = b[config.key];

		if (valA < valB) return config.direction === 'asc' ? -1 : 1;
		if (valA > valB) return config.direction === 'asc' ? 1 : -1;
		return 0;
	});
}
