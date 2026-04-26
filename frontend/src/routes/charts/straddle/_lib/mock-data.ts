import type { StraddleDataMap } from './types';

export const generateMockStraddleData = (symbol: string, strike: number): StraddleDataMap => {
	const data: StraddleDataMap = {};
	const startTime = new Date();
	startTime.setHours(9, 15, 0, 0);
	const currentTime = new Date();
	
	if (currentTime.getHours() < 9 || (currentTime.getHours() === 9 && currentTime.getMinutes() < 15)) {
		currentTime.setHours(15, 30, 0, 0);
	}

	for (let t = new Date(startTime); t <= currentTime; t.setMinutes(t.getMinutes() + 5)) {
		const timeStr = t.toTimeString().split(' ')[0].substring(0, 5);
		const seed = t.getHours() * 60 + t.getMinutes();
		
		const ceLTP = 100 + Math.sin(seed * 0.1) * 20 + (Math.random() * 5);
		const peLTP = 110 + Math.cos(seed * 0.1) * 20 + (Math.random() * 5);
		const ceOI = Math.floor(1000000 + Math.sin(seed * 0.1) * 200000 + (Math.random() * 50000));
		const peOI = Math.floor(1100000 + Math.cos(seed * 0.1) * 200000 + (Math.random() * 50000));
		const ceATP = ceLTP + 2;
		const peATP = peLTP + 2;

		data[timeStr] = {
			ceOI,
			peOI,
			ceLTP,
			peLTP,
			ceATP,
			peATP,
			straddleRate: ceLTP + peLTP,
			straddleATP: ceATP + peATP,
			time: timeStr
		};
	}
	
	return data;
};

export const getBaseStrike = (symbol: string): number => {
	const dummyStrikeMap: Record<string, number> = {
		NIFTY: 22500,
		BANKNIFTY: 48000,
		FINNIFTY: 21500,
		MIDCPNIFTY: 10500,
		BANKEX: 54000,
		SENSEX: 73500
	};
	return dummyStrikeMap[symbol] || 20000;
};
