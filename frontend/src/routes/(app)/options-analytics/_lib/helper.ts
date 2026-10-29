import type { TStrikeOIItem } from './types';

const LAKH = 100000;

export function calculateOiStats(strikes: TStrikeOIItem[]) {
	const byChange = [...strikes].sort(
		(a, b) => b.ce_oi_change + b.pe_oi_change - (a.ce_oi_change + a.pe_oi_change)
	);
	return {
		buildups: byChange.slice(0, 5),
		unwindings: byChange.slice(-5).reverse()
	};
}

export function oiStack(oi: number, change: number) {
	const added = change >= 0;
	return { base: (added ? oi - change : oi) / LAKH, delta: Math.abs(change) / LAKH, added };
}
