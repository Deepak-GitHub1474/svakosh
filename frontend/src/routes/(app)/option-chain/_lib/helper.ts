import { SEGMENT_SYMBOL } from './const';
import type { TChainId } from './types';

export function parseChainId(id: string): TChainId | null {
	const parts = id.split('_');
	if (parts.length < 4) return null;
	const segmentCode = parts[1];
	return {
		id,
		exchange: parts[0],
		symbol: SEGMENT_SYMBOL[segmentCode] ?? segmentCode,
		expiry: parts[2]
	};
}

export function visibleStrikes(all: string[], atm: string, range: number): string[] {
	if (all.length === 0) return [];
	const sorted = [...all].sort((a, b) => Number(a) - Number(b));
	const atmValue = Number(atm);

	let atmIndex = sorted.findIndex((strike) => Number(strike) === atmValue);
	if (atmIndex === -1) {
		let closestDistance = Infinity;
		sorted.forEach((strike, position) => {
			const distance = Math.abs(Number(strike) - atmValue);
			if (distance < closestDistance) {
				closestDistance = distance;
				atmIndex = position;
			}
		});
	}

	const firstVisible = Math.max(0, atmIndex - range);
	const lastVisible = Math.min(sorted.length, atmIndex + range + 1);
	return sorted.slice(firstVisible, lastVisible);
}

export function nearestAtm(spot: number, step: number): string {
	if (!step) return String(Math.round(spot));
	return String(Math.round(spot / step) * step);
}

export function timeToExpiry(expiry: string): number {
	const now = new Date();
	const hour = now.getHours();
	const minute = now.getMinutes();

	if (hour > 15 || (hour === 15 && minute > 30)) {
		now.setHours(15, 30, 0, 0);
	} else if (hour < 9) {
		now.setDate(now.getDate() - 1);
		now.setHours(15, 30, 0, 0);
	}

	const [year, month, day] = expiry.split('-').map(Number);
	if (!year || !month || !day) return 0;

	const expiryClose = new Date(year, month - 1, day, 15, 30, 0, 0);
	const remainingMinutes = (expiryClose.getTime() - now.getTime()) / 60000;
	return Math.max(remainingMinutes / 525600, 0);
}

export function daysToExpiry(expiry: string): number {
	const [year, month, day] = expiry.split('-').map(Number);
	if (!year || !month || !day) return 0;
	const expiryClose = new Date(year, month - 1, day, 15, 30, 0, 0);
	const remainingMs = expiryClose.getTime() - Date.now();
	return Math.max(Math.ceil(remainingMs / 86400000), 0);
}

export function expiryLabel(expiry: string): string {
	const [year, month, day] = expiry.split('-').map(Number);
	if (!year || !month || !day) return expiry;
	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
	return `${String(day).padStart(2, '0')} ${monthNames[month - 1]} ${year}`;
}

export function formatLakh(value: number | undefined): string {
	if (!value) return '—';
	return (value / 100000).toFixed(2);
}

export function changePct(current?: number, previous?: number): number | null {
	if (current === undefined || !previous) return null;
	return ((current - previous) / previous) * 100;
}

export function oiChangePct(oi: number | undefined, prev: number | undefined): number | null {
	if (oi === undefined || !prev) return null;
	return ((oi - prev) / prev) * 100;
}

export function formatDecimal(value: number | undefined, places = 2): string {
	if (value === undefined || Number.isNaN(value)) return '—';
	return value.toFixed(places);
}

export function formatSigned(value: number, places = 2): string {
	return `${value >= 0 ? '+' : ''}${value.toFixed(places)}`;
}

export function spotMarkerIndex(strikes: string[], spot: number | undefined): number | null {
	if (spot === undefined || strikes.length === 0) return null;
	const above = strikes.findIndex((strike) => Number(strike) > spot);
	return above === -1 ? strikes.length : above;
}
