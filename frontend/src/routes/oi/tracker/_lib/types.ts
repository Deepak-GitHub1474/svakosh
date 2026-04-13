export type TTrackerTimeframe = '3 Min' | '6 Min' | '9 Min' | '15 Min' | '30 Min' | '60 Min' | 'Day' | 'Total OI';

export type TTrackerCategory = 'ATM' | 'ITM' | 'OTM' | 'DITM' | 'FOTM';

export interface TTrackerMetrics {
	[key: string]: number; // Maps timeframe to numeric value (in lakhs)
}

export interface TTrackerSymbolDetail {
	CE: Record<string, TTrackerMetrics>; // Maps strike/category to metrics
	PE: Record<string, TTrackerMetrics>;
}

export type TFullTrackerData = Record<string, Record<string, TTrackerSymbolDetail>>; // expiry -> symbol -> detail
