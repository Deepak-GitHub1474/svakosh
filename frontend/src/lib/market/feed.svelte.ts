import { resolveBackendConfig } from '$lib/config';

export type TQuoteField =
	| 'ltp'
	| 'prev_close'
	| 'open'
	| 'high'
	| 'low'
	| 'volume'
	| 'atp'
	| 'ltq'
	| 'bid'
	| 'bid_qty'
	| 'ask'
	| 'ask_qty'
	| 'total_buy_qty'
	| 'total_sell_qty'
	| 'oi'
	| 'prev_oi'
	| 'upper_circuit'
	| 'lower_circuit'
	| 'high_52w'
	| 'low_52w';

export type TQuote = Partial<Record<TQuoteField, number>>;
export type TChange = { change: number; change_pct: number };

type TRow = { sk_token: string } & TQuote;
type TServerMessage =
	| { type: 'snapshot'; data: TRow[] }
	| { type: 'tick'; data: TRow }
	| { type: 'error'; message: string };
type TClientMessage = {
	event: 'subscribe' | 'unsubscribe';
	tokens: string[];
	fields: TQuoteField[];
};

export const PRICE_FIELDS: TQuoteField[] = ['ltp', 'prev_close'];

const WS_PROTOCOL = 'svakosh.v1';
const RETRY_MIN_MS = 1000;
const RETRY_MAX_MS = 30000;
const IDLE_CLOSE_MS = 3000;

export function changeOf(quote?: TQuote): TChange {
	if (!quote?.ltp || !quote.prev_close) return { change: 0, change_pct: 0 };
	const change = quote.ltp - quote.prev_close;
	return {
		change: Math.round(change * 100) / 100,
		change_pct: Math.round((change / quote.prev_close) * 10000) / 100
	};
}

async function fetchSocketTicket(): Promise<string | null> {
	try {
		const response = await fetch('/api/ws-ticket');
		if (!response.ok) return null;
		const payload = (await response.json()) as { ticket?: string | null };
		return payload.ticket ?? null;
	} catch {
		return null;
	}
}

type TFieldsByToken = Record<string, TQuoteField[]>;

function grouped(event: TClientMessage['event'], changes: TFieldsByToken) {
	const byFields: Record<string, TClientMessage> = {};
	for (const [token, fields] of Object.entries(changes)) {
		const key = [...fields].sort().join(',');
		byFields[key] ??= { event, tokens: [], fields };
		byFields[key].tokens.push(token);
	}
	return Object.values(byFields);
}

class MarketFeed {
	quotes: Record<string, TQuote> = $state({});
	connected = $state(false);
	error = $state('');

	private refs: Record<string, Partial<Record<TQuoteField, number>>> = {};
	private socket: WebSocket | null = null;
	private connecting = false;
	private retryMs = RETRY_MIN_MS;
	private retryTimer: ReturnType<typeof setTimeout> | undefined;
	private closeTimer: ReturnType<typeof setTimeout> | undefined;
	private released: TFieldsByToken = {};
	private flushQueued = false;

	subscribe(tokens: string[], fields: TQuoteField[] = PRICE_FIELDS): () => void {
		clearTimeout(this.closeTimer);
		const added: TFieldsByToken = {};
		for (const token of tokens) {
			const counts = (this.refs[token] ??= {});
			for (const field of fields) {
				const count = counts[field] ?? 0;
				counts[field] = count + 1;
				if (count > 0) continue;
				const waiting = this.released[token]?.indexOf(field) ?? -1;
				if (waiting >= 0) this.released[token].splice(waiting, 1);
				else (added[token] ??= []).push(field);
			}
		}
		grouped('subscribe', added).forEach((message) => this.send(message));
		this.connect();
		return () => this.release(tokens, fields);
	}

	private release(tokens: string[], fields: TQuoteField[]) {
		for (const token of tokens) {
			const counts = this.refs[token];
			if (!counts) continue;
			for (const field of fields) {
				const count = (counts[field] ?? 0) - 1;
				if (count > 0) {
					counts[field] = count;
				} else if (field in counts) {
					delete counts[field];
					(this.released[token] ??= []).push(field);
				}
			}
		}
		if (this.flushQueued) return;
		this.flushQueued = true;
		queueMicrotask(() => this.flush());
	}

	private flush() {
		this.flushQueued = false;
		const removed = this.released;
		this.released = {};
		for (const token of Object.keys(removed)) {
			if (removed[token].length === 0) delete removed[token];
			if (Object.keys(this.refs[token] ?? {}).length === 0) {
				delete this.refs[token];
				delete this.quotes[token];
			}
		}
		grouped('unsubscribe', removed).forEach((message) => this.send(message));
		if (!this.hasTokens()) this.closeTimer = setTimeout(() => this.close(), IDLE_CLOSE_MS);
	}

	private hasTokens() {
		return Object.keys(this.refs).length > 0;
	}

	private send(message: TClientMessage) {
		if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message));
	}

	private async connect() {
		if (this.socket || this.connecting || !this.hasTokens()) return;
		this.connecting = true;
		const ticket = await fetchSocketTicket();
		this.connecting = false;
		if (!this.hasTokens()) return;
		if (!ticket) return this.retry();

		const socket = new WebSocket(`${resolveBackendConfig().wsUrl}/market/socket`, [
			WS_PROTOCOL,
			ticket
		]);
		this.socket = socket;
		socket.onopen = () => {
			this.connected = true;
			this.error = '';
			this.retryMs = RETRY_MIN_MS;
			const all: TFieldsByToken = {};
			for (const [token, counts] of Object.entries(this.refs)) {
				all[token] = Object.keys(counts) as TQuoteField[];
			}
			grouped('subscribe', all).forEach((message) => this.send(message));
		};
		socket.onmessage = (event) => this.receive(JSON.parse(event.data) as TServerMessage);
		socket.onclose = () => {
			this.connected = false;
			if (this.socket === socket) this.socket = null;
			this.retry();
		};
	}

	private receive(message: TServerMessage) {
		if (message.type === 'tick') this.apply(message.data);
		else if (message.type === 'snapshot') message.data.forEach((row) => this.apply(row));
		else this.error = message.message;
	}

	private apply({ sk_token, ...fields }: TRow) {
		if (!(sk_token in this.refs)) return;
		const quote = this.quotes[sk_token];
		if (quote) Object.assign(quote, fields);
		else this.quotes[sk_token] = fields;
	}

	private retry() {
		clearTimeout(this.retryTimer);
		if (!this.hasTokens()) return;
		this.retryTimer = setTimeout(() => this.connect(), this.retryMs);
		this.retryMs = Math.min(this.retryMs * 2, RETRY_MAX_MS);
	}

	private close() {
		if (this.hasTokens()) return;
		clearTimeout(this.retryTimer);
		const socket = this.socket;
		this.socket = null;
		this.connected = false;
		socket?.close();
	}
}

export const marketFeed = new MarketFeed();
