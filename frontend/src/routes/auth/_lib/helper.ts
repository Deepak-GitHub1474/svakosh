import type { ActionResult } from '@sveltejs/kit';
import { toast } from '$lib/components/svakosh/toast.svelte';
import type { TOtpErrorData } from './types';

type TAuthResult = { message?: unknown; error?: TOtpErrorData } | null | undefined;

function retryText(secs?: number | null): string {
	if (!secs || secs <= 0) return '15 min';
	if (secs < 60) return `${secs} sec`;
	return `${Math.ceil(secs / 60)} min`;
}

function otpDetail(error: TOtpErrorData): string | undefined {
	if (!error) return undefined;
	if (error.is_blocked) return 'Account permanently blocked. Contact support.';
	if (error.locked || error.code === 'OTP_LOCKED') {
		return `Too many wrong attempts. Try again in ${retryText(error.retry_after_seconds)}.`;
	}
	if (error.attempts_used && error.attempts_remaining != null) {
		return `Wrong attempts: ${error.attempts_used} · Remaining: ${error.attempts_remaining}`;
	}
	return undefined;
}

export function toastAuthResult(result: ActionResult): void {
	if (result.type !== 'success' && result.type !== 'failure') return;
	const data = result.data as TAuthResult;
	const message = String(data?.error?.message ?? data?.message ?? '');
	if (!message) return;
	if (result.type === 'failure' || data?.error)
		toast.error({ title: message, description: otpDetail(data?.error ?? null) });
	else toast.success({ description: message });
}
