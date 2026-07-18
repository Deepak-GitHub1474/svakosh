import { apiCall } from '$lib/api';
import type { TWatchlistEntriesPayload, TWatchlistItem } from './types';

export const createWatchlist = (name: string) =>
	apiCall<TWatchlistItem>('/api/watchlist/create', 'POST', { name });

export const addSymbolToWatchlist = (watchlist_name: string, sk_token: string) =>
	apiCall<{ watchlist_name: string; sk_token: string; count: number }>(
		'/api/watchlist/add-symbol',
		'POST',
		{ watchlist_name, sk_token }
	);

export const renameWatchlist = (old_name: string, new_name: string) =>
	apiCall<{ old_name: string; new_name: string }>('/api/watchlist/rename', 'PUT', {
		old_name,
		new_name
	});

export const deleteWatchlist = (name: string) =>
	apiCall<{ name: string }>('/api/watchlist/delete', 'DELETE', { name });

export const getWatchlistEntries = (name: string) =>
	apiCall<TWatchlistEntriesPayload>(
		`/api/watchlist/entries?name=${encodeURIComponent(name)}`,
		'GET'
	);

export const removeSymbolFromWatchlist = (watchlist_name: string, sk_token: string) =>
	apiCall<{ watchlist_name: string; sk_token: string; count: number }>(
		'/api/watchlist/remove-symbol',
		'DELETE',
		{ watchlist_name, sk_token }
	);

export const upsertSymbolNote = (watchlist_name: string, sk_token: string, note: string) =>
	apiCall<{ watchlist_name: string; sk_token: string; note: string }>(
		'/api/watchlist/note',
		'POST',
		{ watchlist_name, sk_token, note }
	);

export const deleteSymbolNote = (watchlist_name: string, sk_token: string) =>
	apiCall<{ watchlist_name: string; sk_token: string }>('/api/watchlist/note', 'DELETE', {
		watchlist_name,
		sk_token
	});
