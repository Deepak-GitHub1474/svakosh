export type TSortDir = '' | 'desc' | 'asc';

export const nextSort = (dir: TSortDir): TSortDir =>
	dir === '' ? 'desc' : dir === 'desc' ? 'asc' : '';

export function sortBy<T>(
	rows: T[],
	dir: TSortDir,
	value: (row: T) => number | null | undefined
): T[] {
	if (!dir) return rows;
	const sign = dir === 'desc' ? -1 : 1;
	return [...rows].sort((a, b) => {
		const x = value(a);
		const y = value(b);
		if (x == null) return y == null ? 0 : 1;
		if (y == null) return -1;
		return sign * (x - y);
	});
}
