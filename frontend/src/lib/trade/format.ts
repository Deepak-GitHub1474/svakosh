import { formatNumber } from '$lib/utils';

export const signed = (v: number) => `${v > 0 ? '+' : ''}${formatNumber(v)}`;

const UNITS: [number, string][] = [
	[1e7, 'Cr'],
	[1e5, 'L'],
	[1e3, 'K']
];

export function compact(v: number) {
	const unit = UNITS.find(([size]) => Math.abs(v) >= size);
	return unit ? `${(v / unit[0]).toFixed(2)} ${unit[1]}` : formatNumber(v);
}

export const compactSigned = (v: number) => `${v > 0 ? '+' : ''}${compact(v)}`;

export const tone = (v: number) =>
	v > 0 ? 'text-bullish' : v < 0 ? 'text-bearish' : 'text-muted-foreground';

export const percent = (part: number, base: number) => (base ? (part / base) * 100 : 0);

export const timeOf = (iso: string) =>
	new Date(iso)
		.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
		.replace(/\b(am|pm)\b/, (m) => m.toUpperCase());

export const instrumentOf = (token: string) => token.split(':').slice(2).join(' ') || token;
