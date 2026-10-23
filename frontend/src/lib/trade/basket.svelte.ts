import { BASKET_KEY, MAX_BASKET_LEGS } from './const';
import type { TBasket, TLeg } from './types';

type TDraft = { id: string; name: string; legs: TLeg[] };

function read(): TDraft {
	try {
		const draft = JSON.parse(localStorage.getItem(BASKET_KEY) ?? '') as TDraft;
		if (Array.isArray(draft.legs)) return draft;
	} catch {
		return { id: '', name: '', legs: [] };
	}
	return { id: '', name: '', legs: [] };
}

class BasketDraft {
	id = $state('');
	name = $state('');
	legs = $state<TLeg[]>([]);
	private ready = false;

	load() {
		if (this.ready || typeof localStorage === 'undefined') return;
		this.ready = true;
		const draft = read();
		this.id = draft.id;
		this.name = draft.name;
		this.legs = draft.legs.slice(0, MAX_BASKET_LEGS);
	}

	add(leg: TLeg) {
		this.load();
		if (this.legs.length >= MAX_BASKET_LEGS) return false;
		this.legs.push(leg);
		this.save();
		return true;
	}

	update(index: number, patch: Partial<TLeg>) {
		Object.assign(this.legs[index], patch);
		this.save();
	}

	remove(index: number) {
		this.legs.splice(index, 1);
		this.save();
	}

	open(basket: TBasket) {
		this.id = basket.id;
		this.name = basket.name;
		this.legs = basket.legs.map((leg) => ({ ...leg }));
		this.save();
	}

	saved(basket: TBasket) {
		this.id = basket.id;
		this.name = basket.name;
		this.save();
	}

	clear() {
		this.id = '';
		this.name = '';
		this.legs = [];
		this.save();
	}

	save() {
		try {
			localStorage.setItem(
				BASKET_KEY,
				JSON.stringify({ id: this.id, name: this.name, legs: this.legs })
			);
		} catch {
			return;
		}
	}
}

export const basketDraft = new BasketDraft();
