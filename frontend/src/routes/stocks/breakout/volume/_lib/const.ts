import type { TSortKey } from './types';

export const VOLUME_BREAKOUT_COLUMNS: { key: TSortKey; label: string; align?: 'left' | 'right' }[] = [
	{ key: 'timestamp', label: 'Time', align: 'left' },
	{ key: 'symbol', label: 'Stock', align: 'left' },
	{ key: 'criteria', label: 'Criteria', align: 'left' },
	{ key: 'breakout_price', label: 'Breakout Price', align: 'right' },
	{ key: 'ltp', label: 'LTP', align: 'right' },
	{ key: 'day_high', label: 'Day High', align: 'right' },
	{ key: 'change_wrt_high', label: 'Chg wrt High', align: 'right' },
	{ key: 'day_low', label: 'Day Low', align: 'right' },
	{ key: 'change_wrt_low', label: 'Chg wrt Low', align: 'right' }
];
