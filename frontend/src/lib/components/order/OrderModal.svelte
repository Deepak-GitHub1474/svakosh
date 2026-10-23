<script lang="ts">
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshDrawer from '$lib/components/svakosh/SvaKoshDrawer.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshNumberInput from '$lib/components/svakosh/SvaKoshNumberInput.svelte';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { basketDraft } from '$lib/trade/basket.svelte';
	import { recall, remember } from '$lib/trade/storage';
	import MarketDepth from './MarketDepth.svelte';
	import { untrack } from 'svelte';
	import {
		DEPTH_KEY,
		MAX_BASKET_LEGS,
		MODAL_BUTTON,
		MODAL_CONTROL,
		MODAL_STEPPER
	} from '$lib/trade/const';
	import { getFunds, getMargin, placeOrder } from '$lib/trade/service';
	import type { TOrderTicket } from './types';

	type TOrderType = TOrderTicket['orderType'];
	type TProduct = TOrderTicket['product'];
	type TUnit = 'Lots' | 'Qty';

	const TICK = 0.05;
	const MAX_LOTS = 1800;
	const MARGIN_DELAY_MS = 400;

	const PRODUCT_TABS: { label: string; value: TProduct }[] = [
		{ label: 'Intraday', value: 'MIS' },
		{ label: 'Overnight', value: 'NRML' }
	];
	const EQUITY_PRODUCT_TABS: { label: string; value: TProduct }[] = [
		{ label: 'Intraday', value: 'MIS' },
		{ label: 'Delivery', value: 'CNC' }
	];
	const ORDER_TYPE_TABS: { label: string; value: TOrderType }[] = [
		{ label: 'Market', value: 'Market' },
		{ label: 'Limit', value: 'Limit' }
	];
	const UNIT_TABS: { label: string; value: TUnit }[] = [
		{ label: 'Lots', value: 'Lots' },
		{ label: 'Qty', value: 'Qty' }
	];

	let {
		isOpen = $bindable(false),
		draft,
		title,
		subtitle = '',
		ltp,
		prevClose
	}: {
		isOpen: boolean;
		draft: TOrderTicket | null;
		title: string;
		subtitle?: string;
		ltp: number;
		prevClose?: number;
	} = $props();

	let isSell = $state(false);
	let orderType = $state<TOrderType>('Market');
	let product = $state<TProduct>('MIS');
	let unit = $state<TUnit>('Lots');
	let amount = $state(1);
	let typingAmount = $state(false);
	let priceText = $state('');
	let orderKey = $state('');
	let placing = $state(false);
	let available = $state<number | null>(null);
	let required = $state<number | null>(null);
	let showDepth = $state(recall(DEPTH_KEY, ['on']) === 'on');

	$effect(() => {
		if (!draft) return;
		isSell = draft.transaction === 'SELL';
		orderType = draft.orderType;
		product = draft.product;
		unit = 'Lots';
		amount = draft.lots;
		priceText = draft.price.toFixed(2);
		orderKey = crypto.randomUUID();
		if (!tradeAccounts.loaded) tradeAccounts.load();
	});

	const accountId = $derived(tradeAccounts.selected?.logged_in ? tradeAccounts.accountId : '');

	$effect(() => {
		available = null;
		if (!isOpen || !accountId) return;
		let live = true;
		getFunds(accountId).then((res) => {
			if (live && res.ok) available = res.data.available;
		});
		return () => {
			live = false;
		};
	});

	$effect(() => {
		if (!isOpen || !accountId || !draft || !priceValid) {
			required = null;
			return;
		}
		const ticket = {
			account_id: accountId,
			token: draft.token,
			side: isSell ? ('SELL' as const) : ('BUY' as const),
			product,
			type: isLimit ? ('LIMIT' as const) : ('MARKET' as const),
			quantity,
			price: isLimit ? limitPrice : untrack(() => liveLtp),
			trigger_price: 0
		};
		let live = true;
		const timer = setTimeout(async () => {
			const res = await getMargin(ticket);
			if (live && res.ok) required = res.data.required;
		}, MARGIN_DELAY_MS);
		return () => {
			live = false;
			clearTimeout(timer);
		};
	});

	const shortfall = $derived(
		required !== null && available !== null && required > available ? required - available : 0
	);

	const formatDecimal = (value: number) => (Number.isNaN(value) ? '—' : value.toFixed(2));

	const liveLtp = $derived(ltp);
	const ltpChange = $derived(prevClose ? ((liveLtp - prevClose) / prevClose) * 100 : null);
	const isEquity = $derived(draft?.lotSize === 1);

	const isLimit = $derived(orderType === 'Limit');
	const limitPrice = $derived(Math.round(Number(priceText) / TICK) * TICK);
	const priceValid = $derived(!isLimit || limitPrice > 0);

	const isQty = $derived(unit === 'Qty');
	const lotSize = $derived(draft?.lotSize ?? 1);
	const lots = $derived(
		Math.min(MAX_LOTS, Math.max(1, Math.round(isQty ? amount / lotSize : amount) || 1))
	);
	const quantity = $derived(lots * lotSize);
	const premium = $derived(quantity * (isLimit ? limitPrice : liveLtp));

	function setOrderType(next: TOrderType) {
		orderType = next;
		if (next === 'Limit') priceText = liveLtp.toFixed(2);
	}

	function setUnit(next: TUnit) {
		if (next === unit) return;
		amount = next === 'Qty' ? quantity : lots;
		unit = next;
	}

	// Free typing in qty mode passes through values that are not lot multiples,
	// so the floor only applies to the steppers and the value snaps on blur.
	function onAmountFocusIn(event: FocusEvent) {
		typingAmount = event.target instanceof HTMLInputElement;
	}

	function onAmountFocusOut(event: FocusEvent) {
		if (!(event.target instanceof HTMLInputElement)) return;
		typingAmount = false;
		amount = isQty ? quantity : lots;
	}

	function toggleDepth() {
		showDepth = !showDepth;
		remember(DEPTH_KEY, showDepth ? 'on' : 'off');
	}

	function pickPrice(price: number) {
		orderType = 'Limit';
		priceText = price.toFixed(2);
	}

	function addToBasket() {
		if (!draft || !priceValid) return;
		const added = basketDraft.add({
			token: draft.token,
			side: isSell ? 'SELL' : 'BUY',
			product,
			type: isLimit ? 'LIMIT' : 'MARKET',
			quantity,
			price: isLimit ? limitPrice : 0,
			trigger_price: 0
		});
		if (!added) {
			toast.error({
				title: 'Basket is full',
				description: `A basket holds up to ${MAX_BASKET_LEGS} orders.`
			});
			return;
		}
		toast.success({
			title: `${isSell ? 'Sell' : 'Buy'} ${quantity} ${title} added to basket`,
			action: { label: 'Basket', onClick: () => goto(resolve('/trade/baskets')) }
		});
		isOpen = false;
	}

	function snapPrice() {
		if (limitPrice > 0) priceText = limitPrice.toFixed(2);
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!draft || !priceValid || placing) return;
		if (!tradeAccounts.accountId) {
			toast.error({
				title: 'No broker account linked',
				description: 'Link your broker account to place orders.',
				action: { label: 'Link', onClick: () => goto(resolve('/broker/accounts')) }
			});
			return;
		}
		if (!tradeAccounts.selected?.logged_in) {
			toast.error({
				title: 'Log in to your broker',
				description: 'Your broker session has ended. Log in to place orders.',
				action: { label: 'Log in', onClick: () => goto(resolve('/broker/accounts')) }
			});
			return;
		}
		placing = true;
		const res = await placeOrder({
			account_id: tradeAccounts.accountId,
			client_order_id: orderKey,
			token: draft.token,
			side: isSell ? 'SELL' : 'BUY',
			product,
			type: isLimit ? 'LIMIT' : 'MARKET',
			quantity,
			price: isLimit ? limitPrice : 0,
			trigger_price: 0
		});
		placing = false;
		const label = `${isSell ? 'Sell' : 'Buy'} ${quantity} ${title}`;
		if (!res.ok) {
			toast.error({ title: `${label} failed`, description: res.error });
			return;
		}
		if (res.data.status === 'REJECTED' || res.data.status === 'FAILED') {
			toast.error({ title: `${label} rejected`, description: res.data.message });
		} else if (res.data.status === 'UNKNOWN') {
			toast.warning({
				title: `${label} sent`,
				description: 'Broker did not confirm yet. Check Orders.'
			});
		} else {
			toast.success({
				title: `${label} placed`,
				description: isLimit ? `Limit at ${formatDecimal(limitPrice)}` : 'At market',
				action: { label: 'Orders', onClick: () => goto(resolve('/trade/orders')) }
			});
		}
		isOpen = false;
	}

	let isDesktop = $state(true);

	$effect(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		const sync = () => (isDesktop = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	const tabsSoft =
		'[&>div]:bg-none [&>div]:bg-primary/15 [&>div]:shadow-none [&>div]:ring-1 [&>div]:ring-inset [&>div]:ring-primary/40 [&>button.text-black]:text-primary';
	const tabsFill = `${MODAL_CONTROL} w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:px-2 ${tabsSoft}`;
	const fieldHead = 'mb-1.5 flex h-8 items-center justify-between gap-2';
</script>

{#snippet orderContent(closable: boolean)}
	{#if draft}
		<header
			class="bg-surface-elevated border-border-subtle border-b px-4 pb-3 {closable
				? 'pt-3.5'
				: 'pt-2.5'}"
		>
			{#if !closable}
				<div aria-hidden="true" class="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15"></div>
			{/if}
			<div class="flex items-start justify-between gap-4">
				<h2 class="text-foreground truncate text-base font-medium tabular-nums">{title}</h2>
				{#if closable}
					<button
						type="button"
						onclick={() => (isOpen = false)}
						aria-label="Close"
						class="text-muted-foreground hover:text-foreground -mr-1 shrink-0 p-0.5 transition-colors"
					>
						<CloseIcon class="h-5 w-5" />
					</button>
				{/if}
			</div>

			<div class="mt-1.5 flex items-center justify-between gap-4">
				<p class="text-muted-foreground flex items-baseline gap-2 text-xs tabular-nums">
					{#if subtitle}
						<span>{subtitle}</span>
					{/if}
					<span class="text-foreground">{formatDecimal(liveLtp)}</span>
					{#if ltpChange !== null}
						<span class={ltpChange >= 0 ? 'text-bullish' : 'text-bearish'}>
							{ltpChange >= 0 ? '+' : ''}{ltpChange.toFixed(2)}%
						</span>
					{/if}
				</p>

				<div class="flex shrink-0 items-center gap-2 text-xs">
					<span class={isSell ? 'text-muted-foreground' : 'text-bullish font-medium'}>Buy</span>
					<SvaKoshSwitch
						bind:checked={isSell}
						label="Switch between buy and sell"
						class={isSell ? 'bg-bearish-solid' : 'bg-bullish-solid'}
					/>
					<span class={isSell ? 'text-bearish font-medium' : 'text-muted-foreground'}>Sell</span>
				</div>
			</div>
		</header>

		<form class="space-y-4 p-4" onsubmit={submit} novalidate>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<SvaKoshLabel class="text-foreground/80">Product</SvaKoshLabel>
					<SvaKoshTabs
						tabs={isEquity ? EQUITY_PRODUCT_TABS : PRODUCT_TABS}
						activeTab={product}
						onTabChange={(value: TProduct) => (product = value)}
						class={tabsFill}
					/>
				</div>
				<div>
					<SvaKoshLabel class="text-foreground/80">Order type</SvaKoshLabel>
					<SvaKoshTabs
						tabs={ORDER_TYPE_TABS}
						activeTab={orderType}
						onTabChange={setOrderType}
						class={tabsFill}
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div>
					<div class={fieldHead}>
						<SvaKoshLabel class="text-foreground/80 mb-0">Quantity</SvaKoshLabel>
						{#if !isEquity}
							<SvaKoshTabs
								tabs={UNIT_TABS}
								activeTab={unit}
								onTabChange={setUnit}
								class="p-0.5 [&>button]:px-2.5 [&>button]:py-1 [&>div]:top-0.5 [&>div]:bottom-0.5 {tabsSoft}"
							/>
						{/if}
					</div>
					<div onfocusin={onAmountFocusIn} onfocusout={onAmountFocusOut}>
						<SvaKoshNumberInput
							class={MODAL_STEPPER}
							bind:value={amount}
							min={isQty ? (typingAmount ? 0 : lotSize) : 1}
							max={isQty ? MAX_LOTS * lotSize : MAX_LOTS}
							step={isQty ? lotSize : 1}
						/>
					</div>
				</div>
				<div>
					<div class={fieldHead}>
						<SvaKoshLabel for="order-price" class="text-foreground/80 mb-0">
							{isLimit ? 'Limit price' : 'Market price'}
						</SvaKoshLabel>
						{#if isLimit}
							<span class="text-muted-foreground text-xs">Tick {TICK}</span>
						{/if}
					</div>
					{#if isLimit}
						<SvaKoshInput
							id="order-price"
							type="number"
							inputmode="decimal"
							min={TICK}
							step={TICK}
							bind:value={priceText}
							onblur={snapPrice}
							class="{MODAL_CONTROL} [appearance:textfield] rounded-xl py-0 text-right tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none {priceValid
								? ''
								: 'border-bearish-muted'}"
						/>
					{:else}
						<SvaKoshInput
							id="order-price"
							value={formatDecimal(liveLtp)}
							disabled
							class="{MODAL_CONTROL} rounded-xl py-0 text-right tabular-nums"
						/>
					{/if}
				</div>
			</div>

			<div class="flex items-center justify-between gap-4 text-xs">
				<button
					type="button"
					aria-expanded={showDepth}
					class="text-muted-foreground hover:text-foreground transition-colors"
					onclick={toggleDepth}>{showDepth ? 'Hide depth' : 'Market depth'}</button
				>
				<button
					type="button"
					class="text-primary hover:underline disabled:opacity-40"
					disabled={!priceValid}
					onclick={addToBasket}>Add to basket</button
				>
			</div>

			{#if showDepth}
				<MarketDepth token={draft.token} onPick={pickPrice} />
			{/if}

			<div class="border-border-subtle flex items-center justify-between gap-4 border-t pt-4">
				<dl class="grid grid-cols-[auto_auto] items-center gap-x-2 gap-y-1 tabular-nums">
					<dt class="text-muted-foreground text-xs">{isEquity ? 'Amount' : 'Premium'}</dt>
					<dd class="text-foreground text-sm font-medium">
						₹{premium.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
					</dd>
					{#if required !== null}
						<dt class="text-muted-foreground text-xs">Margin</dt>
						<dd class="text-xs {shortfall ? 'text-bearish' : 'text-foreground'}">
							₹{required.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
							{#if available !== null}
								<span class="text-muted-foreground">
									/ ₹{available.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
								</span>
							{/if}
						</dd>
					{/if}
				</dl>

				<SvaKoshButton
					type="submit"
					variant={isSell ? 'bearish' : 'bullish'}
					label={placing ? 'Placing…' : isSell ? 'Sell' : 'Buy'}
					disabled={!priceValid || placing}
					class="{MODAL_BUTTON} min-w-[10rem] font-semibold [--terminal-fg:white] {isSell
						? '[--terminal-bg-hover:var(--bearish-solid-hover)] [--terminal-bg:var(--bearish-solid)] [--terminal-border-hover:transparent] [--terminal-border:transparent]'
						: '[--terminal-bg-hover:var(--bullish-solid-hover)] [--terminal-bg:var(--bullish-solid)] [--terminal-border-hover:transparent] [--terminal-border:transparent]'}"
				/>
			</div>
		</form>
	{/if}
{/snippet}

{#if isDesktop}
	<SvaKoshModal bind:isOpen width="26rem" class="overflow-hidden" movable>
		{@render orderContent(true)}
	</SvaKoshModal>
{:else}
	<SvaKoshDrawer
		bind:isOpen
		showHandle={false}
		snapPoints={[10, 90]}
		class="overflow-hidden"
		contentClass="pb-[env(safe-area-inset-bottom)]"
	>
		{@render orderContent(false)}
	</SvaKoshDrawer>
{/if}
