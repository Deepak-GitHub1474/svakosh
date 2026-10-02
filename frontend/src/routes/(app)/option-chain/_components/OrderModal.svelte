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
	import { changePct, expiryLabel, formatDecimal } from '../_lib/helper';
	import { chain } from '../_lib/state.svelte';
	import type { TOrderDraft } from '../_lib/types';

	type TOrderType = TOrderDraft['orderType'];
	type TProduct = TOrderDraft['product'];
	type TUnit = 'Lots' | 'Qty';

	const TICK = 0.05;
	const MAX_LOTS = 1800;

	const PRODUCT_TABS: { label: string; value: TProduct }[] = [
		{ label: 'Intraday', value: 'MIS' },
		{ label: 'Overnight', value: 'NRML' }
	];
	const ORDER_TYPE_TABS: { label: string; value: TOrderType }[] = [
		{ label: 'Market', value: 'Market' },
		{ label: 'Limit', value: 'Limit' }
	];
	const UNIT_TABS: { label: string; value: TUnit }[] = [
		{ label: 'Lots', value: 'Lots' },
		{ label: 'Qty', value: 'Qty' }
	];

	let { isOpen = $bindable(false), draft }: { isOpen: boolean; draft: TOrderDraft | null } =
		$props();

	let isSell = $state(false);
	let orderType = $state<TOrderType>('Market');
	let product = $state<TProduct>('MIS');
	let unit = $state<TUnit>('Lots');
	let amount = $state(1);
	let typingAmount = $state(false);
	let priceText = $state('');

	$effect(() => {
		if (!draft) return;
		isSell = draft.transaction === 'SELL';
		orderType = draft.orderType;
		product = draft.product;
		unit = 'Lots';
		amount = draft.lots;
		priceText = draft.price.toFixed(2);
	});

	const row = $derived(draft ? chain.data?.options_data[draft.strike] : undefined);
	const isCall = $derived(draft?.side === 'CE');
	const liveLtp = $derived((isCall ? row?.ce_ltp : row?.pe_ltp) ?? draft?.price ?? 0);
	const prevClose = $derived(isCall ? row?.ce_prev_close : row?.pe_prev_close);
	const ltpChange = $derived(changePct(liveLtp, prevClose));

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
	const contract = $derived(draft ? `${chain.symbol} ${draft.strike} ${draft.side}` : '');

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

	function snapPrice() {
		if (limitPrice > 0) priceText = limitPrice.toFixed(2);
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!draft || !priceValid) return;
		toast.success({
			title: `${isSell ? 'Sold' : 'Bought'} ${quantity} ${contract}`,
			description: isLimit ? `Limit at ${formatDecimal(limitPrice)}` : 'At market'
		});
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

	const tabsFill = 'w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:px-2';
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
				<h2 class="text-foreground truncate text-base font-medium tabular-nums">{contract}</h2>
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
					{#if chain.expiry}
						<span>{expiryLabel(chain.expiry)}</span>
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
						class={isSell ? 'bg-bearish' : 'bg-bullish'}
					/>
					<span class={isSell ? 'text-bearish font-medium' : 'text-muted-foreground'}>Sell</span>
				</div>
			</div>
		</header>

		<form class="space-y-4 p-4" onsubmit={submit} novalidate>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<SvaKoshLabel>Product</SvaKoshLabel>
					<SvaKoshTabs
						tabs={PRODUCT_TABS}
						activeTab={product}
						onTabChange={(value: TProduct) => (product = value)}
						class={tabsFill}
					/>
				</div>
				<div>
					<SvaKoshLabel>Order type</SvaKoshLabel>
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
						<SvaKoshLabel class="mb-0">Quantity</SvaKoshLabel>
						<SvaKoshTabs
							tabs={UNIT_TABS}
							activeTab={unit}
							onTabChange={setUnit}
							class="p-0.5 [&>button]:px-2.5 [&>button]:py-1 [&>div]:top-0.5 [&>div]:bottom-0.5"
						/>
					</div>
					<div onfocusin={onAmountFocusIn} onfocusout={onAmountFocusOut}>
						<SvaKoshNumberInput
							bind:value={amount}
							min={isQty ? (typingAmount ? 0 : lotSize) : 1}
							max={isQty ? MAX_LOTS * lotSize : MAX_LOTS}
							step={isQty ? lotSize : 1}
						/>
					</div>
				</div>
				<div>
					<div class={fieldHead}>
						<SvaKoshLabel for="order-price" class="mb-0">
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
							class="[appearance:textfield] py-2.5 text-right tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none {priceValid
								? ''
								: 'border-bearish-muted'}"
						/>
					{:else}
						<SvaKoshInput
							id="order-price"
							value={formatDecimal(liveLtp)}
							disabled
							class="py-2.5 text-right tabular-nums"
						/>
					{/if}
				</div>
			</div>

			<div class="border-border-subtle flex items-center justify-between gap-4 border-t pt-4">
				<dl class="flex items-center gap-2 tabular-nums">
					<dt class="text-muted-foreground text-xs">Premium</dt>
					<dd class="text-foreground text-sm font-medium">
						₹{premium.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
					</dd>
				</dl>

				<SvaKoshButton
					type="submit"
					variant={isSell ? 'bearish' : 'bullish'}
					label={isSell ? 'Sell' : 'Buy'}
					disabled={!priceValid}
					class="min-w-[10rem]"
				/>
			</div>
		</form>
	{/if}
{/snippet}

{#if isDesktop}
	<SvaKoshModal bind:isOpen width="26rem" class="overflow-hidden">
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
