import type { TMarketOverviewData } from './types';

export const MARKET_DATA: { success: boolean; message: string; data: TMarketOverviewData } = {
	success: true,
	message: 'Market overview fetched',
	data: {
		status: {
			nse_equity: 'Open',
			nse_fo: 'Open',
			nse_currency: 'Open',
			as_of: '2026-04-08T10:58:24.762539+05:30'
		},
		indices: [
			{
				symbol: 'NIFTY',
				display_name: 'Nifty 50',
				ltp: 23976.85,
				change: 1008.6,
				change_pct: 4.39,
				prev_close: 22968.25,
				open: 22838.7,
				high: 23981.55,
				low: 22719.3
			},
			{
				symbol: 'BANKNIFTY',
				display_name: 'Nifty Bank',
				ltp: 55485.45,
				change: 2876.35,
				change_pct: 5.47,
				prev_close: 52609.1,
				open: 54904.45,
				high: 55504.15,
				low: 54797.5
			},
			{
				symbol: 'MIDCPNIFTY',
				display_name: 'Nifty Midcap Select',
				ltp: 13194.2,
				change: 610.9,
				change_pct: 4.85,
				prev_close: 12583.3,
				open: 13065.15,
				high: 13197,
				low: 13019
			},
			{
				symbol: 'FINNIFTY',
				display_name: 'Nifty Fin Service',
				ltp: 26033.8,
				change: 1430.7,
				change_pct: 5.82,
				prev_close: 24603.1,
				open: 25688.65,
				high: 26038.55,
				low: 25623.9
			},
			{
				symbol: 'NIFTYNXT50',
				display_name: 'Nifty Next 50',
				ltp: 66067.35,
				change: 3208.4,
				change_pct: 5.1,
				prev_close: 62858.95,
				open: 65491.35,
				high: 66136.4,
				low: 65295.05
			},
			{
				symbol: 'SENSEX',
				display_name: 'S&P BSE Sensex',
				ltp: 77503.34,
				change: 3396.49,
				change_pct: 4.58,
				prev_close: 74106.85,
				open: 77290.63,
				high: 77512.43,
				low: 77042.15
			},
			{
				symbol: 'BANKEX',
				display_name: 'S&P BSE Bankex',
				ltp: 62458.47,
				change: 3274.22,
				change_pct: 5.53,
				prev_close: 59184.25,
				open: 61921.82,
				high: 62469.37,
				low: 61680.62
			},
			{
				symbol: 'SENSEX50',
				display_name: 'S&P BSE Sensex50',
				ltp: 25064.2,
				change: 1055.05,
				change_pct: 4.39,
				prev_close: 24009.15,
				open: 24999.54,
				high: 25067.03,
				low: 24916.61
			}
		],
		breadth: {
			advances: 41,
			declines: 8,
			unchanged: 0,
			total: 49
		},
		top_gainers: [
			{
				symbol: 'SHRIRAMFIN',
				company_name: 'SHRIRAMFIN',
				ltp: 1023.7,
				change: 93.05,
				change_pct: 10,
				volume: 7981816,
				week_52_high: 1108,
				week_52_low: 566.5,
				sector: null,
				cirrus_token: 'CT:1:2:SHRIRAMFIN-EQ',
				upper_circuit: 1020.8,
				lower_circuit: 835.2
			},
			{
				symbol: 'ADANIENT',
				company_name: 'ADANIENT',
				ltp: 2057.5,
				change: 175.4,
				change_pct: 9.32,
				volume: 2558078,
				week_52_high: 2616.5,
				week_52_low: 1967.52,
				sector: null,
				cirrus_token: 'CT:1:2:ADANIENT-EQ',
				upper_circuit: 2092.4,
				lower_circuit: 1712
			},
			{
				symbol: 'ULTRACEMCO',
				company_name: 'ULTRACEMCO',
				ltp: 11750,
				change: 814,
				change_pct: 7.44,
				volume: 266971,
				week_52_high: 13110,
				week_52_low: 10325,
				sector: null,
				cirrus_token: 'CT:1:2:ULTRACEMCO-EQ',
				upper_circuit: 12050,
				lower_circuit: 9860
			},
			{
				symbol: 'BAJFINANCE',
				company_name: 'BAJFINANCE',
				ltp: 916.35,
				change: 61.25,
				change_pct: 7.16,
				volume: 5885355,
				week_52_high: 1102.5,
				week_52_low: 802.5,
				sector: null,
				cirrus_token: 'CT:1:2:BAJFINANCE-EQ',
				upper_circuit: 935.9,
				lower_circuit: 765.8
			},
			{
				symbol: 'M&M',
				company_name: 'M&M',
				ltp: 3221.6,
				change: 215,
				change_pct: 7.15,
				volume: 2249565,
				week_52_high: 3839.9,
				week_52_low: 2425,
				sector: null,
				cirrus_token: 'CT:1:2:M&M-EQ',
				upper_circuit: 3345.4,
				lower_circuit: 2737.2
			}
		],
		top_losers: [
			{
				symbol: 'ONGC',
				company_name: 'ONGC',
				ltp: 278.55,
				change: -8.1,
				change_pct: -2.83,
				volume: 23283714,
				week_52_high: 293,
				week_52_low: 205,
				sector: null,
				cirrus_token: 'CT:1:2:ONGC-EQ',
				upper_circuit: 310,
				lower_circuit: 253.7
			},
			{
				symbol: 'COALINDIA',
				company_name: 'COALINDIA',
				ltp: 450,
				change: -13,
				change_pct: -2.81,
				volume: 9039795,
				week_52_high: 476,
				week_52_low: 356,
				sector: null,
				cirrus_token: 'CT:1:2:COALINDIA-EQ',
				upper_circuit: 505.5,
				lower_circuit: 413.6
			},
			{
				symbol: 'SUNPHARMA',
				company_name: 'SUNPHARMA',
				ltp: 1694,
				change: -24,
				change_pct: -1.4,
				volume: 1352932,
				week_52_high: 1851.2,
				week_52_low: 1548,
				sector: null,
				cirrus_token: 'CT:1:2:SUNPHARMA-EQ',
				upper_circuit: 1864,
				lower_circuit: 1525.2
			},
			{
				symbol: 'TECHM',
				company_name: 'TECHM',
				ltp: 1455.7,
				change: -17.7,
				change_pct: -1.2,
				volume: 1033187,
				week_52_high: 1854,
				week_52_low: 1209.4,
				sector: null,
				cirrus_token: 'CT:1:2:TECHM-EQ',
				upper_circuit: 1594.4,
				lower_circuit: 1304.6
			},
			{
				symbol: 'DRREDDY',
				company_name: 'DRREDDY',
				ltp: 1190.5,
				change: -5.6,
				change_pct: -0.47,
				volume: 613670,
				week_52_high: 1379.7,
				week_52_low: 1020,
				sector: null,
				cirrus_token: 'CT:1:2:DRREDDY-EQ',
				upper_circuit: 1339.5,
				lower_circuit: 1096.1
			}
		],
		fii_dii: [
			{
				date: '07-Apr-2026',
				fii_buy_value: 7953.46,
				fii_sell_value: 16645.57,
				fii_net: -8692.11,
				dii_buy_value: 20860.09,
				dii_sell_value: 12880.59,
				dii_net: 7979.5
			}
		]
	}
};
