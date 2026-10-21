<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { OPEN_STATUSES, STATUS_TONE, TABLE, EMPTY_STATE } from '$lib/trade/const';
	import { instrumentOf, timeOf } from '$lib/trade/format';
	import { tradeResource } from '$lib/trade/resource.svelte';
	import { cancelOrder, getOrderHistory, getOrders, modifyOrder } from '$lib/trade/service';
	import type { TBrokerOrder, TOrderRecord } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	const VIEWS = [
		{ label: 'Today', value: 'today' },
		{ label: 'History', value: 'history' }
	];

	let view = $state('today');
	let editing = $state<TBrokerOrder | null>(null);
	let modifyOpen = $state(false);
	let quantity = $state('');
	let price = $state('');
	let trigger = $state('');
	let busy = $state('');

	const book = tradeResource<TBrokerOrder[]>(getOrders, [], 5_000);
	const history = tradeResource<TOrderRecord[]>((id) => getOrderHistory(id, 100), [], 30_000);

	const rows = $derived([...book.data].sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
	const needsPrice = $derived(editing?.type === 'LIMIT' || editing?.type === 'SL');
	const needsTrigger = $derived(editing?.type === 'SL' || editing?.type === 'SL-M');
	const isOpen = (o: TBrokerOrder) => OPEN_STATUSES.includes(o.status);

	function startModify(order: TBrokerOrder) {
		editing = order;
		quantity = String(order.quantity);
		price = order.price ? String(order.price) : '';
		trigger = order.trigger_price ? String(order.trigger_price) : '';
		modifyOpen = true;
	}

	async function refresh() {
		await Promise.all([book.reload(), history.reload()]);
	}

	async function cancel(order: TBrokerOrder) {
		busy = order.order_id;
		const res = await cancelOrder(order.order_id, tradeAccounts.accountId, order.type);
		busy = '';
		if (!res.ok) {
			toast.error({ title: 'Could not cancel', description: res.error });
			return;
		}
		toast.success({ title: 'Cancel sent', description: order.symbol });
		await refresh();
	}

	async function submitModify(event: SubmitEvent) {
		event.preventDefault();
		if (!editing?.token || busy) return;
		busy = editing.order_id;
		const res = await modifyOrder(editing.order_id, {
			account_id: tradeAccounts.accountId,
			token: editing.token,
			side: editing.side,
			product: editing.product,
			type: editing.type,
			quantity: Number(quantity),
			price: needsPrice ? Number(price) : 0,
			trigger_price: needsTrigger ? Number(trigger) : 0
		});
		busy = '';
		if (!res.ok) {
			toast.error({ title: 'Could not modify', description: res.error });
			return;
		}
		toast.success({ title: 'Modify sent', description: editing.symbol });
		modifyOpen = false;
		await refresh();
	}
</script>

<div class="mb-4">
	<SvaKoshTabs
		tabs={VIEWS}
		activeTab={view}
		onTabChange={(next: string) => (view = next)}
		class="w-fit"
	/>
</div>

{#if view === 'today'}
	{#if book.loading && !book.data.length}
		<div class="relative h-40"><SvaKoshLoader inline message="" /></div>
	{:else if book.error && !book.data.length}
		<EmptyState
			class={EMPTY_STATE}
			title="Could not load orders"
			description={book.error}
			actionLabel="Retry"
			onAction={book.reload}
		/>
	{:else if !rows.length}
		<EmptyState
			class={EMPTY_STATE}
			title="No orders today"
			description="Orders you place will show here with live status."
		/>
	{:else}
		<div class={TABLE.wrap}>
			<table class={TABLE.table}>
				<thead>
					<tr class={TABLE.head}>
						<th class={TABLE.th}>Time</th>
						<th class={TABLE.th}>Instrument</th>
						<th class={TABLE.th}>Side</th>
						<th class={TABLE.th}>Type</th>
						<th class="{TABLE.th} text-right">Qty</th>
						<th class="{TABLE.th} text-right">Price</th>
						<th class={TABLE.th}>Status</th>
						<th class="{TABLE.th} text-right"></th>
					</tr>
				</thead>
				<tbody class={TABLE.body}>
					{#each rows as o (o.order_id)}
						<tr class={TABLE.row}>
							<td class="{TABLE.td} text-muted-foreground">{timeOf(o.updated_at)}</td>
							<td class={TABLE.td}>
								{o.symbol}
								<span class="text-muted-foreground ml-1 text-xs">{o.exchange}</span>
							</td>
							<td class="{TABLE.td} {o.side === 'BUY' ? 'text-bullish' : 'text-bearish'}"
								>{o.side}</td
							>
							<td class="{TABLE.td} text-muted-foreground">{o.type} · {o.product}</td>
							<td class="{TABLE.td} text-right">{o.filled_quantity}/{o.quantity}</td>
							<td class="{TABLE.td} text-right">
								{formatNumber(o.average_price || o.price)}
								{#if o.trigger_price}<span class="text-muted-foreground ml-1 text-xs"
										>trg {formatNumber(o.trigger_price)}</span
									>{/if}
							</td>
							<td class="{TABLE.td} {STATUS_TONE[o.status]}" title={o.message ?? ''}>
								{o.status.replace('_', ' ')}
								{#if o.message}<p class="text-muted-foreground max-w-56 truncate text-xs">
										{o.message}
									</p>{/if}
							</td>
							<td class="{TABLE.td} text-right">
								{#if isOpen(o)}
									<div class="flex justify-end gap-4">
										<button
											type="button"
											class="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
											disabled={!o.token || busy === o.order_id}
											onclick={() => startModify(o)}>Modify</button
										>
										<button
											type="button"
											class="text-bearish/80 hover:text-bearish transition-colors disabled:opacity-50"
											disabled={busy === o.order_id}
											onclick={() => cancel(o)}>Cancel</button
										>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{:else if history.loading && !history.data.length}
	<div class="relative h-40"><SvaKoshLoader inline message="" /></div>
{:else if history.error && !history.data.length}
	<EmptyState
		class={EMPTY_STATE}
		title="Could not load history"
		description={history.error}
		actionLabel="Retry"
		onAction={history.reload}
	/>
{:else if !history.data.length}
	<EmptyState
		class={EMPTY_STATE}
		title="No order history"
		description="Orders placed from Svakosh will show here."
	/>
{:else}
	<div class={TABLE.wrap}>
		<table class={TABLE.table}>
			<thead>
				<tr class={TABLE.head}>
					<th class={TABLE.th}>Placed</th>
					<th class={TABLE.th}>Instrument</th>
					<th class={TABLE.th}>Side</th>
					<th class={TABLE.th}>Type</th>
					<th class="{TABLE.th} text-right">Qty</th>
					<th class="{TABLE.th} text-right">Price</th>
					<th class={TABLE.th}>Status</th>
				</tr>
			</thead>
			<tbody class={TABLE.body}>
				{#each history.data as o (o.id)}
					<tr class={TABLE.row}>
						<td class="{TABLE.td} text-muted-foreground">{timeOf(o.created_at)}</td>
						<td class={TABLE.td}>{instrumentOf(o.token)}</td>
						<td class="{TABLE.td} {o.side === 'BUY' ? 'text-bullish' : 'text-bearish'}">{o.side}</td
						>
						<td class="{TABLE.td} text-muted-foreground">{o.type} · {o.product}</td>
						<td class="{TABLE.td} text-right">{o.filled_quantity}/{o.quantity}</td>
						<td class="{TABLE.td} text-right">{formatNumber(o.average_price || o.price)}</td>
						<td class="{TABLE.td} {STATUS_TONE[o.status]}" title={o.message ?? ''}>
							{o.status.replace('_', ' ')}
							{#if o.message}<p class="text-muted-foreground max-w-56 truncate text-xs">
									{o.message}
								</p>{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<SvaKoshModal bind:isOpen={modifyOpen} width="22rem" class="overflow-hidden">
	{#if editing}
		<ModalHeader
			title={`Modify ${editing.symbol}`}
			subtitle={`${editing.side} · ${editing.type} · ${editing.product}`}
			onClose={() => (modifyOpen = false)}
		/>
		<form class="flex flex-col gap-4 p-4" onsubmit={submitModify}>
			<div>
				<SvaKoshLabel for="modify-qty">Quantity</SvaKoshLabel>
				<SvaKoshInput
					id="modify-qty"
					placeholder="Quantity"
					bind:value={quantity}
					type="number"
					inputmode="numeric"
					min="1"
					step="1"
				/>
			</div>
			{#if needsPrice}
				<div>
					<SvaKoshLabel for="modify-price">Price</SvaKoshLabel>
					<SvaKoshInput
						id="modify-price"
						placeholder="Limit price"
						bind:value={price}
						type="number"
						inputmode="decimal"
						min="0"
						step="0.05"
					/>
				</div>
			{/if}
			{#if needsTrigger}
				<div>
					<SvaKoshLabel for="modify-trigger">Trigger price</SvaKoshLabel>
					<SvaKoshInput
						id="modify-trigger"
						placeholder="Trigger price"
						bind:value={trigger}
						type="number"
						inputmode="decimal"
						min="0"
						step="0.05"
					/>
				</div>
			{/if}
			<SvaKoshButton
				type="submit"
				variant="primary"
				label={busy ? 'Sending…' : 'Modify order'}
				disabled={!!busy || Number(quantity) < 1}
			/>
		</form>
	{/if}
</SvaKoshModal>
