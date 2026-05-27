export type TBuildupType = 'Writing' | 'Unwinding';

export interface TOIEntry {
	Strike: number;
	OI: number;
}

export interface TOISide {
	Writing: TOIEntry[];
	Unwinding: TOIEntry[];
}

export interface TOISymbolDetail {
	CE: TOISide;
	PE: TOISide;
}

export type TTimeFrame = '1 Min' | '3 Min' | '6 Min' | '9 Min' | '15 Min' | '30 Min';

export type TSymbolData = Record<TTimeFrame, TOISymbolDetail>;

export type TFullOIData = Record<string, TSymbolData>;

export interface TOIFilters {
	time: TTimeFrame;
	expiry: string;
}
