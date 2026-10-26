import type { TPlanType, TSubscriptionStatus, TTenure } from './types';

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

export const STATUS_TONE: Record<TSubscriptionStatus, string> = {
	pending: 'text-primary',
	active: 'text-bullish',
	cancelled: 'text-primary',
	expired: 'text-muted-foreground',
	failed: 'text-bearish'
};

export const IP_LABELS: Record<string, string> = { ipv4: 'IPv4', ipv6: 'IPv6' };

export const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';
export const STATUS_POLL_MS = 2000;
export const STATUS_POLL_LIMIT = 15;
export const QUOTE_DELAY_MS = 300;
export const REFERRAL_PATH = '/profile';

export const FEATURE_LABELS: Record<string, string> = {
	oi_tracker: 'OI Tracker',
	stocks_screener: 'Stocks Screener',
	trading: 'Place orders from SvaKosh'
};
