import type { TOptionsAnalyticsData, TOptionUnderlying } from './types';

export const UNDERLYINGS: TOptionUnderlying[] = [
	{ symbol: 'NIFTY', exchange: 'NSE' },
	{ symbol: 'BANKNIFTY', exchange: 'NSE' },
	{ symbol: 'FINNIFTY', exchange: 'NSE' },
	{ symbol: 'MIDCPNIFTY', exchange: 'NSE' },
	{ symbol: 'SENSEX', exchange: 'BSE' },
	{ symbol: 'BANKEX', exchange: 'BSE' }
];

export const MOCK_DATA: Record<string, TOptionsAnalyticsData> = {
	NIFTY: {
		symbol: 'NIFTY',
		expiry: '10-Apr-2026',
		expiries: ['10-Apr-2026', '17-Apr-2026', '24-Apr-2026', '30-Apr-2026'],
		expiry_type: 'weekly',
		spot_price: 23976.85,
		spot_token: 'NSE:IND:NIFTY50',
		futures_price: 24045.2,
		futures_token: 'NSE:FUT:NIFTY26APR',
		max_pain_strike: 24000,
		atm_strike: 24000,
		pcr: 1.12,
		pcr_interpretation: 'Bullish',
		total_ce_oi: 4582000,
		total_pe_oi: 5131840,
		lot_size: 50,
		strikes: generateStrikes(24000, 50, 20)
	},
	BANKNIFTY: {
		symbol: 'BANKNIFTY',
		expiry: '10-Apr-2026',
		expiries: ['10-Apr-2026', '16-Apr-2026', '23-Apr-2026', '30-Apr-2026'],
		expiry_type: 'weekly',
		spot_price: 55485.45,
		spot_token: 'NSE:IND:BANKNIFTY',
		futures_price: 55620.15,
		futures_token: 'NSE:FUT:BANKNIFTY26APR',
		max_pain_strike: 55500,
		atm_strike: 55500,
		pcr: 0.85,
		pcr_interpretation: 'Neutral',
		total_ce_oi: 12500000,
		total_pe_oi: 10625000,
		lot_size: 15,
		strikes: generateStrikes(55500, 100, 20)
	}
};

function generateStrikes(center: number, step: number, count: number) {
	const strikes = [];
	for (let i = -count; i <= count; i++) {
		const strike = center + i * step;
		const distance = Math.abs(i);
		const baseOI = Math.max(10000, 500000 * Math.exp(-(distance * distance) / 100));

		strikes.push({
			strike,
			ce_oi: Math.round(baseOI * (i > 0 ? 1.5 : 0.8)),
			ce_oi_change: Math.round((Math.random() - 0.3) * baseOI * 0.2),
			pe_oi: Math.round(baseOI * (i < 0 ? 1.5 : 0.8)),
			pe_oi_change: Math.round((Math.random() - 0.3) * baseOI * 0.2)
		});
	}
	return strikes;
}
