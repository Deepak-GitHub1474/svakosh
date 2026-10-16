import type { TStrikeOIItem } from './types';

export function calculateOiStats(strikes: TStrikeOIItem[]) {
	const byChange = [...strikes].sort(
		(a, b) => b.ce_oi_change + b.pe_oi_change - (a.ce_oi_change + a.pe_oi_change)
	);
	return {
		buildups: byChange.slice(0, 5),
		unwindings: byChange.slice(-5).reverse()
	};
}
