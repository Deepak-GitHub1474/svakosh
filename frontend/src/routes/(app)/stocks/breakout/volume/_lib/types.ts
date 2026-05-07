export interface TVolumeBreakout {
	id: string;
	timestamp: string;
	symbol: string;
	display_name: string;
	criteria: string;
	breakout_price: number;
	ltp: number;
	p_change: number;
	day_high: number;
	day_low: number;
	change_wrt_high: number;
	change_wrt_low: number;
}

export type TSortKey = keyof TVolumeBreakout;

export interface TSortConfig {
	key: TSortKey;
	direction: 'asc' | 'desc';
}

export interface TBreakoutFilters {
	search: string;
}
