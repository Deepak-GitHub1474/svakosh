export function optionToken(
	exchange: string,
	underlying: string,
	expiry: string,
	strike: number | string,
	type: 'CE' | 'PE'
): string {
	return `${exchange}:OPT:${underlying}:${expiry.replaceAll('-', '')}:${Number(strike)}:${type}`;
}
