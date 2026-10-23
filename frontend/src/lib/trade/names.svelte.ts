import { apiCall } from '$lib/api';

type TName = {
	sk_token: string;
	trading_symbol: string;
	company_name: string | null;
	lot_size: number;
};

class InstrumentNames {
	names = $state<Record<string, TName>>({});
	private asked = new Set<string>();

	async want(tokens: string[]) {
		const fresh = [...new Set(tokens)].filter((t) => t && !this.asked.has(t));
		if (!fresh.length) return;
		fresh.forEach((t) => this.asked.add(t));
		const res = await apiCall<TName[]>(
			`/api/market/instruments?tokens=${encodeURIComponent(fresh.join(','))}`,
			'GET'
		);
		if (!res.ok) {
			fresh.forEach((t) => this.asked.delete(t));
			return;
		}
		for (const name of res.data) this.names[name.sk_token] = name;
	}
}

export const instrumentNames = new InstrumentNames();

export const plainSymbol = (symbol: string) => symbol.replace(/-(EQ|BE|BZ|SM|ST)$/, '');
