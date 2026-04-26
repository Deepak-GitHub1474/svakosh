export const STRANGLE_SYMBOLS = [
	{ label: 'NIFTY', value: 'NIFTY' },
	{ label: 'BANKNIFTY', value: 'BANKNIFTY' },
	{ label: 'FINNIFTY', value: 'FINNIFTY' },
	{ label: 'MIDCPNIFTY', value: 'MIDCPNIFTY' },
	{ label: 'SENSEX', value: 'SENSEX' },
	{ label: 'BANKEX', value: 'BANKEX' }
];

export const STRANGLE_EXPIRIES = [
	{ label: 'Current Week', value: 'CURRENT_WEEK' },
	{ label: 'Next Week', value: 'NEXT_WEEK' },
	{ label: 'Next To Next Week', value: 'NEXT_TO_NEXT_WEEK' }
];

export const DEFAULT_SYMBOL = 'NIFTY';
export const DEFAULT_EXPIRY = 'CURRENT_WEEK';

export const STRIKE_DIFFERENCES: Record<string, number> = {
	NIFTY: 50,
	BANKNIFTY: 100,
	FINNIFTY: 50,
	MIDCPNIFTY: 25,
	BANKEX: 100,
	SENSEX: 100
};
