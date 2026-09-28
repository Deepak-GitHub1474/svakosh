import { env } from '$env/dynamic/public';
import { resolveBackendConfig } from '$lib/config';
import { createMockFeed } from './mock-data';
import type { TFeedMessage } from './types';

export type TFeed = {
	requestIds: () => void;
	subscribe: (chainId: string) => void;
	unsubscribe: (chainId: string) => void;
	close: () => void;
};

export type TFeedHandlers = {
	onMessage: (message: TFeedMessage) => void;
	onStatus: (connected: boolean) => void;
	onError: (message: string) => void;
};

function useMock(): boolean {
	return (env.PUBLIC_SVAKOSH_OPTION_CHAIN_FEED || 'mock').toLowerCase() !== 'live';
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

function createLiveFeed(handlers: TFeedHandlers): TFeed {
	let socket: WebSocket | null = null;
	let disposed = false;
	let outbox: string[] = [];

	function drainOutbox() {
		if (socket?.readyState !== WebSocket.OPEN) return;
		for (const message of outbox) socket.send(message);
		outbox = [];
	}

	function send(payload: Record<string, unknown>) {
		const message = JSON.stringify(payload);
		if (socket?.readyState === WebSocket.OPEN) socket.send(message);
		else outbox.push(message);
	}

	(async () => {
		const { wsUrl } = resolveBackendConfig();
		const ticket = await fetchSocketTicket();
		if (disposed) return;

		const url = `${wsUrl}/option-chain-socket`;
		socket = ticket ? new WebSocket(url, ['svakosh.v1', ticket]) : new WebSocket(url);

		socket.onopen = () => {
			handlers.onStatus(true);
			drainOutbox();
		};

		socket.onclose = () => handlers.onStatus(false);
		socket.onerror = () => handlers.onError('Feed connection failed.');

		socket.onmessage = (event) => {
			try {
				handlers.onMessage(JSON.parse(event.data as string) as TFeedMessage);
			} catch {
				handlers.onError('Malformed feed frame.');
			}
		};
	})();

	return {
		requestIds: () => send({ event: 'option_chain_ids' }),
		subscribe: (chainId) => send({ event: 'subscribe_option_chain', chain_id: chainId }),
		unsubscribe: (chainId) => send({ event: 'unsubscribe_option_chain', chain_id: chainId }),
		close: () => {
			disposed = true;
			send({ event: 'disconnect' });
			socket?.close();
			socket = null;
		}
	};
}

export function openFeed(handlers: TFeedHandlers): TFeed {
	if (useMock()) {
		const mock = createMockFeed(handlers.onMessage);
		queueMicrotask(() => handlers.onStatus(true));
		return {
			requestIds: mock.requestIds,
			subscribe: mock.subscribe,
			unsubscribe: mock.unsubscribe,
			close: mock.close
		};
	}
	return createLiveFeed(handlers);
}
