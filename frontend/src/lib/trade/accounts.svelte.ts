import { ACCOUNT_KEY, ORDER_ACCOUNTS_KEY } from './const';
import { brokerOf } from './brokers';
import { connectSession, getLoginUrl, listAccounts } from './service';
import type { TBrokerAccount } from './types';

function saved(): string {
	try {
		return localStorage.getItem(ACCOUNT_KEY) ?? '';
	} catch {
		return '';
	}
}

function savedOrderIds(): string[] {
	try {
		const ids = JSON.parse(localStorage.getItem(ORDER_ACCOUNTS_KEY) ?? '[]');
		return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

class TradeAccounts {
	list = $state<TBrokerAccount[]>([]);
	loaded = $state(false);
	error = $state('');
	selectedId = $state('');
	selected = $derived(
		this.list.find((a) => a.id === this.selectedId && a.logged_in) ??
			this.list.find((a) => a.logged_in) ??
			this.list[0]
	);
	accountId = $derived(this.selected?.id ?? '');
	loggedIn = $derived(this.list.filter((a) => a.logged_in));
	orderIds = $state<string[]>([]);
	orderAccounts = $derived.by(() => {
		const chosen = this.loggedIn.filter((a) => this.orderIds.includes(a.id));
		if (chosen.length) return chosen;
		return this.selected?.logged_in ? [this.selected] : [];
	});

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
		if (!this.orderIds.length) this.orderIds = savedOrderIds();
	}

	async login(id: string): Promise<{ error?: string; redirected?: boolean }> {
		const account = this.list.find((a) => a.id === id);
		if (account && brokerOf(account.broker)?.autoLogin) {
			const res = await connectSession(id, { login: 'api_key' });
			if (res.ok) this.select(id);
			await this.load();
			return res.ok ? {} : { error: res.error };
		}
		const res = await getLoginUrl(id);
		if (!res.ok) return { error: res.error };
		window.location.assign(res.data.url);
		return { redirected: true };
	}

	toggleOrderAccount(id: string) {
		const current = this.orderAccounts.map((a) => a.id);
		const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
		if (!next.length) return;
		this.orderIds = next;
		try {
			localStorage.setItem(ORDER_ACCOUNTS_KEY, JSON.stringify(next));
		} catch {
			return;
		}
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
