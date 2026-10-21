import { ACCOUNT_KEY } from './const';
import { getLoginUrl, listAccounts } from './service';
import type { TBrokerAccount } from './types';

function saved(): string {
	try {
		return localStorage.getItem(ACCOUNT_KEY) ?? '';
	} catch {
		return '';
	}
}

class TradeAccounts {
	list = $state<TBrokerAccount[]>([]);
	loaded = $state(false);
	error = $state('');
	selectedId = $state('');
	selected = $derived(this.list.find((a) => a.id === this.selectedId) ?? this.list[0]);
	accountId = $derived(this.selected?.id ?? '');

	async load() {
		const res = await listAccounts();
		this.loaded = true;
		if (!res.ok) {
			this.error = res.error;
			return;
		}
		this.error = '';
		this.list = res.data;
		if (!this.selectedId) this.selectedId = saved();
	}

	async login(id: string): Promise<string | null> {
		const res = await getLoginUrl(id);
		if (!res.ok) return res.error;
		window.location.assign(res.data.url);
		return null;
	}

	select(id: string) {
		this.selectedId = id;
		try {
			localStorage.setItem(ACCOUNT_KEY, id);
		} catch {
			return;
		}
	}
}

export const tradeAccounts = new TradeAccounts();

export const accountLabel = (a: TBrokerAccount) =>
	a.account_tag ? `${a.account_tag} · ${a.client_id}` : a.client_id;
