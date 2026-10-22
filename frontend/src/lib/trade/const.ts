import type { TOrderStatus } from './types';

export type TTradeRoute = '/trade/positions' | '/trade/holdings' | '/trade/orders' | '/trade/funds';

export const TRADE_TABS: { label: string; value: TTradeRoute }[] = [
	{ label: 'Positions', value: '/trade/positions' },
	{ label: 'Holdings', value: '/trade/holdings' },
	{ label: 'Funds', value: '/trade/funds' },
	{ label: 'Orders', value: '/trade/orders' }
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
export const ORDERS_VIEW_KEY = 'svakosh:orders-view';
export const BROKER_VIEW_KEY = 'svakosh:broker-accounts-view';
export const REFRESH_MS = 10_000;

export const TABLE = {
	wrap: 'min-h-56 flex-1 overflow-auto rounded-xl border border-glass-border',
	table: 'w-full text-left border-separate border-spacing-0 whitespace-nowrap',
	thead: 'sticky top-0 z-10',
	head: 'bg-surface-elevated text-foreground/70 text-sm uppercase tracking-wide',
	th: 'py-3 px-4 font-medium border-b border-glass-border',
	row: 'transition-colors hover:bg-glass [&>td]:border-b [&>td]:border-glass-border [&:last-child>td]:border-b-0',
	td: 'py-3 px-4 text-[0.786rem]',
	check:
		'accent-primary size-4 cursor-pointer align-middle disabled:cursor-default disabled:opacity-40'
};

export const EMPTY_STATE = 'min-h-[50vh]';
export const TABLE_EMPTY = 'py-10 whitespace-normal';
