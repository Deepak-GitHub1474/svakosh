export function formatNumber(num: number): string {
	return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
