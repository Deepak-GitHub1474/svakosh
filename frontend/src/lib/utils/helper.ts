export function formatNumber(v: number): string {
	return (v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatLakh(v: number): string {
	return formatNumber((v || 0) / 100000) + 'L';
}

export function roundLakh(v: number): number {
	return Math.round((v + Number.EPSILON) * 100) / 100;
}
