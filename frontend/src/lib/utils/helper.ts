export function formatNumber(v: number): string {
	return (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function formatLakh(v: number): string {
	return formatNumber((v || 0) / 100000) + 'L';
}
