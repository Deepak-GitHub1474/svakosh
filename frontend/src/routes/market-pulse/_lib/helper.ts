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

export function isMarketHours(): boolean {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const timeNum = hours * 100 + minutes;
	return timeNum >= 915 && timeNum <= 1530;
}
