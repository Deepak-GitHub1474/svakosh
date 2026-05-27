import type { TLookupCategory, TLookupTimeframe } from './types';

export const LOOKUP_SYMBOLS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

export const LOOKUP_TIMEFRAMES: TLookupTimeframe[] = ['3 Min', '6 Min', '9 Min', '15 Min', '30 Min', '60 Min', 'Day', 'Total'];

export const EXPIRIES = ['CURRENT_WEEK', 'NEXT_WEEK', 'CURRENT_MONTH'];

export const LOOKUP_CATEGORIES: TLookupCategory[] = ['ATM', 'ITM', 'DITM-1', 'DITM-2', 'OTM', 'FOTM-1', 'FOTM-2'];

export const TABS = [
    { 
        label: 'Tables', 
        value: 'tables',
        svgPath: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z' 
    },
    { 
        label: 'Graphs', 
        value: 'graphs',
        svgPath: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM7 10l3 3 4-4 3 3' 
    }
];