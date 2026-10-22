import { apiCall, type TResult } from '$lib/api';
import type {
	TBrokerAccount,
	TBrokerOrder,
	TFunds,
	THolding,
	TLinkAccount,
	TMargin,
	TOrderKind,
	TOrderRecord,
	TPlaceOrder,
	TPosition,
	TTicket,
	TUpdateAccount
} from './types';

const query = (params: Record<string, string | number | undefined>) => {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== '') search.set(key, String(value));
	}
	const text = search.toString();
	return text ? `?${text}` : '';
};

export const listAccounts = () => apiCall<TBrokerAccount[]>('/api/trade/accounts', 'GET');

export const linkAccount = (body: TLinkAccount) =>
	apiCall<TBrokerAccount>('/api/trade/accounts', 'POST', body);

export const updateAccount = (id: string, body: TUpdateAccount) =>
	apiCall<TBrokerAccount>(`/api/trade/accounts/${encodeURIComponent(id)}`, 'PATCH', body);

export const getLoginUrl = (id: string) =>
	apiCall<{ url: string }>(`/api/trade/accounts/${encodeURIComponent(id)}/login`, 'GET');

export const connectSession = (id: string, params: Record<string, string>) =>
	apiCall<TBrokerAccount>(`/api/trade/accounts/${encodeURIComponent(id)}/session`, 'POST', {
		params
	});

export const unlinkAccount = (id: string) =>
	apiCall<null>(`/api/trade/accounts/${encodeURIComponent(id)}`, 'DELETE');

export const getPositions = (accountId: string) =>
	apiCall<TPosition[]>(`/api/trade/positions${query({ account_id: accountId })}`, 'GET');

export const getHoldings = (accountId: string) =>
	apiCall<THolding[]>(`/api/trade/holdings${query({ account_id: accountId })}`, 'GET');

export const getFunds = (accountId: string) =>
	apiCall<TFunds>(`/api/trade/funds${query({ account_id: accountId })}`, 'GET');

export const getFundsRows = async (accountId: string): Promise<TResult<TFunds[]>> => {
	const res = await getFunds(accountId);
	return res.ok ? { ok: true, data: [res.data] } : res;
};

export const getOrders = (accountId: string) =>
	apiCall<TBrokerOrder[]>(`/api/trade/orders${query({ account_id: accountId })}`, 'GET');

export const getOrderHistory = (accountId: string, limit = 50) =>
	apiCall<TOrderRecord[]>(
		`/api/trade/orders/history${query({ account_id: accountId, limit })}`,
		'GET'
	);

export const placeOrder = (body: TPlaceOrder) =>
	apiCall<TOrderRecord>('/api/trade/orders', 'POST', body);

export const getMargin = (body: TTicket) =>
	apiCall<TMargin>('/api/trade/orders/margin', 'POST', body);

export const modifyOrder = (orderId: string, body: TTicket) =>
	apiCall<null>(`/api/trade/orders/${encodeURIComponent(orderId)}`, 'PATCH', body);

export const cancelOrder = (orderId: string, accountId: string, type: TOrderKind) =>
	apiCall<null>(
		`/api/trade/orders/${encodeURIComponent(orderId)}${query({ account_id: accountId, type })}`,
		'DELETE'
	);
