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
export const ORDERS_FILTER_KEY = 'svakosh:orders-filter';
export const TRADES_SIDE_KEY = 'svakosh:trades-side';
export const BROKER_VIEW_KEY = 'svakosh:broker-accounts-view';
export const REFRESH_MS = 60_000;
export const LIVE_RELOAD_MS = 300;

export const TABLE = {
	wrap: 'min-h-56 flex-1 overflow-auto rounded-xl border border-glass-border [&::-webkit-scrollbar]:w-0',
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

export const SHEET_CONTEXT = 'trade-sheet';
export const MODAL_CONTROL = 'h-[2.8929rem]';
export const MODAL_BUTTON = 'h-[2.8929rem] text-sm';
export const MODAL_STEPPER = '[&_.glass-panel]:h-[2.8929rem]';

export const SOFT_TABS =
	'h-[2.8929rem] w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:px-2 [&>div]:bg-none [&>div]:bg-primary/15 [&>div]:shadow-none [&>div]:ring-1 [&>div]:ring-inset [&>div]:ring-primary/40 [&>button.text-black]:text-primary';
export const PRICE_TICK = 0.05;
export const MAX_ORDER_QUANTITY = 1_000_000;
export const MAX_ORDER_PRICE = 10_000_000;
