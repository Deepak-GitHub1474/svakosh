import type { TPosition, TSide } from './types';

const EXPIRY = /^\d{8}$/;

const todayIST = () =>
	new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).replaceAll('-', '');

export const isExpired = (token = '') => {
	const expiry = token.split(':')[3] ?? '';
	return EXPIRY.test(expiry) && expiry < todayIST();
};

export const exitSide = (quantity: number): TSide => (quantity > 0 ? 'SELL' : 'BUY');

export function positionPnl(p: TPosition, ltp?: number): number | null {
	if (!p.quantity) return p.sell_value - p.buy_value;
	if (!ltp) return null;
	return p.sell_value - p.buy_value + ltp * p.quantity;
}
