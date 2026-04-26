import type { AirInPremiumsData } from './types';
import { STRIKE_DIFFERENCES } from './const';

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

export function generateMockAirData(symbol: string, expiry: string): AirInPremiumsData {
	const baseStrike = getBaseStrike(symbol);
	const diff = STRIKE_DIFFERENCES[symbol] || 50;
	const dummyData: any = {};
	
	const expiryMultiplier = expiry === 'NEXT_WEEK' ? 1.5 : expiry === 'NEXT_TO_NEXT_WEEK' ? 2.2 : 1.0;

	// Generate 40 strikes around ATM to allow for varying strike_num
	for (let i = -20; i <= 20; i++) {
		const strike = baseStrike + (i * diff);
		// Extrinsic value is highest at ATM and decays as it goes OTM/ITM
		const distance = Math.abs(i);
		const baseValue = 20 * Math.exp(-distance * 0.15);
		
		dummyData[strike] = {
			extCE: (baseValue + Math.random() * 2) * expiryMultiplier,
			extPE: (baseValue + Math.random() * 2) * expiryMultiplier
		};
	}

	return {
		...dummyData,
		atm_strike: baseStrike
	};
}
