const CDN_BASE = 'https://datastore.cirrus.trade/images/symbol';

const INDEX_PREFIXES = [
	'MIDCPNIFTY',
	'BANKNIFTY',
	'FINNIFTY',
	'BANKEX',
	'SENSEX',
	'NIFTY'
] as const;

export function symbolImageBase(raw: string): string {
	const s = (raw ?? '').trim().toUpperCase();
	if (!s) return '';
	for (const p of INDEX_PREFIXES) {
		if (s === p || s.startsWith(`${p} `) || s.startsWith(p)) return p;
	}
	return s;
}

export function symbolImageUrl(name: string): string {
	const base = symbolImageBase(name);
	if (!base) return '';
	return `${CDN_BASE}/${encodeURIComponent(base)}.png`;
}

export function symbolInitial(name: string): string {
	return ((name ?? '').trim()[0] ?? '?').toUpperCase();
}

export { default as SymbolImage } from './SymbolImage.svelte';
