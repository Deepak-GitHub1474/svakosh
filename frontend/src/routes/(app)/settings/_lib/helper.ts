import type { PasskeyResult } from './types';

function toDate(iso: string | null): Date | null {
	if (!iso) return null;
	const hasTz = /(?:z|[+-]\d\d:?\d\d)$/i.test(iso);
	const d = new Date(hasTz ? iso : `${iso}Z`);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(iso: string | null): string {
	const d = toDate(iso);
	if (!d) return '—';
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(iso: string | null): string {
	if (!iso) return 'Never';
	const d = toDate(iso);
	if (!d) return '—';
	const s = Math.floor((Date.now() - d.getTime()) / 1000);
	if (s < 60) return 'Just now';
	const m = Math.floor(s / 60);
	if (m < 60) return `${m} min${m > 1 ? 's' : ''} ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
	const dd = Math.floor(h / 24);
	if (dd < 30) return `${dd} day${dd > 1 ? 's' : ''} ago`;
	return formatDate(iso);
}

export function deviceIcon(name: string | null): string {
	const n = (name ?? '').toLowerCase();
	if (n.includes('iphone') || n.includes('android') || n.includes('phone') || n.includes('mobile'))
		return 'smartphone';
	if (n.includes('ipad') || n.includes('tablet')) return 'tablet';
	if (n.includes('mac')) return 'laptop_mac';
	if (n.includes('win')) return 'desktop_windows';
	if (n.includes('linux')) return 'computer';
	return 'passkey';
}

function deviceLabel(): string {
	if (typeof navigator === 'undefined') return 'Passkey';
	const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
	return nav.userAgentData?.platform || nav.platform || 'This device';
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
	return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function registerPasskey(): Promise<PasskeyResult> {
	try {
		const beginRes = await fetch('/api/passkey/register/begin', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: '{}'
		});
		const beginJson = await readJson(beginRes);
		if (!beginRes.ok || !beginJson?.success) {
			return { ok: false, message: (beginJson?.message as string) ?? 'Could not start passkey setup.' };
		}

		const { startRegistration } = await import('@simplewebauthn/browser');
		const attestation = await startRegistration({
			optionsJSON: beginJson.data as Parameters<typeof startRegistration>[0]['optionsJSON']
		});

		const completeRes = await fetch('/api/passkey/register/complete', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ credential: attestation, device_name: deviceLabel() })
		});
		const completeJson = await readJson(completeRes);
		if (!completeRes.ok || !completeJson?.success) {
			return { ok: false, message: (completeJson?.message as string) ?? 'Failed to add passkey.' };
		}
		return { ok: true };
	} catch (e) {
		if (e instanceof Error && (e.name === 'NotAllowedError' || e.name === 'AbortError')) {
			return { ok: false };
		}
		return { ok: false, message: e instanceof Error && e.message ? e.message : 'Failed to add passkey.' };
	}
}

export async function deletePasskey(id: string): Promise<PasskeyResult> {
	try {
		const res = await fetch(`/api/passkey/${encodeURIComponent(id)}`, { method: 'DELETE' });
		const json = await readJson(res);
		if (!res.ok || !json?.success) {
			return { ok: false, message: (json?.message as string) ?? 'Failed to remove passkey.' };
		}
		return { ok: true };
	} catch {
		return { ok: false, message: 'Failed to remove passkey.' };
	}
}

export async function deleteAllPasskeys(): Promise<PasskeyResult> {
	try {
		const res = await fetch('/api/passkey/remove-all', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: '{}'
		});
		const json = await readJson(res);
		if (!res.ok || !json?.success) {
			return { ok: false, message: (json?.message as string) ?? 'Failed to remove passkeys.' };
		}
		return { ok: true };
	} catch {
		return { ok: false, message: 'Failed to remove passkeys.' };
	}
}
