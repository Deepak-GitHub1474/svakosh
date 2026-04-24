import type { TMarketPulseData, TMarketPulseRow } from './types';

export function generatePulseMockData(symbol: string): TMarketPulseData {
    const data: TMarketPulseData = {};
    const startTime = new Date();
    startTime.setHours(9, 15, 0, 0);
    // Generate 10 rows of 5-minute interval data
    for (let i = 0; i < 10; i++) {
        const t = new Date(startTime.getTime() + i * 5 * 60 * 1000);
        const timeStr = t.toTimeString().split(' ')[0].substring(0, 5);
        const basePrice = symbol === 'NIFTY' ? 22000 : 47000;
        
        data[timeStr] = {
            time: timeStr,
            spot: basePrice + Math.sin(i * 0.5) * 100 + (Math.random() * 20),
            ceOIChange: Math.floor(Math.random() * 500000) * (Math.random() > 0.5 ? 1 : -1),
            peOIChange: Math.floor(Math.random() * 500000) * (Math.random() > 0.5 ? 1 : -1),
            oiChange: Math.floor(Math.random() * 200000),
            dayHL: i === 5 ? 'High' : (i === 10 ? 'Low' : 'Normal'),
            optionSignal: Math.random() > 0.6 ? 'Bullish' : (Math.random() > 0.3 ? 'Bearish' : 'Neutral'),
            vwap: basePrice + Math.sin(i * 0.5) * 100 + 5,
            callSignal: Math.random() > 0.5 ? 'Strong' : 'Weak',
            putSignal: Math.random() > 0.5 ? 'Strong' : 'Weak',
            futCOI: Math.floor(Math.random() * 1000000),
            atmStraddle: 200 + Math.random() * 50
        };
    }
    
    return data;
}

export function generateLivePulseRow(symbol: string): TMarketPulseRow {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const basePrice = symbol === 'NIFTY' ? 22150 : 47200;

    return {
        time: timeStr,
        spot: basePrice + (Math.random() * 10),
        ceOIChange: Math.floor(Math.random() * 100000),
        peOIChange: Math.floor(Math.random() * 100000),
        oiChange: Math.floor(Math.random() * 50000),
        dayHL: 'Normal',
        optionSignal: 'Bullish',
        vwap: basePrice + 2,
        callSignal: 'Strong',
        putSignal: 'Weak',
        futCOI: Math.floor(Math.random() * 2000000),
        atmStraddle: 205 + Math.random() * 5
    };
}
