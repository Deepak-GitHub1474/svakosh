export type TGlimpseCategory = 'ATM' | 'OTM' | 'FOTM' | 'ITM';

export interface TMetricDetails {
	Writing: number;
	Unwinding: number;
	Net: number;
}

export interface TOISideGlimpse {
	ATM: TMetricDetails;
	OTM: TMetricDetails;
	FOTM: TMetricDetails;
	ITM: TMetricDetails;
}

export interface TGlimpseSymbolDetail {
	CE: TOISideGlimpse;
	PE: TOISideGlimpse;
	Overall: TOISideGlimpse;
}

export type TTimeFrame = '1 Min' | '3 Min' | '6 Min' | '9 Min' | '15 Min' | '30 Min';

export type TSymbolGlimpseData = Record<TTimeFrame, TGlimpseSymbolDetail>;

export type TFullGlimpseData = Record<string, Record<string, TSymbolGlimpseData>>;
