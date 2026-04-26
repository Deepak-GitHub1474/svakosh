export const AIR_SYMBOLS = [
	{ label: 'NIFTY', value: 'NIFTY' },
	{ label: 'BANKNIFTY', value: 'BANKNIFTY' },
	{ label: 'FINNIFTY', value: 'FINNIFTY' },
	{ label: 'MIDCPNIFTY', value: 'MIDCPNIFTY' },
	{ label: 'SENSEX', value: 'SENSEX' },
	{ label: 'BANKEX', value: 'BANKEX' }
];

export const AIR_EXPIRIES = [
	{ label: 'Current Week', value: 'CURRENT_WEEK' },
	{ label: 'Next Week', value: 'NEXT_WEEK' },
	{ label: 'Next To Next Week', value: 'NEXT_TO_NEXT_WEEK' }
];

export const DEFAULT_SYMBOL = 'NIFTY';
export const DEFAULT_EXPIRY = 'CURRENT_WEEK';
export const DEFAULT_STRIKE_COUNT = 5;

export const STRIKE_DIFFERENCES: Record<string, number> = {
	NIFTY: 50,
	BANKNIFTY: 100,
	FINNIFTY: 50,
	MIDCPNIFTY: 25,
	BANKEX: 100,
	SENSEX: 100
};

export const chartTypeTabs = [
	{ label: 'Line', value: 'line', svgPath: 'M3.5,18.49L9.5,12.48L13.5,16.48L22,7.91L20.59,6.5L13.5,13.59L9.5,9.5L2,17.08L3.5,18.49Z' },
	{ label: 'Bar', value: 'bar', svgPath: 'M5,6h3v12H5V6zm5-2h3v14h-3V4zm5,6h3v8h-3v-8z' }
];
