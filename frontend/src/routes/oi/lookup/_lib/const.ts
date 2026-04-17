import type { TLookupCategory, TLookupTimeframe } from './types';

export const LOOKUP_SYMBOLS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

export const LOOKUP_TIMEFRAMES: TLookupTimeframe[] = ['3 Min', '6 Min', '9 Min', '15 Min', '30 Min', '60 Min', 'Day', 'Total'];

export const EXPIRIES = ['CURRENT_WEEK', 'NEXT_WEEK', 'CURRENT_MONTH'];

export const LOOKUP_CATEGORIES: TLookupCategory[] = ['ATM', 'ITM', 'DITM-1', 'DITM-2', 'OTM', 'FOTM-1', 'FOTM-2'];
