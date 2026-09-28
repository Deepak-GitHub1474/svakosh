import type { TColumn, TViewMode } from './types';

export const DEFAULT_SYMBOL = 'NIFTY';
export const DEFAULT_STRIKE_RANGE = 10;
export const MIN_STRIKE_RANGE = 3;
export const MAX_STRIKE_RANGE = 60;
export const GREEKS_INTERVAL = 700;
export const TABLE_BOTTOM_GAP = 16;

export const PREFERRED_SYMBOL_ORDER = [
	'NIFTY',
	'BANKNIFTY',
	'FINNIFTY',
	'MIDCPNIFTY',
	'SENSEX',
	'BANKEX'
];

export const SEGMENT_SYMBOL: Record<string, string> = {
	'': 'NIFTY',
	BANK: 'BANKNIFTY',
	FIN: 'FINNIFTY',
	MIDCP: 'MIDCPNIFTY'
};

export const VIEW_TABS: { label: string; value: TViewMode }[] = [
	{ label: 'OI', value: 'OI' },
	{ label: 'Greeks', value: 'Greeks' }
];

export const OI_COLUMNS: TColumn[] = [
	{
		label: 'OI (L)',
		width: 20,
		align: 'left',
		hint: 'Open interest in lakhs, with its change since the previous close below'
	},
	{
		label: 'LTP',
		width: 20,
		align: 'right',
		hint: 'Last traded price, with its change since the previous close below'
	}
];

export const GREEK_COLUMNS: TColumn[] = [
	{
		label: 'Gamma',
		width: 6.2,
		align: 'right',
		hint: 'Rate at which delta changes for a 1 point move in the underlying'
	},
	{
		label: 'Vega',
		width: 6.2,
		align: 'right',
		hint: 'Change in option price for a 1% change in implied volatility'
	},
	{
		label: 'Theta',
		width: 6.2,
		align: 'right',
		hint: 'Value lost to time decay per day, all else unchanged'
	},
	{
		label: 'Delta',
		width: 6.2,
		align: 'right',
		hint: 'Change in option price for a 1 point move in the underlying'
	},
	{
		label: 'IV',
		width: 6.2,
		align: 'right',
		hint: 'Implied volatility back-solved from the traded price, annualised'
	},
	{ label: 'LTP', width: 14, align: 'right', hint: 'Last traded price of the option' }
];

export const STRIKE_COLUMN_WIDTH: Record<TViewMode, number> = {
	OI: 20,
	Greeks: 10
};
