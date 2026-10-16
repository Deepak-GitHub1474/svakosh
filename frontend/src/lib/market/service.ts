import { apiCall } from '$lib/api';
import type { TBars, TCandle, TChainRef, TChainView, TMarketOverviewData } from './types';

export const getMarketOverview = () => apiCall<TMarketOverviewData>('/api/market/overview', 'GET');

export const getIntraday = (token: string) =>
	apiCall<TCandle[]>(`/api/market/intraday?token=${encodeURIComponent(token)}`, 'GET');

export const getChains = () => apiCall<TChainRef[]>('/api/market/chains', 'GET');

export const getChain = (exchange: string, underlying: string) =>
	apiCall<TChainView>(
		`/api/market/chain?exchange=${encodeURIComponent(exchange)}&underlying=${encodeURIComponent(underlying)}`,
		'GET'
	);

export const getBars = (subject: string, prefix: string, interval: number, minutes = 0) =>
	apiCall<TBars>(
		`/api/market/bars?subject=${encodeURIComponent(subject)}&prefix=${encodeURIComponent(prefix)}&interval=${interval}&minutes=${minutes}`,
		'GET'
	);

export const getAverageVolumes = () =>
	apiCall<Record<string, number>>('/api/market/avg-volume', 'GET');
