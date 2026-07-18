export function statusVariant(status: string): 'primary' | 'bullish' {
	return status?.toLowerCase() === 'active' ? 'bullish' : 'primary';
}
