<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import InstrumentCell from '$lib/components/trade/InstrumentCell.svelte';
	import StatStrip from '$lib/components/trade/StatStrip.svelte';
	import TradeTable from '$lib/components/trade/TradeTable.svelte';
	import { marketFeed } from '$lib/market/feed.svelte';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { basketDraft } from '$lib/trade/basket.svelte';
	import { PRICE_TICK, STATUS_TONE, TABLE } from '$lib/trade/const';
	import { instrumentNames } from '$lib/trade/names.svelte';
	import {
		basketMargin,
		deleteBasket,
		getFunds,
		listBaskets,
		placeBasket,
		saveBasket
	} from '$lib/trade/service';
	import type { TBasket, TLeg, TLegResult } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	const MARGIN_DELAY_MS = 400;
	const PILL = 'rounded-md px-2 py-1 text-xs font-medium transition-colors';

	let saved = $state<TBasket[]>([]);
	let savedError = $state('');
	let required = $state<number | null>(null);
	let available = $state<number | null>(null);
	let results = $state<TLegResult[]>([]);
	let placeKey = $state(crypto.randomUUID());
	let placing = $state(false);
	let saving = $state(false);

	const legs = $derived(basketDraft.legs);
	const accountId = $derived(tradeAccounts.selected?.logged_in ? tradeAccounts.accountId : '');
	const tokens = $derived([...new Set(legs.map((l) => l.token))].sort().join(','));
	const legsKey = $derived(JSON.stringify(legs));
	const lotOf = (token: string) => instrumentNames.names[token]?.lot_size || 1;
	const legValid = (l: TLeg) =>
		l.quantity > 0 && l.quantity % lotOf(l.token) === 0 && (l.type !== 'LIMIT' || l.price > 0);
	const valid = $derived(!!legs.length && legs.every(legValid));

	onMount(() => {
		basketDraft.load();
		loadSaved();
	});

	$effect(() => {
		if (!tokens) return;
		instrumentNames.want(tokens.split(','));
		return marketFeed.subscribe(tokens.split(','));
	});

	$effect(() => {
		available = null;
		if (!accountId) return;
		let live = true;
		getFunds(accountId).then((res) => {
			if (live && res.ok) available = res.data.available;
		});
		return () => {
			live = false;
		};
	});

	$effect(() => {
		void legsKey;
		results = [];
		placeKey = crypto.randomUUID();
		required = null;
		if (!accountId || !valid) return;
		const priced = untrack(() =>
			legs.map((l) => ({
				...l,
				price: l.type === 'LIMIT' ? l.price : (marketFeed.quotes[l.token]?.ltp ?? 0)
			}))
		);
		let live = true;
		const timer = setTimeout(async () => {
			const res = await basketMargin(accountId, priced);
			if (live && res.ok) required = res.data.required;
		}, MARGIN_DELAY_MS);
		return () => {
			live = false;
			clearTimeout(timer);
		};
	});

	async function loadSaved() {
		const res = await listBaskets();
		if (res.ok) {
			saved = res.data;
			savedError = '';
		} else savedError = res.error;
	}

	function setQuantity(i: number, lots: number) {
		const lot = lotOf(legs[i].token);
		basketDraft.update(i, { quantity: Math.max(1, Math.floor(lots)) * lot });
	}

	function setPrice(i: number, value: string) {
		const price = Math.round(Number(value) / PRICE_TICK) * PRICE_TICK;
		basketDraft.update(i, { price: Number.isFinite(price) ? Number(price.toFixed(2)) : 0 });
	}

	function setType(i: number, type: TLeg['type']) {
		const ltp = marketFeed.quotes[legs[i].token]?.ltp ?? 0;
		basketDraft.update(i, { type, price: type === 'LIMIT' ? Number(ltp.toFixed(2)) : 0 });
	}

	async function save() {
		const name = basketDraft.name.trim();
		if (!name) {
			toast.error({ title: 'Name the basket first' });
			return;
		}
		saving = true;
		const res = await saveBasket({ name, legs }, basketDraft.id);
		saving = false;
		if (!res.ok) {
			toast.error({ title: 'Basket not saved', description: res.error });
			return;
		}
		basketDraft.saved(res.data);
		toast.success({ title: `${res.data.name} saved` });
		loadSaved();
	}

	async function remove(basket: TBasket) {
		const res = await deleteBasket(basket.id);
		if (!res.ok) {
			toast.error({ title: 'Basket not deleted', description: res.error });
			return;
		}
		if (basketDraft.id === basket.id) basketDraft.saved({ ...basket, id: '' });
		saved = saved.filter((b) => b.id !== basket.id);
		toast.success({ title: `${basket.name} deleted` });
	}

	async function place() {
		if (!valid || placing) return;
		if (!accountId) {
			toast.error({ title: 'Log in to your broker', description: 'Select a logged-in account.' });
			return;
		}
		placing = true;
		const res = await placeBasket(accountId, placeKey, legs);
		placing = false;
		if (!res.ok) {
			toast.error({ title: 'Basket not placed', description: res.error });
			return;
		}
		results = res.data;
		const failed = res.data.filter((r) => r.code || r.order?.status === 'REJECTED').length;
		const placed = res.data.length - failed;
		if (failed) {
			toast.warning({
				title: `${placed} of ${res.data.length} orders placed`,
				description: 'See each leg below.'
			});
		} else toast.success({ title: `${placed} orders placed` });
	}

	const resultOf = (i: number) => results.find((r) => r.leg === i);
</script>

<StatStrip
	class="mb-4 shrink-0"
	stats={[
		{ label: 'Orders', value: String(legs.length) },
		{ label: 'Margin', value: required === null ? '—' : `₹${formatNumber(required)}` },
		{ label: 'Available', value: available === null ? '—' : `₹${formatNumber(available)}` }
	]}
/>

<div class="mb-3 flex shrink-0 flex-wrap items-center gap-2">
	<SvaKoshInput
		placeholder="Basket name"
		maxlength={60}
		value={basketDraft.name}
		oninput={(e: Event) => {
			basketDraft.name = (e.currentTarget as HTMLInputElement).value;
			basketDraft.save();
		}}
		class="h-9 w-56 rounded-lg py-0 text-sm"
	/>
	<SvaKoshButton
		variant="secondary"
		label={saving ? 'Saving…' : basketDraft.id ? 'Update' : 'Save'}
		class="h-9 px-4 text-sm"
		disabled={!valid || saving}
		onclick={save}
	/>
	<SvaKoshButton
		variant="secondary"
		label="New"
		class="h-9 px-4 text-sm"
		disabled={!legs.length && !basketDraft.id}
		onclick={() => basketDraft.clear()}
	/>
	<SvaKoshButton
		variant="solid"
		label={placing ? 'Placing…' : `Place ${legs.length} orders`}
		class="ml-auto h-9 min-w-40 justify-center px-5 text-sm tabular-nums"
		disabled={!valid || placing}
		onclick={place}
	/>
</div>

<TradeTable
	empty={!legs.length}
	loading={false}
	error=""
	emptyTitle="Basket is empty"
	emptyDescription="Use Add to basket in the order window, or open a saved basket below."
	onRetry={() => {}}
>
	{#snippet head()}
		<th class={TABLE.th}>Instrument</th>
		<th class={TABLE.th}>Side</th>
		<th class={TABLE.th}>Product</th>
		<th class={TABLE.th}>Type</th>
		<th class="{TABLE.th} text-right">Lots</th>
		<th class="{TABLE.th} text-right">Price</th>
		<th class="{TABLE.th} text-right">LTP</th>
		<th class={TABLE.th}>Status</th>
		<th class="{TABLE.th} w-px"></th>
	{/snippet}
	{#snippet body()}
		{#each legs as leg, i (i)}
			{@const lot = lotOf(leg.token)}
			{@const result = resultOf(i)}
			{@const ltp = marketFeed.quotes[leg.token]?.ltp}
			<tr class={TABLE.row}>
				<InstrumentCell token={leg.token} symbol={leg.token} />
				<td class={TABLE.td}>
					<button
						type="button"
						class="{PILL} {leg.side === 'BUY'
							? 'bg-bullish/15 text-bullish'
							: 'bg-bearish/15 text-bearish'}"
						onclick={() => basketDraft.update(i, { side: leg.side === 'BUY' ? 'SELL' : 'BUY' })}
						>{leg.side}</button
					>
				</td>
				<td class="{TABLE.td} text-muted-foreground">{leg.product}</td>
				<td class={TABLE.td}>
					<button
						type="button"
						class="{PILL} bg-primary/15 text-primary"
						onclick={() => setType(i, leg.type === 'LIMIT' ? 'MARKET' : 'LIMIT')}>{leg.type}</button
					>
				</td>
				<td class="{TABLE.td} text-right">
					<input
						type="number"
						min="1"
						aria-label="Lots"
						value={Math.floor(leg.quantity / lot)}
						onchange={(e) => setQuantity(i, Number(e.currentTarget.value))}
						class="bg-glass w-16 rounded-md px-2 py-1 text-right tabular-nums"
					/>
					{#if lot > 1}
						<span class="text-muted-foreground block text-xs">{leg.quantity} qty</span>
					{/if}
				</td>
				<td class="{TABLE.td} text-right">
					{#if leg.type === 'LIMIT'}
						<input
							type="number"
							min={PRICE_TICK}
							step={PRICE_TICK}
							aria-label="Limit price"
							value={leg.price}
							onchange={(e) => setPrice(i, e.currentTarget.value)}
							class="bg-glass w-24 rounded-md px-2 py-1 text-right tabular-nums"
						/>
					{:else}
						<span class="text-muted-foreground">Market</span>
					{/if}
				</td>
				<td class="{TABLE.td} text-right">{ltp ? formatNumber(ltp) : '—'}</td>
				<td class="{TABLE.td} max-w-56 truncate whitespace-normal">
					{#if result?.order}
						<span class={STATUS_TONE[result.order.status]}>{result.order.status}</span>
						{#if result.order.message}
							<span class="text-muted-foreground block text-xs">{result.order.message}</span>
						{/if}
					{:else if result?.message}
						<span class="text-bearish text-xs">{result.message}</span>
					{:else}
						<span class="text-muted-foreground">—</span>
					{/if}
				</td>
				<td class="{TABLE.td} text-right">
					<button
						type="button"
						aria-label="Remove leg"
						class="text-muted-foreground hover:text-bearish p-1 transition-colors"
						onclick={() => basketDraft.remove(i)}
					>
						<CloseIcon class="size-4" />
					</button>
				</td>
			</tr>
		{/each}
	{/snippet}
</TradeTable>

<section class="mt-4 shrink-0">
	<h2 class="text-muted-foreground mb-2 text-xs tracking-widest uppercase">Saved baskets</h2>
	{#if savedError}
		<p class="text-bearish text-xs">{savedError}</p>
	{:else if !saved.length}
		<p class="text-muted-foreground text-xs">No saved baskets yet.</p>
	{:else}
		<ul class="flex flex-wrap gap-2">
			{#each saved as basket (basket.id)}
				<li
					class="glass-panel flex items-center gap-3 rounded-lg px-3 py-2 text-sm {basketDraft.id ===
					basket.id
						? 'ring-primary/40 ring-1'
						: ''}"
				>
					<button
						type="button"
						class="hover:text-primary text-left transition-colors"
						onclick={() => basketDraft.open(basket)}
					>
						<span class="text-foreground block">{basket.name}</span>
						<span class="text-muted-foreground text-xs">{basket.legs.length} orders</span>
					</button>
					<button
						type="button"
						aria-label="Delete {basket.name}"
						class="text-muted-foreground hover:text-bearish p-1 transition-colors"
						onclick={() => remove(basket)}
					>
						<CloseIcon class="size-4" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</section>
