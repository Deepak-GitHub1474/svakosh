export type SignalVariant = "primary" | "bullish" | "bearish";

export function getSignalVariant(signal: string): SignalVariant {
	const s = signal?.toLowerCase() || '';
	if (['bullish', 'strong', 'high', 'buy'].includes(s)) return 'bullish';
	if (['bearish', 'weak', 'low', 'sell'].includes(s)) return 'bearish';
	return 'primary';
}

export function isNumericColumn(index: number): boolean {
	return [1, 2, 3, 4, 7, 10, 11].includes(index);
}

export function isSignalColumn(index: number): boolean {
	return [5, 6, 8, 9].includes(index);
}

export function optionSignal(ceChange: number, peChange: number): 'Bullish' | 'Bearish' | 'Neutral' {
	if (peChange > ceChange) return 'Bullish';
	if (ceChange > peChange) return 'Bearish';
	return 'Neutral';
}

export function callSignal(ceChange: number): 'Strong' | 'Weak' | 'Neutral' {
	if (ceChange < 0) return 'Strong';
	if (ceChange > 0) return 'Weak';
	return 'Neutral';
}

export function putSignal(peChange: number): 'Strong' | 'Weak' | 'Neutral' {
	if (peChange > 0) return 'Strong';
	if (peChange < 0) return 'Weak';
	return 'Neutral';
}
