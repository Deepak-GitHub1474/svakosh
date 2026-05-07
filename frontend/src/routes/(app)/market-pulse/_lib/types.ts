export interface TMarketPulseRow {
    time: string;
    spot: number;
    ceOIChange: number;
    peOIChange: number;
    oiChange: number;
    dayHL: 'High' | 'Low' | 'Normal';
    optionSignal: 'Bullish' | 'Bearish' | 'Neutral';
    vwap: number;
    callSignal: 'Strong' | 'Weak' | 'Neutral';
    putSignal: 'Strong' | 'Weak' | 'Neutral';
    futCOI: number;
    atmStraddle: number;
}

export interface TMarketPulseData {
    [time: string]: TMarketPulseRow;
}
