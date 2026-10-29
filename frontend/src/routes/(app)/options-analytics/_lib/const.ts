import type { TOptionUnderlying } from './types';

export const UNDERLYINGS: TOptionUnderlying[] = [
	{ symbol: 'NIFTY', exchange: 'NSE' },
	{ symbol: 'BANKNIFTY', exchange: 'NSE' },
	{ symbol: 'FINNIFTY', exchange: 'NSE' },
	{ symbol: 'MIDCPNIFTY', exchange: 'NSE' },
	{ symbol: 'SENSEX', exchange: 'BSE' },
	{ symbol: 'BANKEX', exchange: 'BSE' }
];

export const CE_BASE = 'rgba(255, 61, 0, 0.4)';
export const CE_ADDED = 'rgba(255, 61, 0, 0.95)';
export const CE_REMOVED = 'rgba(255, 61, 0, 0.15)';
export const PE_BASE = 'rgba(0, 255, 136, 0.35)';
export const PE_ADDED = 'rgba(0, 255, 136, 0.95)';
export const PE_REMOVED = 'rgba(0, 255, 136, 0.15)';
export const CE_DELTA_LINE = 'CE Change';
export const PE_DELTA_LINE = 'PE Change';
