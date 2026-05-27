export type TLookupCategory = 'ATM' | 'ITM' | 'DITM-1' | 'DITM-2'| 'OTM' | 'FOTM-1' | 'FOTM-2';

export type TLookupTimeframe = '3 Min' | '6 Min' | '9 Min' | '15 Min' | '30 Min' | '60 Min' | 'Day' | 'Total';

export type TCategoryMetrics = Record<TLookupTimeframe, number>;

export interface TOISideLookup {
	[category: string]: TCategoryMetrics;
}

export interface TSymbolLookupDetail {
	CE: TOISideLookup;
	PE: TOISideLookup;
}

export interface TChartPoint {
	timestamp: string;
	value: number;
}

export interface TGraphData {
	CE: Record<string, Record<string, number>>;
	PE: Record<string, Record<string, number>>;
}

export type TFullLookupData = Record<string, Record<string, TSymbolLookupDetail>>;
