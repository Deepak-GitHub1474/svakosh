export interface T52WeekBreakout {
	id: string;
	timestamp: string;
	symbol: string;
	display_name: string;
	type: 'High' | 'Low';
	breakout_price: number;
	ltp: number;
	p_change: number;
	new_extreme: number;
	change_identified: number;
}

export type TSortKey = keyof T52WeekBreakout;

export interface TSortConfig {
	key: TSortKey;
	direction: 'asc' | 'desc';
}

export interface TBreakoutFilters {
	search: string;
}
