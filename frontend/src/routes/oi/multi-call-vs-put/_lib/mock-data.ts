import type { OIDataMap } from './types';

export function generateMultiStrikeMockData(symbol: string, strikes: string[], expiry: string = 'CURRENT_WEEK'): Record<string, OIDataMap> {
	const resp: Record<string, OIDataMap> = {};
	
	const now = new Date();
	const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15);
	const currentTime = new Date();
	const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30);
	
	const limit = currentTime < endTime ? currentTime : endTime;
	const expirySeed = expiry.length;

	strikes.forEach((strike) => {
		const data: OIDataMap = {};
		const strikeNum = parseInt(strike);
		
		const t = new Date(startTime);
		while (t <= limit) {
			const timeStr = t.toTimeString().split(' ')[0].substring(0, 5);
			const seed = t.getHours() * 60 + t.getMinutes() + strikeNum + expirySeed;
			
			const baseCE = 50000 + Math.sin(seed * 0.1) * 20000;
			const basePE = 60000 + Math.cos(seed * 0.1) * 20000;
			
			data[timeStr] = {
				ceOI: Math.floor(baseCE + Math.random() * 5000),
				peOI: Math.floor(basePE + Math.random() * 5000)
			};
			t.setMinutes(t.getMinutes() + 5);
		}
		resp[strike] = data;
	});

	return resp;
}

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
