export type TTenure = 'monthly' | 'quarterly' | 'annually';
export type TPlanType = 'analytics' | 'broker';
export type TSubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'expired' | 'failed';

export type TPrice = {
	tenure: TTenure;
	broker: string | null;
	ip: string | null;
	price_paise: number;
};

export type TPlan = {
	id: string;
	code: string;
	name: string;
	type: TPlanType;
	description: string;
	features: string[];
	prices: TPrice[];
};

export type TQuoteRequest = {
	plan: string;
	tenure: TTenure;
	broker_account_id?: string;
	ip?: string;
	coupon?: string;
};

export type TQuote = {
	plan: TPlan;
	tenure: TTenure;
	broker: string | null;
	broker_account_id: string | null;
	ip: string | null;
	price_paise: number;
	discount_paise: number;
	payable_paise: number;
	trial: boolean;
	first_charge_at: string | null;
	coupon: { code: string; kind: 'offer' | 'referral' } | null;
	coupon_error: string;
};

export type TCheckout = {
	subscription_id: string;
	status: TSubscriptionStatus;
	payable_paise: number;
	razorpay: {
		key_id: string;
		subscription_id: string;
		name: string;
		prefill: { name: string; email: string; contact: string };
	} | null;
};

export type TSubscription = {
	id: string;
	plan: TPlan | null;
	tenure: TTenure;
	ip: string | null;
	broker_account_id: string | null;
	status: TSubscriptionStatus;
	auto_renew: boolean;
	provider: string;
	started_at: string | null;
	expires_at: string | null;
	cancelled_at: string | null;
	created_at: string | null;
};

export type TPayment = {
	id: string;
	subscription_id: string;
	amount_paise: number;
	discount_paise: number;
	period_start: string | null;
	period_end: string | null;
	status: 'captured' | 'failed' | 'refunded';
	paid_at: string | null;
};

export type TOverview = { subscriptions: TSubscription[]; payments: TPayment[] };

export type TEntitlements = { features: string[]; broker_accounts: string[] };

export type TReferral = {
	code: string | null;
	used_count: number;
	max_uses: number;
	discount_percent: number;
	reward_percent: number;
	referrals: number;
	pending_paise: number;
	paid_paise: number;
	referred_by: string | null;
	apply_until: string | null;
	can_apply: boolean;
};

export type TRazorpayResponse = {
	razorpay_payment_id: string;
	razorpay_subscription_id: string;
	razorpay_signature: string;
};
