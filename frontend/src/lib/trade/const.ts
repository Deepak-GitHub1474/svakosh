import type { TOrderStatus } from './types';

export type TTradeRoute = '/trade/positions' | '/trade/holdings' | '/trade/orders' | '/trade/funds';

export const TRADE_TABS: { label: string; value: TTradeRoute }[] = [
	{ label: 'Positions', value: '/trade/positions' },
	{ label: 'Holdings', value: '/trade/holdings' },
	{ label: 'Orders', value: '/trade/orders' },
	{ label: 'Funds', value: '/trade/funds' }
];

export const TRADE_STATIC_IP = '35.244.31.217';
export const CALLBACK_PATH = '/broker/accounts/callback';

export const OPEN_STATUSES: TOrderStatus[] = ['OPEN', 'TRIGGER_PENDING'];

export const STATUS_TONE: Record<TOrderStatus, string> = {
	PENDING: 'text-primary',
	UNKNOWN: 'text-primary',
	OPEN: 'text-primary',
	TRIGGER_PENDING: 'text-primary',
	COMPLETE: 'text-bullish',
	CANCELLED: 'text-muted-foreground',
	REJECTED: 'text-bearish',
	FAILED: 'text-bearish'
};

export const ACCOUNT_KEY = 'svakosh:trade-account';
export const REFRESH_MS = 10_000;

export const TABLE = {
	wrap: 'overflow-x-auto rounded-xl border border-glass-border',
	table: 'w-full text-left border-collapse whitespace-nowrap',
	head: 'border-b border-glass-border uppercase tracking-widest text-muted-foreground text-xs',
	th: 'py-2.5 px-4 font-normal',
	body: 'divide-y divide-glass-border',
	row: 'transition-colors hover:bg-white/5',
	td: 'py-3 px-4 text-[0.786rem]'
};

export const EMPTY_STATE = 'min-h-[50vh]';
