const IST_TIME = new Intl.DateTimeFormat('en-IN', {
	timeZone: 'Asia/Kolkata',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
});
const IST_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });
const IST_DATE_TIME = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'Asia/Kolkata',
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false
});

export const SESSION_START_MINUTES = 9 * 60 + 15;
export const SESSION_END_MINUTES = 15 * 60 + 40;

export function istTime(ts: number): string {
	return IST_TIME.format(ts);
}

export function istDate(ts: number): string {
	return IST_DATE.format(ts);
}

export function istDateTime(ts: number): string {
	return IST_DATE_TIME.format(ts).replaceAll('/', '-');
}

export function istMinutes(ts: number): number {
	const [h, m] = IST_TIME.format(ts).split(':').map(Number);
	return h * 60 + m;
}

export function inSession(ts: number): boolean {
	const minutes = istMinutes(ts);
	return minutes >= SESSION_START_MINUTES && minutes < SESSION_END_MINUTES;
}
