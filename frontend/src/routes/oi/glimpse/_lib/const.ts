import type { TTimeFrame, TGlimpseCategory } from './types';

export const OI_SYMBOLS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

export const OI_TIMEFRAMES: TTimeFrame[] = ['1 Min', '3 Min', '6 Min', '9 Min', '15 Min', '30 Min'];

export const EXPIRIES = ['CURRENT_WEEK', 'NEXT_WEEK', 'CURRENT_MONTH'];

export const GLIMPSE_CATEGORIES: TGlimpseCategory[] = ['ATM', 'OTM', 'FOTM', 'ITM'];
