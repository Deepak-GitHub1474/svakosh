import type { SubmitFunction } from '@sveltejs/kit';
import { REQUEST_TIMEOUT_MS } from './const';

export function safeSubmit(
	setBusy: (busy: boolean) => void,
	onSuccess?: () => void
): SubmitFunction {
	return () => {
		setBusy(true);
		let timedOut = false;
		const timer = setTimeout(() => {
			timedOut = true;
			setBusy(false);
		}, REQUEST_TIMEOUT_MS);
		return async ({ update, result }) => {
			clearTimeout(timer);
			if (timedOut) return;
			await update();
			setBusy(false);
			if (result.type === 'success') onSuccess?.();
		};
	};
}

export function formatNumber(v: number): string {
	return (v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatLakh(v: number): string {
	return formatNumber((v || 0) / 100000) + 'L';
}

export function roundLakh(v: number): number {
	return Math.round((v + Number.EPSILON) * 100) / 100;
}

export function getInitials(name: string | null | undefined): string {
	return (name ?? '')
		.trim()
		.split(/\s+/)
		.map((p) => p[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();
}
