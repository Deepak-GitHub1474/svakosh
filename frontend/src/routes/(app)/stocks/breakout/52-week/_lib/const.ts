import type { TSortKey } from './types';

export const WEEK52_BREAKOUT_COLUMNS: { key: TSortKey; label: string; align?: 'left' | 'right' }[] = [
	{ key: 'timestamp', label: 'Time', align: 'left' },
	{ key: 'symbol', label: 'Stock', align: 'left' },
	{ key: 'type', label: '52 Week', align: 'left' },
	{ key: 'breakout_price', label: 'Breakout Price', align: 'right' },
	{ key: 'ltp', label: 'LTP', align: 'right' },
	{ key: 'new_extreme', label: 'New High/Low', align: 'right' },
	{ key: 'change_identified', label: 'Change Identified', align: 'right' }
];
