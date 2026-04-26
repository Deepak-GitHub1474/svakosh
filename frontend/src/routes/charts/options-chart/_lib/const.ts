import { chartTypeTabs as commonTabs } from '../../straddle/_lib/const';

export const OPTIONS_SYMBOLS = [
	{ label: 'NIFTY', value: 'NIFTY' },
	{ label: 'BANKNIFTY', value: 'BANKNIFTY' },
	{ label: 'FINNIFTY', value: 'FINNIFTY' },
	{ label: 'MIDCPNIFTY', value: 'MIDCPNIFTY' },
	{ label: 'SENSEX', value: 'SENSEX' },
	{ label: 'BANKEX', value: 'BANKEX' }
];

export const OPTIONS_EXPIRIES = [
	{ label: 'Current Week', value: 'CURRENT_WEEK' },
	{ label: 'Next Week', value: 'NEXT_WEEK' },
	{ label: 'Next To Next Week', value: 'NEXT_TO_NEXT_WEEK' }
];

export const OPTION_METRICS = [
	{ label: 'OI', value: 'OI' },
	{ label: 'LTP', value: 'LTP' },
	{ label: 'Volume', value: 'Volume' },
	{ label: 'ATP', value: 'ATP' },
	{ label: 'LTP Change', value: 'LTP Change' },
	{ label: 'Open', value: 'Open' },
	{ label: 'High', value: 'High' },
	{ label: 'Low', value: 'Low' },
	{ label: 'Close', value: 'Close' }
];

export const DEFAULT_SYMBOL = 'NIFTY';
export const DEFAULT_EXPIRY = 'CURRENT_WEEK';
export const DEFAULT_METRIC_ONE = 'OI';
export const DEFAULT_METRIC_TWO = 'LTP';

export const STRIKE_DIFFERENCES: Record<string, number> = {
	NIFTY: 50,
	BANKNIFTY: 100,
	FINNIFTY: 50,
	MIDCPNIFTY: 25,
	BANKEX: 100,
	SENSEX: 100
};

export const chartTypeTabs = commonTabs;
