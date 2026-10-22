import { marketFeed } from '$lib/market/feed.svelte';

class OrderUpdates {
	version = $state(0);

	follow() {
		return marketFeed.followOrders(() => this.version++);
	}
}

export const orderUpdates = new OrderUpdates();
