export interface TMarketStatus {
	nse_equity: string;
	nse_fo: string;
	nse_currency: string;
	as_of: string;
}

export interface TIndexItem {
	sk_token: string;
	symbol: string;
	display_name: string;
}

export interface TStockItem {
	sk_token: string;
	symbol: string;
	name: string;
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
	stocks: TStockItem[];
	fii_dii: TFiiDiiItem[];
}

export interface TBreadth {
	advances: number;
	declines: number;
	unchanged: number;
	total: number;
}

export interface TCandle {
	ts: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface TChainRef {
	exchange: string;
	underlying: string;
	spot: string;
}

export interface TChainExpiry {
	date: string;
	lot_size: number;
	strikes: number[];
}

export interface TChainView {
	exchange: string;
	underlying: string;
	spot: string;
	expiries: TChainExpiry[];
}

export type TBar = [
	ts: number,
	open: number,
	high: number,
	low: number,
	close: number,
	volume: number,
	oi: number
];

export type TBars = Record<string, TBar[]>;
