import { formatNumber } from '$lib/utils';

export const signed = (v: number) => `${v > 0 ? '+' : ''}${formatNumber(v)}`;

export const tone = (v: number) =>
	v > 0 ? 'text-bullish' : v < 0 ? 'text-bearish' : 'text-muted-foreground';

export const percent = (part: number, base: number) => (base ? (part / base) * 100 : 0);

export const timeOf = (iso: string) =>
	new Date(iso).toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});

export const instrumentOf = (token: string) => token.split(':').slice(2).join(' ') || token;
