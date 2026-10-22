<script lang="ts">
	import { onMount } from 'svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import AccountCell from '$lib/components/trade/AccountCell.svelte';
	import InstrumentCell from '$lib/components/trade/InstrumentCell.svelte';
	import Info from '$lib/components/svg-provider/Info.svelte';
	import TradeTable from '$lib/components/trade/TradeTable.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import {
		OPEN_STATUSES,
		ORDERS_FILTER_KEY,
		ORDERS_VIEW_KEY,
		STATUS_TONE,
		TABLE,
		TRADES_SIDE_KEY
	} from '$lib/trade/const';
	import { recall, remember } from '$lib/trade/storage';
	import { instrumentOf, timeOf } from '$lib/trade/format';
	import { instrumentNames, plainSymbol } from '$lib/trade/names.svelte';
	import { tradeResource, type TAccountRow } from '$lib/trade/resource.svelte';
	import {
		cancelOrder,
		getOrderHistory,
		getOrders,
		getTrades,
		modifyOrder
	} from '$lib/trade/service';
	import type { TBrokerOrder, TOrderRecord, TOrderStatus, TTrade } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	const VIEWS = [
		{ label: 'Today', value: 'today' },
		{ label: 'Trades', value: 'trades' },
		{ label: 'History', value: 'history' }
	];

	type TFilter = 'all' | 'open' | 'executed' | 'cancelled' | 'rejected';
	type TSideFilter = 'all' | 'BUY' | 'SELL';

	const SIDES: TSideFilter[] = ['all', 'BUY', 'SELL'];

	const FILTER_STATUSES: Record<Exclude<TFilter, 'all'>, TOrderStatus[]> = {
		open: ['OPEN', 'TRIGGER_PENDING', 'PENDING', 'UNKNOWN'],
		executed: ['COMPLETE'],
		cancelled: ['CANCELLED'],
		rejected: ['REJECTED', 'FAILED']
	};
	const FILTER_LABELS: Record<TFilter, string> = {
		all: 'All',
		open: 'Open',
		executed: 'Executed',
		cancelled: 'Cancelled',
		rejected: 'Rejected'
	};

	let view = $state('today');
	let filter = $state<TFilter>('all');
	let side = $state<TSideFilter>('all');
	type TReason = {
		status: TOrderStatus;
		message?: string;
		symbol: string;
		side: string;
		type: string;
		product: string;
	};

	let reason = $state<TReason | null>(null);
	let editing = $state<TBookRow | null>(null);
	let modifyOpen = $state(false);
	let quantity = $state('');
	let price = $state('');
	let trigger = $state('');
	let busy = $state('');

	type TBookRow = TAccountRow<TBrokerOrder>;

	const book = tradeResource<TBrokerOrder>(getOrders);
	const history = tradeResource<TOrderRecord>((id) => getOrderHistory(id, 100));
	const trades = tradeResource<TTrade>(getTrades);

	const allRows = $derived([...book.data].sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
	const matches = (status: TOrderStatus, f: TFilter) =>
		f === 'all' || FILTER_STATUSES[f].includes(status);
	const rows = $derived(allRows.filter((o) => matches(o.status, filter)));
	const historyRows = $derived(history.data.filter((o) => matches(o.status, filter)));
	const tradeRows = $derived(trades.data.filter((t) => side === 'all' || t.side === side));
	const statusTabs = $derived.by(() => {
		const list = view === 'history' ? history.data : allRows;
		return (Object.keys(FILTER_LABELS) as TFilter[]).map((f) => ({
			label: `${FILTER_LABELS[f]} (${list.filter((o) => matches(o.status, f)).length})`,
			value: f
		}));
	});
	const sideTabs = $derived(
		SIDES.map((v) => ({
			label: `${v === 'all' ? 'All' : v === 'BUY' ? 'Buy' : 'Sell'} (${
				v === 'all' ? trades.data.length : trades.data.filter((t) => t.side === v).length
			})`,
			value: v
		}))
	);
	const tokens = $derived(
		[
			...book.data.map((o) => o.token),
			...trades.data.map((t) => t.token),
			...history.data.map((o) => o.token)
		]
			.filter((t): t is string => !!t)
			.join(',')
	);

	$effect(() => {
		if (tokens) instrumentNames.want(tokens.split(','));
	});

	const needsPrice = $derived(editing?.type === 'LIMIT' || editing?.type === 'SL');
	const needsTrigger = $derived(editing?.type === 'SL' || editing?.type === 'SL-M');
	const isOpen = (o: TBookRow) => OPEN_STATUSES.includes(o.status);

	function setView(next: string) {
		view = next;
		remember(ORDERS_VIEW_KEY, next);
	}

	function setFilter(next: TFilter) {
		filter = next;
		remember(ORDERS_FILTER_KEY, next);
	}

	function setSide(next: TSideFilter) {
		side = next;
		remember(TRADES_SIDE_KEY, next);
	}

	onMount(() => {
		view =
			recall(
				ORDERS_VIEW_KEY,
				VIEWS.map((v) => v.value)
			) ?? view;
		filter = recall(ORDERS_FILTER_KEY, Object.keys(FILTER_LABELS) as TFilter[]) ?? filter;
		side = recall(TRADES_SIDE_KEY, SIDES) ?? side;
	});

	function startModify(order: TBookRow) {
		editing = order;
		quantity = String(order.quantity);
		price = order.price ? String(order.price) : '';
		trigger = order.trigger_price ? String(order.trigger_price) : '';
		modifyOpen = true;
	}

	async function refresh() {
		await Promise.all([book.reload(), history.reload()]);
	}

	async function cancel(order: TBookRow) {
		busy = order.order_id;
		const res = await cancelOrder(order.order_id, order.account.id, order.type);
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
			account_id: editing.account.id,
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

{#snippet status(o: TReason)}
	<td class="{TABLE.td} {STATUS_TONE[o.status]}">
		{#if o.message}
			<button
				type="button"
				aria-label="Show reason"
				class="inline-flex items-center gap-1.5"
				onclick={() => (reason = o)}
			>
				{o.status.replace('_', ' ')}
				<Info class="size-3.5 opacity-80" />
			</button>
		{:else}
			{o.status.replace('_', ' ')}
		{/if}
	</td>
{/snippet}

{#snippet priceCell(value: number, trigger: number)}
	<td class="{TABLE.td} text-right">
		{formatNumber(value)}
		{#if trigger}
			<span class="text-muted-foreground block text-xs">trg {formatNumber(trigger)}</span>
		{/if}
	</td>
{/snippet}

<div class="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
	<SvaKoshTabs tabs={VIEWS} activeTab={view} onTabChange={setView} class="w-fit" />
	{#if view === 'trades'}
		<SvaKoshTabs
			tabs={sideTabs}
			activeTab={side}
			onTabChange={setSide}
			class="w-fit max-w-full overflow-x-auto"
		/>
	{:else}
		<SvaKoshTabs
			tabs={statusTabs}
			activeTab={filter}
			onTabChange={setFilter}
			class="w-fit max-w-full overflow-x-auto"
		/>
	{/if}
</div>

{#if view === 'today'}
	<TradeTable
		empty={!rows.length}
		loading={book.loading}
		error={book.error}
		emptyTitle={filter === 'all'
			? 'No orders today'
			: `No ${FILTER_LABELS[filter].toLowerCase()} orders`}
		emptyDescription="Orders you place show here with live status."
		onRetry={book.reload}
	>
		{#snippet head()}
			<th class={TABLE.th}>Time</th>
			<th class={TABLE.th}>Account</th>
			<th class={TABLE.th}>Instrument</th>
			<th class={TABLE.th}>Side</th>
			<th class={TABLE.th}>Type</th>
			<th class="{TABLE.th} text-right">Qty</th>
			<th class="{TABLE.th} text-right">Price</th>
			<th class={TABLE.th}>Status</th>
			<th class="{TABLE.th} text-right">Actions</th>
		{/snippet}
		{#snippet body()}
			{#each rows as o (`${o.account.id}:${o.order_id}`)}
				<tr class={TABLE.row}>
					<td class="{TABLE.td} text-muted-foreground">{timeOf(o.updated_at)}</td>
					<AccountCell account={o.account} />
					<InstrumentCell token={o.token} symbol={o.symbol} />
					<td class="{TABLE.td} {o.side === 'BUY' ? 'text-bullish' : 'text-bearish'}">{o.side}</td>
					<td class="{TABLE.td} text-muted-foreground">{o.type} · {o.product}</td>
					<td class="{TABLE.td} text-right">{o.filled_quantity}/{o.quantity}</td>
					{@render priceCell(o.average_price || o.price, o.trigger_price)}
					{@render status(o)}
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
		{/snippet}
	</TradeTable>
{:else if view === 'trades'}
	<TradeTable
		empty={!tradeRows.length}
		loading={trades.loading}
		error={trades.error}
		emptyTitle="No trades today"
		emptyDescription="Filled orders show here with their fill price."
		onRetry={trades.reload}
	>
		{#snippet head()}
			<th class={TABLE.th}>Time</th>
			<th class={TABLE.th}>Account</th>
			<th class={TABLE.th}>Instrument</th>
			<th class={TABLE.th}>Side</th>
			<th class={TABLE.th}>Product</th>
			<th class="{TABLE.th} text-right">Qty</th>
			<th class="{TABLE.th} text-right">Price</th>
			<th class="{TABLE.th} text-right">Value</th>
		{/snippet}
		{#snippet body()}
			{#each tradeRows as t (`${t.account.id}:${t.trade_id}:${t.order_id}`)}
				<tr class={TABLE.row}>
					<td class="{TABLE.td} text-muted-foreground">{t.time}</td>
					<AccountCell account={t.account} />
					<InstrumentCell token={t.token} symbol={t.symbol} />
					<td class="{TABLE.td} {t.side === 'BUY' ? 'text-bullish' : 'text-bearish'}">{t.side}</td>
					<td class="{TABLE.td} text-muted-foreground">{t.product}</td>
					<td class="{TABLE.td} text-right">{t.quantity}</td>
					<td class="{TABLE.td} text-right">{formatNumber(t.price)}</td>
					<td class="{TABLE.td} text-right">{formatNumber(t.price * t.quantity)}</td>
				</tr>
			{/each}
		{/snippet}
	</TradeTable>
{:else}
	<TradeTable
		empty={!historyRows.length}
		loading={history.loading}
		error={history.error}
		emptyTitle="No order history"
		emptyDescription="Orders placed from Svakosh show here."
		onRetry={history.reload}
	>
		{#snippet head()}
			<th class={TABLE.th}>Placed</th>
			<th class={TABLE.th}>Account</th>
			<th class={TABLE.th}>Instrument</th>
			<th class={TABLE.th}>Side</th>
			<th class={TABLE.th}>Type</th>
			<th class="{TABLE.th} text-right">Qty</th>
			<th class="{TABLE.th} text-right">Price</th>
			<th class={TABLE.th}>Status</th>
		{/snippet}
		{#snippet body()}
			{#each historyRows as o (o.id)}
				<tr class={TABLE.row}>
					<td class="{TABLE.td} text-muted-foreground">{timeOf(o.created_at)}</td>
					<AccountCell account={o.account} />
					<InstrumentCell token={o.token} symbol={instrumentOf(o.token)} />
					<td class="{TABLE.td} {o.side === 'BUY' ? 'text-bullish' : 'text-bearish'}">{o.side}</td>
					<td class="{TABLE.td} text-muted-foreground">{o.type} · {o.product}</td>
					<td class="{TABLE.td} text-right">{o.filled_quantity}/{o.quantity}</td>
					{@render priceCell(o.average_price || o.price, o.trigger_price)}
					{@render status({ ...o, symbol: instrumentOf(o.token) })}
				</tr>
			{/each}
		{/snippet}
	</TradeTable>
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

<SvaKoshModal
	isOpen={!!reason}
	onClose={() => (reason = null)}
	width="26rem"
	class="overflow-hidden"
>
	{#if reason}
		<ModalHeader
			title={`Order ${reason.status.replace('_', ' ').toLowerCase()}`}
			subtitle={`${plainSymbol(reason.symbol)} · ${reason.side} · ${reason.type} · ${reason.product}`}
			onClose={() => (reason = null)}
		/>
		<p class="text-foreground max-h-72 overflow-y-auto p-5 text-sm leading-relaxed">
			{reason.message}
		</p>
	{/if}
</SvaKoshModal>
