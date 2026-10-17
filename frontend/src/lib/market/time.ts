const IST_TIME = new Intl.DateTimeFormat('en-IN', {
	timeZone: 'Asia/Kolkata',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
});
const IST_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });

export const SESSION_START_MINUTES = 9 * 60 + 15;
export const SESSION_END_MINUTES = 15 * 60 + 30;

export function istTime(ts: number): string {
	return IST_TIME.format(ts);
}

export function istDate(ts: number): string {
	return IST_DATE.format(ts);
}

export function istMinutes(ts: number): number {
	const [h, m] = IST_TIME.format(ts).split(':').map(Number);
	return h * 60 + m;
}

export function inSession(ts: number): boolean {
	const minutes = istMinutes(ts);
	return minutes >= SESSION_START_MINUTES && minutes < SESSION_END_MINUTES;
}
