import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { toast } from '$lib/components/svakosh/toast.svelte';
import { placeOrder } from './service';
import type { TPlaceOrder } from './types';

export async function sendOrder(order: TPlaceOrder, label: string, quiet = false) {
	const res = await placeOrder(order);
	if (!res.ok) {
		toast.error({ title: `${label} failed`, description: res.error });
		return false;
	}
	const { status, message } = res.data;
	if (status === 'REJECTED' || status === 'FAILED') {
		toast.error({ title: `${label} rejected`, description: message });
		return false;
	}
	if (quiet) return true;
	if (status === 'UNKNOWN') {
		toast.warning({
			title: `${label} sent`,
			description: 'Broker did not confirm yet. Check Orders.'
		});
	} else {
		toast.success({
			title: `${label} placed`,
			action: { label: 'Orders', onClick: () => goto(resolve('/trade/orders')) }
		});
	}
	return true;
}
