import type { TTrackerTimeframe, TTrackerCategory } from './types';

export const TRACKER_SYMBOLS = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

export const TRACKER_TIMEFRAMES: TTrackerTimeframe[] = ['3 Min', '6 Min', '9 Min', '15 Min', '30 Min', '60 Min', 'Day', 'Total OI'];

export const EXPIRIES = ['CURRENT_WEEK', 'NEXT_WEEK', 'NEXT_MONTH'];

export const TRACKER_CATEGORIES: TTrackerCategory[] = ['ATM', 'ITM', 'OTM', 'DITM', 'FOTM'];
