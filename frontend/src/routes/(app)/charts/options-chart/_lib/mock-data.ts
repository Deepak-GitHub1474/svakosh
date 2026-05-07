import type { OptionsChartDataMap } from './types';

export function getBaseStrike(symbol: string): number {
	const dummyStrikeMap: Record<string, number> = {
		NIFTY: 22500,
		BANKNIFTY: 48000,
		FINNIFTY: 21500,
		MIDCPNIFTY: 10500,
		BANKEX: 54000,
		SENSEX: 73500
	};
	return dummyStrikeMap[symbol] || 20000;
}

export function generateMockOptionsData(symbol: string, strike: number, expiry: string): OptionsChartDataMap {
	const data: OptionsChartDataMap = {};
	const startTime = new Date();
	startTime.setHours(9, 15, 0, 0);
	const endTime = new Date();
	endTime.setHours(15, 30, 0, 0);
	const currentTime = new Date();
	
	const expiryMultiplier = expiry === 'NEXT_WEEK' ? 1.4 : expiry === 'NEXT_TO_NEXT_WEEK' ? 1.8 : 1.0;
	const isCurrentWeek = expiry === 'CURRENT_WEEK';
	const baseSpot = getBaseStrike(symbol);
	
	let currentSpot = baseSpot;
	let currentCeOI = 1200000 / expiryMultiplier;
	let currentPeOI = 1200000 / expiryMultiplier;

	for (let t = new Date(startTime); t <= endTime; t.setMinutes(t.getMinutes() + 5)) {
		const timeStr = t.toTimeString().split(' ')[0].substring(0, 5);
		if (t > currentTime && currentTime < endTime) continue;

		const minutesFromStart = (t.getHours() * 60 + t.getMinutes()) - 555;
		const progress = minutesFromStart / 375;

		const drift = (Math.random() - 0.48) * 4;
		currentSpot += drift;

		const theta = isCurrentWeek ? Math.pow(progress, 2.5) * 40 : progress * 20;
		const timeValue = Math.max(2, (50 * expiryMultiplier) - theta);
		
		const ceLTP = Math.max(0.05, Math.max(0, currentSpot - strike) + timeValue + (Math.random() - 0.5) * 2);
		const peLTP = Math.max(0.05, Math.max(0, strike - currentSpot) + timeValue + (Math.random() - 0.5) * 2);

		const priceImpact = drift * 1000;
		const isSquaringOff = progress > 0.88;
		
		if (isSquaringOff) {
			currentCeOI -= 4000 + Math.random() * 2000;
			currentPeOI -= 4000 + Math.random() * 2000;
		} else {
			currentCeOI += 3000 - priceImpact + (Math.random() * 500);
			currentPeOI += 3000 + priceImpact + (Math.random() * 500);
		}

		const volU = Math.pow(Math.abs(progress - 0.5) * 2, 2);
		const baseVol = (200000 + volU * 500000) * (1 / (1 + Math.abs(currentSpot - strike) / 500));

		data[timeStr] = {
			time: timeStr,
			ceOI: Math.floor(currentCeOI),
			peOI: Math.floor(currentPeOI),
			ceLTP,
			peLTP,
			ceVolume: Math.floor(baseVol + Math.random() * 50000),
			peVolume: Math.floor(baseVol * 0.97 + Math.random() * 50000),
			ceATP: ceLTP * (1 + (Math.random() * 0.01)),
			peATP: peLTP * (1 + (Math.random() * 0.01)),
			ceChange: ceLTP * 0.01,
			peChange: peLTP * 0.01,
			ceOpen: ceLTP - (Math.random() * 1),
			peOpen: peLTP - (Math.random() * 1),
			ceHigh: ceLTP + Math.random() * 2,
			peHigh: peLTP + Math.random() * 2,
			ceLow: ceLTP - Math.random() * 2,
			peLow: peLTP - Math.random() * 2,
			ceClose: ceLTP,
			peClose: peLTP
		};
	}
	return data;
}
