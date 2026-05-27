export interface ExtrinsicData {
	extCE: number;
	extPE: number;
}

export interface AirInPremiumsData {
	[strike: number]: ExtrinsicData;
	atm_strike: number;
}
