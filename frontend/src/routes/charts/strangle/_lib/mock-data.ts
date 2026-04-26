import type { StrangleDataMap } from './types';

export function getBaseStrike(symbol: string): number {
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

export function generateMockStrangleData(symbol: string, ceStrike: number, peStrike: number, expiry: string): StrangleDataMap {
	const data: StrangleDataMap = {};
	const startTime = new Date();
	startTime.setHours(9, 15, 0, 0);
	const currentTime = new Date();
	
	const expiryMultiplier = expiry === 'NEXT_WEEK' ? 1.5 : expiry === 'NEXT_TO_NEXT_WEEK' ? 2.0 : 1.0;
	const expirySeed = expiry === 'NEXT_WEEK' ? 800 : expiry === 'NEXT_TO_NEXT_WEEK' ? 1600 : 0;

	for (let t = new Date(startTime); t <= currentTime; t.setMinutes(t.getMinutes() + 5)) {
		const timeStr = t.toTimeString().split(' ')[0].substring(0, 5);
		const seed = t.getHours() * 60 + t.getMinutes() + expirySeed;
		
		const ceLTP = (50 + Math.sin((seed + ceStrike) * 0.1) * 10) * expiryMultiplier;
		const peLTP = (55 + Math.cos((seed + peStrike) * 0.1) * 10) * expiryMultiplier;
		const ceATP = ceLTP + 1.5;
		const peATP = peLTP + 1.2;

		data[timeStr] = {
			time: timeStr,
			ceOI: Math.floor((50000 + Math.sin((seed + ceStrike) * 0.05) * 20000) * (1/expiryMultiplier)),
			peOI: Math.floor((60000 + Math.cos((seed + peStrike) * 0.05) * 20000) * (1/expiryMultiplier)),
			strangleRate: ceLTP + peLTP,
			strangleATP: ceATP + peATP
		};
	}
	
	return data;
}
