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
	if (price <= 0 || spot <= 0 || strike <= 0 || term <= 0) return 0;

	let vol = 0.3;
	for (let iteration = 0; iteration < 60; iteration++) {
		const model =
			kind === 'call'
				? callPrice(spot, strike, rate, vol, term)
				: putPrice(spot, strike, rate, vol, term);
		const vega = vegaRaw(spot, strike, rate, vol, term);
		if (vega < 1e-6) break;
		const priceGap = model - price;
		if (Math.abs(priceGap) < 1e-4) break;
		vol = Math.max(0.0001, Math.min(vol - priceGap / vega, 5));
	}
	return vol > 0 && vol < 5 ? vol : 0;
}

function greeksFor(
	spot: number,
	strike: number,
	rate: number,
	vol: number,
	term: number,
	kind: 'call' | 'put'
) {
	if (vol <= 0 || term <= 0) {
		return { delta: 0, gamma: 0, theta: 0, vega: 0 };
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

self.onmessage = (event: MessageEvent<TRequest>) => {
	const { spot, tte, rate, strikes } = event.data;

	const results = strikes.map(({ strike, ce_ltp, pe_ltp }) => {
		const strikeValue = Number(strike);
		const ceIv = impliedVol(ce_ltp, spot, strikeValue, tte, rate, 'call');
		const peIv = impliedVol(pe_ltp, spot, strikeValue, tte, rate, 'put');
		const callGreeks = greeksFor(spot, strikeValue, rate, ceIv, tte, 'call');
		const putGreeks = greeksFor(spot, strikeValue, rate, peIv, tte, 'put');

		return {
			strike,
			ce_iv: ceIv * 100,
			ce_delta: callGreeks.delta,
			ce_gamma: callGreeks.gamma,
			ce_theta: callGreeks.theta,
			ce_vega: callGreeks.vega,
			pe_iv: peIv * 100,
			pe_delta: putGreeks.delta,
			pe_gamma: putGreeks.gamma,
			pe_theta: putGreeks.theta,
			pe_vega: putGreeks.vega
		};
	});

	self.postMessage(results);
};
