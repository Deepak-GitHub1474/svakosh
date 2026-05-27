export interface TStrikeOIItem {
	strike: number;
	ce_oi: number;
	ce_oi_change: number;
	pe_oi: number;
	pe_oi_change: number;
}

export interface TOptionsAnalyticsData {
	symbol: string;
	expiry: string;
	expiries: string[];
	expiry_type: 'weekly' | 'monthly';
	spot_price: number;
	spot_token?: string;
	futures_price?: number;
	futures_token?: string;
	max_pain_strike: number;
	atm_strike: number;
	pcr: number;
	pcr_interpretation: string;
	total_ce_oi: number;
	total_pe_oi: number;
	lot_size?: number;
	strikes: TStrikeOIItem[];
}

export interface TOptionUnderlying {
	symbol: string;
	exchange: string;
}
