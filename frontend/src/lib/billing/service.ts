import { apiCall } from '$lib/api';
import type {
	TCheckout,
	TEntitlements,
	TOverview,
	TPlan,
	TQuote,
	TQuoteRequest,
	TRazorpayResponse,
	TReferral,
	TSubscription
} from './types';

export const getPlans = () => apiCall<TPlan[]>('/api/billing/plans', 'GET');

export const getEntitlements = () => apiCall<TEntitlements>('/api/billing/entitlements', 'GET');

export const getQuote = (body: TQuoteRequest) =>
	apiCall<TQuote>('/api/billing/quote', 'POST', body);

export const startCheckout = (body: TQuoteRequest) =>
	apiCall<TCheckout>('/api/billing/checkout', 'POST', body);

export const confirmPayment = (body: TRazorpayResponse) =>
	apiCall<TSubscription>('/api/billing/confirm', 'POST', body);

export const getOverview = () => apiCall<TOverview>('/api/billing/subscriptions', 'GET');

export const getSubscription = (id: string) =>
	apiCall<TSubscription>(`/api/billing/subscriptions/${encodeURIComponent(id)}`, 'GET');

export const cancelAutopay = (id: string) =>
	apiCall<TSubscription>(`/api/billing/subscriptions/${encodeURIComponent(id)}/cancel`, 'POST');

export const getReferral = () => apiCall<TReferral>('/api/billing/referral', 'GET');

export const applyReferral = (code: string) =>
	apiCall<TReferral>('/api/billing/referral', 'POST', { code });
