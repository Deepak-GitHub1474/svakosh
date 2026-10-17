import { getBars } from './service';
import type { TBars } from './types';

const RELOAD_DELAY_MS = 5000;

export class TodayBars {
	data = $state<TBars>({});
	#timer: ReturnType<typeof setTimeout> | undefined;
	#request = 0;

	async load(subject: string, prefix: string, interval: number, minutes = 0): Promise<void> {
		clearTimeout(this.#timer);
		const id = ++this.#request;
		if (!subject) return;
		const res = await getBars(subject, prefix, interval, minutes);
		if (id !== this.#request) return;
		if (res.ok) this.data = res.data;
		const step = interval * 60_000;
		this.#timer = setTimeout(
			() => this.load(subject, prefix, interval, minutes),
			step - (Date.now() % step) + RELOAD_DELAY_MS
		);
	}

	stop() {
		clearTimeout(this.#timer);
		this.#request++;
	}
}
