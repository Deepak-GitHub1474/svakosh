import type { TMaxPainData } from './types';
import { STRIKE_DIFFERENCES } from './const';

export function generateMaxPainMockData(symbol: string): { data: TMaxPainData; maxPainStrike: number } {
    const baseStrikes: Record<string, number> = {
        'NIFTY': 22450,
        'BANKNIFTY': 48200,
        'FINNIFTY': 21600,
        'MIDCPNIFTY': 10550,
        'SENSEX': 73800,
        'BANKEX': 54200
    };

    const baseStrike = baseStrikes[symbol] || 20000;
    const diff = STRIKE_DIFFERENCES[symbol] || 100;
    const data: TMaxPainData = {};

    // Generate 100 strikes around base to ensure range covers the view
    for (let i = -50; i <= 50; i++) {
        const strike = baseStrike + (i * diff);
        
        // Simulating the "V" or "U" shaped payout curve
        // Total Pain = Sum of (Intrinsic value * OI) for all strikes
        // For simplicity, we use a parabolic function around the base strike
        const callPayout = Math.pow(Math.max(0, i), 1.6) * 120000;
        const putPayout = Math.pow(Math.max(0, -i), 1.6) * 120000;
        const total = Math.floor(callPayout + putPayout);
        
        data[strike] = {
            strike,
            value: total,
            callPayout: Math.floor(callPayout),
            putPayout: Math.floor(putPayout),
            totalPayout: total
        };
    }

    return {
        data,
        maxPainStrike: baseStrike
    };
}
