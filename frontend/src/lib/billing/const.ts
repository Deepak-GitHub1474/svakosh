import type { TPlanFilter, TPlanType, TStatusFilter, TSubscriptionStatus, TTenure } from './types';

export const TENURES: TTenure[] = ['monthly', 'quarterly', 'annually'];

export const TENURE_LABELS: Record<TTenure, string> = {
	monthly: 'Monthly',
	quarterly: 'Quarterly',
	annually: 'Annually'
};

export const TENURE_UNITS: Record<TTenure, string> = {
	monthly: 'month',
	quarterly: 'quarter',
	annually: 'year'
};

export const PLAN_CODES: Record<TPlanType, string> = {
	analytics: 'premium',
	broker: 'broker_account'
};

export const PLAN_HOME: Record<TPlanType, { href: string; label: string }> = {
	analytics: { href: '/oi/tracker', label: 'Open Premium Analytics' },
	broker: { href: '/trade/positions', label: 'Go to trading' }
};

export const STATUS_LABELS: Record<TSubscriptionStatus, string> = {
	pending: 'Awaiting payment',
	active: 'Active',
	cancelled: 'Autopay off',
	expired: 'Expired',
	failed: 'Not completed'
};

export const STATUS_BADGE: Record<TSubscriptionStatus, string> = {
	pending: 'bg-primary-subtle text-primary',
	active: 'bg-bullish-subtle text-bullish',
	cancelled: 'bg-primary-subtle text-primary',
	expired: 'bg-glass text-muted-foreground',
	failed: 'bg-bearish-subtle text-bearish'
};

export const STATUS_FILTERS: { label: string; value: TStatusFilter }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Active', value: 'active' },
	{ label: 'Expired', value: 'expired' },
	{ label: 'Pending', value: 'pending' },
	{ label: 'Failed', value: 'failed' }
];

export const PLAN_FILTERS: { label: string; value: TPlanFilter }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Premium Analytics', value: 'analytics' },
	{ label: 'Broker Account', value: 'broker' }
];

export const DEFAULT_STATUS_FILTER: TStatusFilter = 'active';
export const DEFAULT_PLAN_FILTER: TPlanFilter = 'all';

export const HISTORY_VIEW_KEY = 'svakosh:subscriptions-view';

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
	captured: 'Paid',
	failed: 'Failed',
	refunded: 'Refunded'
};

export const GST_PERCENT = 18;

export const SKELETON = 'bg-foreground/10 rounded';

export const RADIO = 'accent-primary size-5 shrink-0 cursor-pointer disabled:cursor-default';

export const IP_LABELS: Record<string, string> = { ipv4: 'IPv4', ipv6: 'IPv6' };

export const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';
export const STATUS_POLL_MS = 2000;
export const STATUS_POLL_LIMIT = 15;
export const QUOTE_DELAY_MS = 300;
export const REFERRAL_PATH = '/profile';
