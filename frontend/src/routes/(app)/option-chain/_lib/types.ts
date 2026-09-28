export type TViewMode = 'OI' | 'Greeks';

export interface TStrikeData {
	ce_token?: string;
	pe_token?: string;

	ce_ltp?: number;
	ce_volume?: number;
	ce_oi?: number;
	ce_prev_oi?: number;
	ce_prev_close?: number;
	ce_bid?: number;
	ce_ask?: number;

	pe_ltp?: number;
	pe_volume?: number;
	pe_oi?: number;
	pe_prev_oi?: number;
	pe_prev_close?: number;
	pe_bid?: number;
	pe_ask?: number;

	ce_iv?: number;
	ce_delta?: number;
	ce_gamma?: number;
	ce_theta?: number;
	ce_vega?: number;

	pe_iv?: number;
	pe_delta?: number;
	pe_gamma?: number;
	pe_theta?: number;
	pe_vega?: number;
}

export interface TChainData {
	spot: string;
	spot_ltp: number;
	spot_change: number;
	spot_change_pct: number;
	atm_strike: string;
	strike_difference: number;
	all_strikes: string[];
	options_data: Record<string, TStrikeData>;
	lot_size: number;
}

export interface TTokenTick {
	ltp?: number;
	volume?: number;
	oi?: number;
	bid?: number;
	ask?: number;
	prev_close?: number;
}

export interface TIdsListMessage {
	type: 'ids_list';
	data: string[];
}

export interface TInitialMessage {
	type: 'option_chain_initial';
	chain_id: string;
	data: TChainData;
}

export interface TMarketDataMessage extends Record<string, TTokenTick | string> {
	type: 'market_data';
}

export type TFeedMessage = TIdsListMessage | TInitialMessage | TMarketDataMessage;

export interface TChainId {
	id: string;
	exchange: string;
	symbol: string;
	expiry: string;
}

export interface TGreeksRow {
	strike: string;
	ce_iv: number;
	ce_delta: number;
	ce_gamma: number;
	ce_theta: number;
	ce_vega: number;
	pe_iv: number;
	pe_delta: number;
	pe_gamma: number;
	pe_theta: number;
	pe_vega: number;
}

export interface TOrderDraft {
	token: string;
	strike: string;
	side: 'CE' | 'PE';
	transaction: 'BUY' | 'SELL';
	orderType: 'Market' | 'Limit';
	product: 'MIS' | 'NRML';
	lots: number;
	price: number;
	lotSize: number;
}

export type TAlign = 'left' | 'right';

export interface TColumn {
	label: string;
	width: number;
	align: TAlign;
	hint: string;
}
