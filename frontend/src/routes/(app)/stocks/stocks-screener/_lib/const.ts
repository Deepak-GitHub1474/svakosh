import type { TSortKey } from './types';

export const SCREENER_COLUMNS: { key: TSortKey; label: string; align?: 'left' | 'right' }[] = [
	{ key: 'symbol', label: 'Symbol', align: 'left' },
	{ key: 'ltp', label: 'LTP', align: 'right' },
	{ key: 'change', label: 'Change', align: 'right' },
	{ key: 'change_pct', label: 'Change %', align: 'right' },
	{ key: 'open', label: 'Open', align: 'right' },
	{ key: 'high', label: 'High', align: 'right' },
	{ key: 'low', label: 'Low', align: 'right' },
	{ key: 'prev_close', label: 'Previous Close', align: 'right' },
	{ key: 'volume', label: 'Volume', align: 'right' },
	{ key: 'avg_price', label: 'Average Price', align: 'right' },
	{ key: 'upper_circuit', label: 'Upper Circuit', align: 'right' },
	{ key: 'lower_circuit', label: 'Lower Circuit', align: 'right' }
];
