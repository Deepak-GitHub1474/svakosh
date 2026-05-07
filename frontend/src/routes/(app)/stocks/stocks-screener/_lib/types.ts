export interface TStock {
	symbol: string;
	display_name: string;
	ltp: number;
	change: number;
	change_pct: number;
	open: number;
	high: number;
	low: number;
	prev_close: number;
	volume: number;
	avg_price: number;
	upper_circuit: number;
	lower_circuit: number;
}

export type TSortKey = keyof TStock;

export interface TSortConfig {
	key: TSortKey;
	direction: 'asc' | 'desc';
}

export interface TScreenerFilters {
	search: string;
	sector: string;
	marketCapLevel: string;
}
