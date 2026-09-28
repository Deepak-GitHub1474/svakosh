export const ICONS = {
	layers:
		'M12 3 2 8.5 12 14l10-5.5L12 3zM4.24 11.3 2 12.5 12 18l10-5.5-2.24-1.2L12 15.6l-7.76-4.3zm0 4L2 16.5 12 22l10-5.5-2.24-1.2L12 19.6l-7.76-4.3z',
	scale:
		'M12 2v2.2L6.4 6 3 15h1a4 4 0 0 0 8 0h1L8.6 6.6 12 5.4l3.4 1.2L11 15h1a4 4 0 0 0 8 0h1l-3.4-9L12 4.2V2h-2zm-6 7.6L8.1 15H3.9L6 9.6zm12 0L20.1 15h-4.2L18 9.6zM7 19h10v2H7v-2z',
	target:
		'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
	waves:
		'M4 15.5c1.6 0 2.4-1 4-1s2.4 1 4 1 2.4-1 4-1 2.4 1 4 1V18c-1.6 0-2.4-1-4-1s-2.4 1-4 1-2.4-1-4-1-2.4 1-4 1v-2.5zm0-5c1.6 0 2.4-1 4-1s2.4 1 4 1 2.4-1 4-1 2.4 1 4 1V13c-1.6 0-2.4-1-4-1s-2.4 1-4 1-2.4-1-4-1-2.4 1-4 1v-2.5zm0-5c1.6 0 2.4-1 4-1s2.4 1 4 1 2.4-1 4-1 2.4 1 4 1V8c-1.6 0-2.4-1-4-1s-2.4 1-4 1-2.4-1-4-1-2.4 1-4 1V5.5z',
	decay: 'M3 3v18h18v-2H5V3H3zm16.3 2.3-5.6 5.6-3-3L7 12.6 8.4 14l3.3-3.3 3 3 7-7-1.4-1.4z',
	screen:
		'M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zM3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zm16 0h2v6h-6v-2h4v-4z',
	pulse: 'M3 12h3.5l2-6 4 12 2.5-6H21v2h-4.8l-3.4 8.2L8.9 10 7.6 14H3v-2z',
	grid: 'M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z',
	key: 'M12.6 10A6 6 0 1 0 7 15.9V18h2v2h2v2h4v-3.6l-1.5-1.5 1.5-1.5-1.4-1.4L12.6 10zM6 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z',
	shield:
		'M12 1 3 5v6c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V5l-9-4zm-2 16-4-4 1.4-1.4L10 14.2l6.6-6.6L18 9l-8 8z',
	phone: 'M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm0 18H7V5h10v14z',
	clock:
		'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z',
	bookmark: 'M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2zm0 15-5-2.2L7 18V5h10v13z',
	arrow: 'M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8-8-8z',
	check: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z',
	chevron: 'M12 15.5 5.5 9 7 7.6l5 5 5-5L18.5 9 12 15.5z'
} as const;

export const NAV = [
	{ label: 'Modules', id: 'modules' },
	{ label: 'Analytics', id: 'analytics' },
	{ label: 'Workflow', id: 'workflow' },
	{ label: 'Security', id: 'security' }
];

export const HERO = {
	title: ['Read the option chain', 'before the move'],
	body: 'SvaKosh is a market analytics desk for Indian indices and derivatives. Open interest, max pain, straddle decay and breakout screeners — seventeen modules in one workspace.',
	primary: { label: 'Launch platform', href: '/auth/signin' },
	secondary: { label: 'See the modules', href: '#modules' }
};

export const STATS = [
	{ value: '17', label: 'Analytics modules in the desk', icon: ICONS.grid },
	{ value: '6', label: 'Index chains covered', icon: ICONS.layers },
	{ value: '3', label: 'Expiries out on every chain', icon: ICONS.clock }
];

export const TICKERS = [
	{ symbol: 'NIFTY', price: '24,836.40', change: 0.62 },
	{ symbol: 'BANKNIFTY', price: '54,120.85', change: 0.94 },
	{ symbol: 'FINNIFTY', price: '25,704.15', change: -0.18 },
	{ symbol: 'MIDCPNIFTY', price: '13,288.60', change: 1.24 },
	{ symbol: 'SENSEX', price: '81,402.70', change: 0.48 },
	{ symbol: 'BANKEX', price: '61,955.30', change: -0.31 },
	{ symbol: 'RELIANCE', price: '2,946.20', change: 0.73 },
	{ symbol: 'HDFCBANK', price: '1,718.65', change: 1.92 },
	{ symbol: 'TCS', price: '4,118.90', change: -0.42 },
	{ symbol: 'INFY', price: '1,904.10', change: -0.74 },
	{ symbol: 'ICICIBANK', price: '1,276.35', change: 1.15 },
	{ symbol: 'SBIN', price: '842.55', change: 2.46 },
	{ symbol: 'TATAMOTORS', price: '1,042.30', change: 3.84 },
	{ symbol: 'BHARTIARTL', price: '1,632.75', change: -0.26 }
];

export const MODULES = {
	title: 'Four screens you will keep open all session',
	body: 'Positioning, pressure and price — the reads you keep going back to, each on its own screen.',
	items: [
		{ id: 'options', label: 'Options Analytics' },
		{ id: 'tracker', label: 'OI Tracker' },
		{ id: 'breakout', label: '52-Week Breakout' },
		{ id: 'market', label: 'Market Intelligence' }
	]
};

export const OPTIONS = {
	symbol: 'NIFTY',
	expiry: '10-Apr-2026',
	maxPain: 24000,
	stats: [
		{ label: 'Spot price', value: '24,022.98', note: '', tone: '', icon: ICONS.target },
		{ label: 'Max pain', value: '24,000.00', note: '', tone: 'primary', icon: ICONS.pulse },
		{ label: 'PCR', value: '1', note: '(Bullish)', tone: 'down', icon: ICONS.scale },
		{ label: 'ATM strike', value: '24,000.00', note: '', tone: '', icon: ICONS.layers },
		{ label: 'Total CE OI', value: '99.89L', note: '', tone: 'down', icon: ICONS.decay },
		{ label: 'Total PE OI', value: '99.65L', note: '', tone: 'up', icon: ICONS.waves }
	],
	strikes: [
		{ strike: 23600, ce: 2.1, pe: 4.4, ceC: -0.3, peC: 0.3 },
		{ strike: 23650, ce: 2.5, pe: 5.4, ceC: -0.2, peC: 0.2 },
		{ strike: 23700, ce: 3.0, pe: 6.3, ceC: -0.1, peC: 0.4 },
		{ strike: 23750, ce: 3.5, pe: 4.6, ceC: 0.1, peC: 0.5 },
		{ strike: 23800, ce: 4.0, pe: 5.3, ceC: 0.2, peC: 0.6 },
		{ strike: 23850, ce: 4.5, pe: 6.1, ceC: -0.4, peC: 0.3 },
		{ strike: 23900, ce: 3.0, pe: 6.7, ceC: -0.6, peC: -0.2 },
		{ strike: 23950, ce: 3.3, pe: 7.3, ceC: -0.3, peC: -0.3 },
		{ strike: 24000, ce: 3.5, pe: 4.2, ceC: 0.6, peC: 0.2 },
		{ strike: 24050, ce: 6.9, pe: 4.3, ceC: 0.3, peC: 0.5 },
		{ strike: 24100, ce: 7.1, pe: 4.4, ceC: 0.1, peC: 0.6 },
		{ strike: 24150, ce: 7.1, pe: 4.4, ceC: 0.2, peC: 0.4 },
		{ strike: 24200, ce: 6.9, pe: 4.2, ceC: 0.4, peC: 0.2 },
		{ strike: 24250, ce: 6.6, pe: 2.5, ceC: 0.5, peC: 0.6 },
		{ strike: 24300, ce: 6.2, pe: 2.3, ceC: 0.2, peC: 0.4 },
		{ strike: 24350, ce: 5.7, pe: 2.2, ceC: 0.1, peC: 0.2 },
		{ strike: 24400, ce: 3.1, pe: 1.9, ceC: 0.2, peC: 0.1 }
	],
	buildup: [
		{ strike: '24,300.00', ce: 0.43, pe: 0.3, net: 0.73 },
		{ strike: '24,400.00', ce: 0.2, pe: 0.27, net: 0.47 },
		{ strike: '24,100.00', ce: -0.13, pe: 0.54, net: 0.4 },
		{ strike: '23,800.00', ce: -0.06, pe: 0.43, net: 0.37 }
	],
	unwinding: [
		{ strike: '23,900.00', ce: -0.3, pe: 0.05, net: -0.25 },
		{ strike: '24,450.00', ce: -0.06, pe: -0.08, net: -0.14 },
		{ strike: '23,350.00', ce: 0.0, pe: -0.04, net: -0.04 },
		{ strike: '24,900.00', ce: -0.01, pe: -0.01, net: -0.02 }
	]
};

export const TRACKER = {
	expiry: 'Current week',
	selected: '3 Selected',
	cols: ['3 Min', '6 Min', '9 Min', '15 Min', '30 Min', 'Day', 'Total OI'],
	pcr: '0.00',
	nifty: {
		symbol: 'NIFTY',
		call: [
			{ cat: 'ATM', v: [2.6, 14.06, -23.28, 37.26, 19.97, -14.27, -2.13] },
			{ cat: 'ITM', v: [-17.86, -12.57, 8.32, -7.89, 25.27, 32.64, 9.59] },
			{ cat: 'OTM', v: [14.24, -19.19, 16.11, 12.61, 36.97, 44.56, 11.21] },
			{ cat: 'DITM', v: [43.94, 2.79, 30.73, -11.03, 19.1, 1.31, 0.59] },
			{ cat: 'FOTM', v: [36.68, -4.24, 39.66, -21.41, -9.68, -6.18, 14.23] },
			{ cat: 'TOTAL', v: [79.6, -19.15, 71.54, 9.54, 91.63, 58.06, 33.49] }
		],
		put: [
			{ cat: 'ATM', v: [-10.97, -1.47, 30.51, -26.05, 25.69, 34.35, -5.73] },
			{ cat: 'ITM', v: [-15.39, 43.59, 3.71, -28.89, -26.43, -16.04, 43.44] },
			{ cat: 'OTM', v: [-17.28, -29.26, 3.91, 39.95, 34.22, 11.69, 11.13] },
			{ cat: 'DITM', v: [28.93, 9.46, -25.31, 3.75, 34.49, -26.38, -3.86] },
			{ cat: 'FOTM', v: [35.63, 5.12, -15.44, -18.2, 23.49, 23.41, -9.72] },
			{ cat: 'TOTAL', v: [20.92, 27.44, -2.62, -29.44, 91.46, 27.03, 35.26] }
		]
	},
	banknifty: {
		symbol: 'BANKNIFTY',
		call: [
			{ cat: 'ATM', v: [48.44, 31.39, 31.95, 42.79, 39.41, -8.43, -6.63] },
			{ cat: 'ITM', v: [16.97, 11.23, -27.2, 11.05, -19.53, 1.05, 42.44] },
			{ cat: 'OTM', v: [-15.19, -9.89, 1.75, 20.15, -0.92, -12.48, 3.42] },
			{ cat: 'DITM', v: [45.96, -32.98, -7.72, -8.1, 35.53, 1.86, 34.46] },
			{ cat: 'FOTM', v: [-14.88, 40.54, 2.97, 11.85, -16.47, 42.36, -28.34] },
			{ cat: 'TOTAL', v: [81.3, 40.29, 1.75, 77.74, 38.02, 24.36, 45.35] }
		],
		put: [
			{ cat: 'ATM', v: [18.85, -4.41, -1.64, 43.08, 31.95, -26.17, -11.17] },
			{ cat: 'ITM', v: [-22.3, -19.43, 5.5, 32.37, 24.47, -23.12, -16.84] },
			{ cat: 'OTM', v: [1.03, -2.23, 45.19, 27.43, -17.34, 31.97, 26.62] },
			{ cat: 'DITM', v: [-23.8, -30.61, 11.47, 1.21, -2.84, 14.85, 6.37] },
			{ cat: 'FOTM', v: [22.16, -15.94, 10.83, 30.85, 30.23, 15.17, 28.33] },
			{ cat: 'TOTAL', v: [-4.06, -72.62, 71.35, 134.94, 66.47, 12.7, 33.31] }
		]
	}
};

export const BREAKOUT = {
	stats: [
		{ label: 'Total breakouts', value: '10', tone: '', icon: ICONS.grid },
		{ label: 'New highs', value: '8', tone: 'up', icon: ICONS.decay },
		{ label: 'New lows', value: '2', tone: 'down', icon: ICONS.waves }
	],
	rows: [
		{
			time: '14:22:15',
			symbol: 'ADANIENT',
			name: 'ADANI ENTERPRISES',
			high: true,
			breakout: '3,180.00',
			ltp: '3,213.04',
			pct: 4.04,
			level: '3,220.00',
			identified: 1.26
		},
		{
			time: '14:15:00',
			symbol: 'TATASTEEL',
			name: 'TATA STEEL',
			high: true,
			breakout: '145.20',
			ltp: '148.77',
			pct: 0.87,
			level: '147.00',
			identified: 1.24
		},
		{
			time: '13:55:42',
			symbol: 'HDFCBANK',
			name: 'HDFC BANK',
			high: false,
			breakout: '1,540.00',
			ltp: '1,528.89',
			pct: -1.79,
			level: '1,528.00',
			identified: -0.82
		},
		{
			time: '13:40:10',
			symbol: 'INFY',
			name: 'INFOSYS LIMITED',
			high: true,
			breakout: '1,650.15',
			ltp: '1,669.85',
			pct: 2.71,
			level: '1,668.00',
			identified: 1.09
		},
		{
			time: '13:25:30',
			symbol: 'WIPRO',
			name: 'WIPRO LIMITED',
			high: false,
			breakout: '485.20',
			ltp: '477.27',
			pct: -2.53,
			level: '475.50',
			identified: -2.04
		},
		{
			time: '13:10:05',
			symbol: 'BHARTIARTL',
			name: 'BHARTI AIRTEL',
			high: true,
			breakout: '1,220.95',
			ltp: '1,238.53',
			pct: 1.47,
			level: '1,240.00',
			identified: 1.59
		},
		{
			time: '12:55:12',
			symbol: 'SUNPHARMA',
			name: 'SUN PHARMA',
			high: true,
			breakout: '1,550.00',
			ltp: '1,562.77',
			pct: 0.55,
			level: '1,565.00',
			identified: 0.96
		},
		{
			time: '12:40:00',
			symbol: 'BAJFINANCE',
			name: 'BAJAJ FINANCE',
			high: true,
			breakout: '6,880.00',
			ltp: '6,926.55',
			pct: 1.23,
			level: '6,940.00',
			identified: 0.89
		},
		{
			time: '12:25:15',
			symbol: 'LT',
			name: 'LARSEN & TOUBRO',
			high: true,
			breakout: '3,470.50',
			ltp: '3,492.26',
			pct: 1.23,
			level: '3,500.00',
			identified: 0.86
		},
		{
			time: '12:10:05',
			symbol: 'POWERGRID',
			name: 'POWER GRID CORP',
			high: true,
			breakout: '275.00',
			ltp: '277.17',
			pct: 1.6,
			level: '280.00',
			identified: 1.78
		}
	]
};

export const MARKET = {
	indices: [
		{ name: 'NIFTY 50', value: '22,396.85', change: '+129.40 (0.58%)', up: true },
		{ name: 'BANK NIFTY', value: '47,291.12', change: '-81.23 (-0.17%)', up: false },
		{ name: 'SENSEX', value: '73,932.62', change: '+483.38 (0.66%)', up: true }
	],
	intraday: [
		22262, 22285, 22310, 22355, 22348, 22372, 22410, 22398, 22405, 22432, 22418, 22408, 22425,
		22448, 22470, 22452, 22428, 22420, 22415, 22422, 22418, 22424, 22420, 22426, 22422, 22428,
		22424, 22420, 22425, 22422
	],
	times: ['09:15', '10:15', '11:15', '12:15', '13:15', '14:15', '14:59'],
	breadth: { advances: 1469, declines: 848, unchanged: 130 },
	sectors: [
		{ name: 'Energy', v: 0.78 },
		{ name: 'Metal', v: 1.28 },
		{ name: 'FMCG', v: -0.12 },
		{ name: 'Banking', v: -0.42 },
		{ name: 'Pharma', v: 1.02 },
		{ name: 'Auto', v: 1.38 },
		{ name: 'IT', v: 2.38 }
	],
	movers: [
		{ symbol: 'TATASTEEL', ltp: '141.25', change: '+4.70', pct: 3.45 },
		{ symbol: 'RELIANCE', ltp: '2,985.60', change: '+61.35', pct: 2.1 },
		{ symbol: 'INFY', ltp: '1,620.40', change: '+31.05', pct: 1.95 },
		{ symbol: 'HDFCBANK', ltp: '1,452.80', change: '+17.95', pct: 1.25 },
		{ symbol: 'ICICIBANK', ltp: '1,085.30', change: '+9.15', pct: 0.85 }
	]
};

export const ANALYTICS = {
	title: 'Every read the chain gives you',
	body: 'Seventeen modules built around one question — where is the money actually positioned, and what is it costing to hold.',
	items: [
		{
			title: 'Open interest desk',
			lead: 'Watch positions build and unwind strike by strike.',
			body: 'OI tables, buildup classification, a single-strike lookup and a compressed glimpse view for when you want the whole chain on one screen.',
			route: '/oi/tracker',
			icon: ICONS.layers
		},
		{
			title: 'Call versus put pressure',
			lead: 'See which side is carrying the chain.',
			body: 'Side-by-side CE and PE open interest across strikes, plus a multi-expiry overlay that shows whether the pressure is this week or further out.',
			route: '/oi/call-vs-put',
			icon: ICONS.scale
		},
		{
			title: 'Max pain and PCR',
			lead: 'Find the strike that hurts option writers least.',
			body: 'The full pain curve across the chain with the put-call ratio read alongside it, so you know both where price is pulled and who is under pressure.',
			route: '/oi/max-pain',
			icon: ICONS.target
		},
		{
			title: 'Straddle and strangle',
			lead: 'Track the cost of holding volatility.',
			body: 'Combined premium curves for at-the-money straddles and selected strangles, plotted through the session so you can see expansion and collapse as it happens.',
			route: '/charts/straddle',
			icon: ICONS.waves
		},
		{
			title: 'Air in premiums',
			lead: 'Separate real value from time value.',
			body: 'Extrinsic value stripped out strike by strike, showing exactly how much of each premium is air and how quickly that air is leaving the chain.',
			route: '/charts/air-in-premiums',
			icon: ICONS.decay
		},
		{
			title: 'Screeners and breakouts',
			lead: 'Find the stock before it is on the list.',
			body: 'A filterable equity screener with 52-week and volume breakout scans, so cash-market moves reach you at the same time as the derivatives signal.',
			route: '/stocks/stocks-screener',
			icon: ICONS.screen
		}
	]
};

export const WORKFLOW = {
	title: 'How a session runs',
	body: 'No broker account to link and no configuration screen in the way — open a module and start reading.',
	items: [
		{
			title: 'Pick symbol and expiry',
			body: 'Six index chains, three expiries out. Set them on the module you are reading and the strikes follow.',
			icon: ICONS.bookmark
		},
		{
			title: 'Read it from three angles',
			body: 'Open interest and buildup for positioning, max pain and PCR for pressure, straddle and premium decay for what the volatility costs to hold.',
			icon: ICONS.pulse
		},
		{
			title: 'Keep what matters',
			body: 'Save symbols into named watchlists with your own notes attached. They are waiting the next time you sign in.',
			icon: ICONS.grid
		}
	]
};

export const SECURITY = {
	title: 'Three ways in, no password',
	items: [
		{
			title: 'Passkey',
			body: 'Face, fingerprint or device PIN. Never leaves your hardware.',
			icon: ICONS.key
		},
		{
			title: 'Google',
			body: 'One tap, standard OAuth.',
			icon: ICONS.shield
		},
		{
			title: 'Six-digit code',
			body: 'To your email or mobile, valid once.',
			icon: ICONS.phone
		},
		{
			title: 'Staying signed in',
			body: 'Short-lived tokens, rotated in the background.',
			icon: ICONS.clock
		}
	]
};

export const CTA = {
	eyebrow: 'Get started',
	title: 'The chain opens at 9:15',
	body: 'Sign in with a passkey — no broker to link, no setup screen in the way. Seventeen modules, six index chains, three expiries out.',
	label: 'Launch platform',
	href: '/auth/signin'
};

export const FOOTER = [
	{
		title: 'Derivatives',
		links: [
			{ label: 'OI Tracker', href: '/oi/tracker' },
			{ label: 'Max Pain', href: '/oi/max-pain' },
			{ label: 'Straddle', href: '/charts/straddle' },
			{ label: 'Air In Premiums', href: '/charts/air-in-premiums' }
		]
	},
	{
		title: 'Equities',
		links: [
			{ label: 'Stocks Screener', href: '/stocks/stocks-screener' },
			{ label: '52-Week Breakout', href: '/stocks/breakout/52-week' },
			{ label: 'Volume Breakout', href: '/stocks/breakout/volume' },
			{ label: 'Market Pulse', href: '/market-pulse' }
		]
	}
];
