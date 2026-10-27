import appIcon from '$lib/assets/svakosh/apple-touch-icon.png?inline';
import { BRAND } from '$lib/brand';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import {
	GST_PERCENT,
	IP_LABELS,
	PAYMENT_STATUS_LABELS,
	PLAN_CODES,
	RAZORPAY_SCRIPT
} from './const';
import type { TCheckout, TPlan, TPrice, TRazorpayResponse, TSubscription, TTenure } from './types';

type TRazorpayInstance = {
	open: () => void;
	on: (event: string, fn: (e: unknown) => void) => void;
};
type TRazorpayCtor = new (options: Record<string, unknown>) => TRazorpayInstance;

let loading: Promise<TRazorpayCtor> | null = null;

export const rupees = (paise: number) => {
	const digits = paise % 100 ? 2 : 0;
	return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};

export const shortDate = (iso: string | null) =>
	iso
		? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
		: '—';

export const ipSupported = (plan: TPlan, broker: string | null, ip: string | null) => {
	const allowed = plan.ip_brokers[ip ?? ''];
	return !allowed || (broker !== null && allowed.includes(broker));
};

export function matchPrice(
	plan: TPlan,
	tenure: TTenure,
	broker: string | null,
	ip: string | null
): TPrice | null {
	if (!ipSupported(plan, broker, ip)) return null;
	let best: TPrice | null = null;
	let bestScore = -1;
	for (const entry of plan.prices) {
		if (entry.tenure !== tenure) continue;
		if (entry.broker !== null && entry.broker !== broker) continue;
		if (entry.ip !== null && entry.ip !== ip) continue;
		const score = (entry.broker !== null ? 2 : 0) + (entry.ip !== null ? 1 : 0);
		if (score > bestScore) {
			best = entry;
			bestScore = score;
		}
	}
	return best;
}

function loadRazorpay(): Promise<TRazorpayCtor> {
	const existing = (window as unknown as { Razorpay?: TRazorpayCtor }).Razorpay;
	if (existing) return Promise.resolve(existing);
	loading ??= new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = RAZORPAY_SCRIPT;
		script.onload = () => resolve((window as unknown as { Razorpay: TRazorpayCtor }).Razorpay);
		script.onerror = () => {
			loading = null;
			reject(new Error('Payment window could not load. Check your connection and try again.'));
		};
		document.head.appendChild(script);
	});
	return loading;
}

export const includedGst = (paise: number) =>
	Math.round((paise * GST_PERCENT) / (100 + GST_PERCENT));

export const renewal = (sub: TSubscription) => {
	if (!sub.expires_at)
		return { label: 'Renewal', value: sub.status === 'pending' ? 'Awaiting payment' : '—' };
	const label = sub.status === 'expired' ? 'Ended' : sub.auto_renew ? 'Renews' : 'Ends';
	return { label, value: shortDate(sub.expires_at) };
};

export const lastPayment = (sub: TSubscription) => {
	const payment = sub.payments?.[0];
	return {
		status: payment ? (PAYMENT_STATUS_LABELS[payment.status] ?? payment.status) : '—',
		reference: payment?.reference || '—',
		period: payment ? `${shortDate(payment.period_start)} – ${shortDate(payment.period_end)}` : '—'
	};
};

export const planMeta = (sub: TSubscription, target: string) =>
	[target, sub.ip ? (IP_LABELS[sub.ip] ?? sub.ip) : ''].filter(Boolean).join(' · ');

export const paidTotal = (sub: TSubscription) =>
	(sub.payments ?? []).reduce(
		(sum, p) => (p.status === 'captured' ? sum + p.amount_paise : sum),
		0
	);

export async function openRazorpay(
	checkout: TCheckout,
	handlers: {
		onPaid: (res: TRazorpayResponse) => void;
		onDismiss: () => void;
		onFailed: (reason: string) => void;
	}
) {
	if (!checkout.razorpay) return;
	const Razorpay = await loadRazorpay();
	const instance = new Razorpay({
		key: checkout.razorpay.key_id,
		subscription_id: checkout.razorpay.subscription_id,
		name: BRAND.wordmark,
		image: appIcon,
		description: BRAND.tagline,
		prefill: checkout.razorpay.prefill,
		handler: handlers.onPaid,
		modal: { ondismiss: handlers.onDismiss }
	});
	instance.on('payment.failed', (e) => {
		const reason = (e as { error?: { description?: string } }).error?.description;
		handlers.onFailed(reason ?? 'The payment did not go through.');
	});
	instance.open();
}

export function openPage(path: string, params: Record<string, string> = {}) {
	const url = new URL(path, window.location.origin);
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
	return goto(url.href);
}

export const subscribeAction = (accountId: string) => ({
	label: 'Subscribe',
	onClick: () => openPage(resolve('/pricing'), { plan: PLAN_CODES.broker, account: accountId })
});
