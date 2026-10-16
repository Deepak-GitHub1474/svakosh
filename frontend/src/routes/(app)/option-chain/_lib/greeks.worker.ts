type TInput = { strike: string; ce_ltp: number; pe_ltp: number };

type TRequest = {
	spot: number;
	tte: number;
	rate: number;
	strikes: TInput[];
};

function normalCdf(z: number): number {
	const scale = 1 / (1 + 0.2316419 * Math.abs(z));
	const density = 0.3989423 * Math.exp((-z * z) / 2);
	const tail =
		density *
		scale *
		(0.3193815 +
			scale * (-0.3565638 + scale * (1.781478 + scale * (-1.821256 + scale * 1.330274))));
	return z > 0 ? 1 - tail : tail;
}

function normalPdf(z: number): number {
	return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);
}

function blackScholesD1(
	spot: number,
	strike: number,
	rate: number,
	vol: number,
	term: number
): number {
	if (vol <= 0 || term <= 0) return 0;
	return (Math.log(spot / strike) + (rate + 0.5 * vol * vol) * term) / (vol * Math.sqrt(term));
}

function callPrice(spot: number, strike: number, rate: number, vol: number, term: number): number {
	const d1 = blackScholesD1(spot, strike, rate, vol, term);
	const d2 = d1 - vol * Math.sqrt(term);
	const value = spot * normalCdf(d1) - strike * Math.exp(-rate * term) * normalCdf(d2);
	return Number.isNaN(value) ? 0 : value;
}

function putPrice(spot: number, strike: number, rate: number, vol: number, term: number): number {
	const d1 = blackScholesD1(spot, strike, rate, vol, term);
	const d2 = d1 - vol * Math.sqrt(term);
	const value = strike * Math.exp(-rate * term) * normalCdf(-d2) - spot * normalCdf(-d1);
	return Number.isNaN(value) ? 0 : value;
}

function vegaRaw(spot: number, strike: number, rate: number, vol: number, term: number): number {
	if (term <= 0) return 0;
	const d1 = blackScholesD1(spot, strike, rate, vol, term);
	return spot * normalPdf(d1) * Math.sqrt(term);
}

function impliedVol(
	price: number,
	spot: number,
	strike: number,
	term: number,
	rate: number,
	kind: 'call' | 'put'
): number {
	if (price <= 0 || spot <= 0 || strike <= 0 || term <= 0) return NaN;
	const discounted = strike * Math.exp(-rate * term);
	const intrinsic =
		kind === 'call' ? Math.max(spot - discounted, 0) : Math.max(discounted - spot, 0);
	const ceiling = kind === 'call' ? spot : discounted;
	if (price <= intrinsic || price >= ceiling) return NaN;

	let low = 1e-4;
	let high = 5;
	let vol = 0.3;
	for (let iteration = 0; iteration < 100; iteration++) {
		const model =
			kind === 'call'
				? callPrice(spot, strike, rate, vol, term)
				: putPrice(spot, strike, rate, vol, term);
		const gap = model - price;
		if (Math.abs(gap) < 1e-5) return vol;
		if (gap > 0) high = vol;
		else low = vol;
		const vega = vegaRaw(spot, strike, rate, vol, term);
		const next = vega > 1e-8 ? vol - gap / vega : NaN;
		vol = next > low && next < high ? next : (low + high) / 2;
	}
	return vol;
}

function greeksFor(
	spot: number,
	strike: number,
	rate: number,
	vol: number,
	term: number,
	kind: 'call' | 'put'
) {
	if (!(vol > 0) || term <= 0) {
		return { delta: NaN, gamma: NaN, theta: NaN, vega: NaN };
	}

	const d1 = blackScholesD1(spot, strike, rate, vol, term);
	const d2 = d1 - vol * Math.sqrt(term);
	const sqrtT = Math.sqrt(term);
	const phi = normalPdf(d1);

	const gamma = phi / (spot * vol * sqrtT);
	const vega = (spot * phi * sqrtT) / 100;
	const decay = -(spot * phi * vol) / (2 * sqrtT);
	const carry = rate * strike * Math.exp(-rate * term);

	const delta = kind === 'call' ? normalCdf(d1) : normalCdf(d1) - 1;
	const theta =
		kind === 'call'
			? (decay - carry * normalCdf(d2)) / 365
			: (decay + carry * normalCdf(-d2)) / 365;

	return {
		delta: Number.isNaN(delta) ? 0 : delta,
		gamma: Number.isNaN(gamma) ? 0 : gamma,
		theta: Number.isNaN(theta) ? 0 : theta,
		vega: Number.isNaN(vega) ? 0 : vega
	};
}

function impliedSpot(spot: number, tte: number, rate: number, strikes: TInput[]): number {
	let best: TInput | null = null;
	for (const entry of strikes) {
		if (entry.ce_ltp <= 0 || entry.pe_ltp <= 0) continue;
		if (!best || Math.abs(Number(entry.strike) - spot) < Math.abs(Number(best.strike) - spot)) {
			best = entry;
		}
	}
	if (!best) return spot;
	const parity = best.ce_ltp - best.pe_ltp + Number(best.strike) * Math.exp(-rate * tte);
	return Math.abs(parity - spot) / spot < 0.05 ? parity : spot;
}

self.onmessage = (event: MessageEvent<TRequest>) => {
	const { tte, rate, strikes } = event.data;
	const spot = impliedSpot(event.data.spot, tte, rate, strikes);

	const results = strikes.map(({ strike, ce_ltp, pe_ltp }) => {
		const strikeValue = Number(strike);
		const callIv = impliedVol(ce_ltp, spot, strikeValue, tte, rate, 'call');
		const putIv = impliedVol(pe_ltp, spot, strikeValue, tte, rate, 'put');
		const otmIv = strikeValue >= spot ? callIv : putIv;
		const iv = Number.isNaN(otmIv) ? (strikeValue >= spot ? putIv : callIv) : otmIv;
		const callGreeks = greeksFor(spot, strikeValue, rate, iv, tte, 'call');
		const putGreeks = greeksFor(spot, strikeValue, rate, iv, tte, 'put');

		return {
			strike,
			ce_iv: iv * 100,
			ce_delta: callGreeks.delta,
			ce_gamma: callGreeks.gamma,
			ce_theta: callGreeks.theta,
			ce_vega: callGreeks.vega,
			pe_iv: iv * 100,
			pe_delta: putGreeks.delta,
			pe_gamma: putGreeks.gamma,
			pe_theta: putGreeks.theta,
			pe_vega: putGreeks.vega
		};
	});

	self.postMessage(results);
};
