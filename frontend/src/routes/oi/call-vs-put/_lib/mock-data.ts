import type { OIDataMap } from './types';

export function generateSingleStrikeMockData(symbol: string, strike: number, expiry: string = 'CURRENT_WEEK'): OIDataMap {
	const data: OIDataMap = {};
	const now = new Date();
	const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15);
	const currentTime = new Date();
	const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30);
	
	const limit = currentTime < endTime ? currentTime : endTime;
	const expirySeed = expiry.length;

	for (let t = new Date(startTime); t <= limit; t.setMinutes(t.getMinutes() + 5)) {
		const timeStr = t.toTimeString().split(' ')[0].substring(0, 5);
		const seed = t.getHours() * 60 + t.getMinutes() + strike + expirySeed;
		
		const baseCE = 1000000 + Math.sin(seed * 0.05) * 400000;
		const basePE = 1100000 + Math.cos(seed * 0.05) * 400000;
		
		data[timeStr] = {
			ceOI: Math.floor(baseCE + Math.random() * 100000),
			peOI: Math.floor(basePE + Math.random() * 100000)
		};
	}

	return data;
}

export function getInitialStrike(symbol: string): number {
	const dummy_strike_map: Record<string, number> = {
		NIFTY: 22500,
		BANKNIFTY: 48000,
		FINNIFTY: 21500,
		MIDCPNIFTY: 10500,
		BANKEX: 54000,
		SENSEX: 73500
	};
	return dummy_strike_map[symbol] || 20000;
}
