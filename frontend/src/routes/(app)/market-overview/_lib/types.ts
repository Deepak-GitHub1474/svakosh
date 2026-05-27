export interface TMarketStatus {
	nse_equity: string;
	nse_fo: string;
	nse_currency: string;
	as_of: string;
}

export interface TIndexItem {
	symbol: string;
	display_name: string;
	ltp: number;
	change: number;
	change_pct: number;
	prev_close: number;
	open: number;
	high: number;
	low: number;
}

export interface TBreadth {
	advances: number;
	declines: number;
	unchanged: number;
	total: number;
}

export interface TStockMovers {
	symbol: string;
	company_name: string;
	ltp: number;
	change: number;
	change_pct: number;
	volume: number;
	week_52_high: number;
	week_52_low: number;
	sector: string | null;
	cirrus_token: string;
	upper_circuit: number;
	lower_circuit: number;
}

export interface TFiiDiiItem {
	date: string;
	fii_buy_value: number;
	fii_sell_value: number;
	fii_net: number;
	dii_buy_value: number;
	dii_sell_value: number;
	dii_net: number;
}

export interface TMarketOverviewData {
	status: TMarketStatus;
	indices: TIndexItem[];
	breadth: TBreadth;
	top_gainers: TStockMovers[];
	top_losers: TStockMovers[];
	fii_dii: TFiiDiiItem[];
}
