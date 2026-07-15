import type { TStrikeOIItem } from './types';
import { MOCK_DATA } from './mock-data';

export function getSymbolUpdate(s: string) {
	return {
		symbol: s,
		showSymbolDropdown: false,
		searchQuery: '',
		selectedExpiry: MOCK_DATA[s].expiry
	};
}

export function getExpiryUpdate(exp: string) {
	return {
		selectedExpiry: exp,
		showExpiryDropdown: false
	};
}

export function calculateOiStats(strikes: TStrikeOIItem[]) {
	const byChange = [...strikes].sort(
		(a, b) => b.ce_oi_change + b.pe_oi_change - (a.ce_oi_change + a.pe_oi_change)
	);
	return {
		buildups: byChange.slice(0, 5),
		unwindings: byChange.slice(-5).reverse()
	};
}

export function calculateActiveStrikes(strikes: TStrikeOIItem[], expiry: string) {
	let hash = 0;
	for (let i = 0; i < expiry.length; i++) {
		hash = (hash << 5) - hash + expiry.charCodeAt(i);
		hash |= 0;
	}
	const seed = Math.abs(hash);

	return strikes.map((s, i) => ({
		...s,
		ce_oi: s.ce_oi * (0.8 + ((i + seed) % 10) / 20),
		pe_oi: s.pe_oi * (0.8 + ((i + seed + 3) % 10) / 20),
		ce_oi_change: s.ce_oi_change * (0.8 + ((i + seed + 7) % 10) / 20),
		pe_oi_change: s.pe_oi_change * (0.8 + ((i + seed + 11) % 10) / 20)
	}));
}
