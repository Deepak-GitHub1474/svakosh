<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshNumberInput from '$lib/components/svakosh/SvaKoshNumberInput.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import TradeSheet from '$lib/components/trade/TradeSheet.svelte';
	import {
		MAX_ORDER_PRICE,
		MAX_ORDER_QUANTITY,
		MODAL_ACTION,
		MODAL_ACTIONS,
		MODAL_STEPPER,
		PRICE_TICK,
		SOFT_TABS
	} from '$lib/trade/const';
	import { exitSide } from '$lib/trade/position';
	import { sendOrder } from '$lib/trade/send';
	import type { TExitTarget } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	type TKind = 'MARKET' | 'LIMIT';

	const SL_BUFFER = 0.005;

	const KINDS: { label: string; value: TKind }[] = [
		{ label: 'Market', value: 'MARKET' },
		{ label: 'Limit', value: 'LIMIT' }
	];
	const TITLES: Record<TExitTarget['mode'], string> = {
		exit: 'Exit',
		reduce: 'Reduce',
		add: 'Add to',
		stoploss: 'Stop-loss',
		target: 'Target'
	};

	let {
		isOpen = $bindable(false),
		target,
		onDone
	}: { isOpen: boolean; target: TExitTarget | null; onDone?: () => void } = $props();

	let quantity = $state(0);
	let kind = $state<TKind>('MARKET');
	let price = $state(0);
	let level = $state(0);
	let limit = $state(0);
	let limitEdited = $state(false);
	let autoLimit = 0;
	let orderKey = $state('');
	let placing = $state(false);

	$effect(() => {
		if (!target) return;
		quantity = target.mode === 'exit' ? Math.abs(target.quantity) : 0;
		kind = 'MARKET';
		price = target.ltp ? Number(target.ltp.toFixed(2)) : 0;
		level = 0;
		limit = 0;
		autoLimit = 0;
		limitEdited = false;
		orderKey = crypto.randomUUID();
	});

	const mode = $derived(target?.mode ?? 'exit');
	const held = $derived(Math.abs(target?.quantity ?? 0));
	const side = $derived(
		mode === 'add'
			? (target?.quantity ?? 0) > 0
				? 'BUY'
				: 'SELL'
			: exitSide(target?.quantity ?? 0)
	);
	const priced = $derived(mode === 'stoploss' || mode === 'target');
	const qty = $derived(Math.floor(Number(quantity)));
	const qtyValid = $derived(qty >= 1 && (mode === 'add' || qty <= held));
	const levelValue = $derived(Number(level));
	const levelError = $derived.by(() => {
		if (!priced || !level) return '';
		if (!(levelValue > 0)) return 'Enter a price.';
		const ltp = target?.ltp;
		if (!ltp) return '';
		const below = (mode === 'stoploss') === (side === 'SELL');
		if (below && levelValue >= ltp) return 'Must be below LTP.';
		if (!below && levelValue <= ltp) return 'Must be above LTP.';
		return '';
	});
	const limitValue = $derived(Number(limit));
	const limitError = $derived.by(() => {
		if (mode !== 'stoploss' || !limit || !(levelValue > 0)) return '';
		if (!(limitValue > 0)) return 'Enter a limit price.';
		if (side === 'SELL' && limitValue > levelValue) return 'Limit must be at or below the trigger.';
		if (side === 'BUY' && limitValue < levelValue) return 'Limit must be at or above the trigger.';
		return '';
	});
	const valid = $derived(
		qtyValid &&
			(priced ? levelValue > 0 && !levelError : kind === 'MARKET' || Number(price) > 0) &&
			(mode !== 'stoploss' || (limitValue > 0 && !limitError))
	);

	$effect(() => {
		if (mode !== 'stoploss' || limitEdited || !(levelValue > 0)) return;
		const buffer = Math.max(
			PRICE_TICK,
			Math.round((levelValue * SL_BUFFER) / PRICE_TICK) * PRICE_TICK
		);
		autoLimit = Number((side === 'SELL' ? levelValue - buffer : levelValue + buffer).toFixed(2));
		limit = autoLimit;
	});

	$effect(() => {
		if (limit !== autoLimit) limitEdited = true;
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!target || !valid || placing) return;
		placing = true;
		const ok = await sendOrder(
			{
				account_id: target.account_id,
				client_order_id: orderKey,
				token: target.token,
				side,
				product: target.product,
				type: mode === 'stoploss' ? 'SL' : mode === 'target' ? 'LIMIT' : kind,
				quantity: qty,
				price:
					mode === 'stoploss'
						? limitValue
						: mode === 'target'
							? levelValue
							: kind === 'LIMIT'
								? Number(price)
								: 0,
				trigger_price: mode === 'stoploss' ? levelValue : 0
			},
			`${TITLES[mode]} ${qty} ${target.symbol}`
		);
		placing = false;
		if (!ok) return;
		isOpen = false;
		onDone?.();
	}
</script>

{#snippet actions()}
	<div class={MODAL_ACTIONS}>
		<SvaKoshButton
			type="submit"
			form="position-form"
			variant="solid"
			class={MODAL_ACTION}
			label={placing
				? 'Placing…'
				: priced
					? `Place ${TITLES[mode].toLowerCase()}`
					: side === 'SELL'
						? 'Sell'
						: 'Buy'}
			disabled={!valid || placing}
		/>
	</div>
{/snippet}

<TradeSheet bind:isOpen footer={target ? actions : undefined}>
	{#if target}
		<ModalHeader
			title={`${TITLES[mode]} ${target.symbol}`}
			subtitle={`${side} · ${target.product} · LTP ${target.ltp ? formatNumber(target.ltp) : '—'}`}
			onClose={() => (isOpen = false)}
		/>
		<form id="position-form" class="flex flex-col gap-4 p-4" onsubmit={submit} novalidate>
			{#if !priced}
				<div>
					<SvaKoshLabel class="text-foreground/80">Order type</SvaKoshLabel>
					<SvaKoshTabs
						tabs={KINDS}
						activeTab={kind}
						onTabChange={(next: TKind) => (kind = next)}
						class={SOFT_TABS}
					/>
				</div>
			{/if}
			<div>
				<div class="mb-1.5 flex items-center justify-between gap-2">
					<SvaKoshLabel class="text-foreground/80 mb-0">Quantity</SvaKoshLabel>
					<span class="text-muted-foreground text-xs tabular-nums">Open {held}</span>
				</div>
				<SvaKoshNumberInput
					class={MODAL_STEPPER}
					bind:value={quantity}
					min={0}
					emptyValue={0}
					max={mode === 'add' ? MAX_ORDER_QUANTITY : held}
				/>
			</div>
			{#if priced}
				<div>
					<SvaKoshLabel class="text-foreground/80"
						>{mode === 'stoploss' ? 'Trigger price' : 'Target price'}</SvaKoshLabel
					>
					<SvaKoshNumberInput
						class={MODAL_STEPPER}
						bind:value={level}
						min={0}
						emptyValue={0}
						max={MAX_ORDER_PRICE}
						step={PRICE_TICK}
					/>
					<p class="mt-1 text-xs {levelError ? 'text-bearish' : 'text-muted-foreground'}">
						{levelError ||
							(mode === 'stoploss'
								? 'Sends the limit order once the trigger is hit.'
								: 'Exits at this price or better.')}
					</p>
				</div>
				{#if mode === 'stoploss'}
					<div>
						<SvaKoshLabel class="text-foreground/80">Limit price</SvaKoshLabel>
						<SvaKoshNumberInput
							class={MODAL_STEPPER}
							bind:value={limit}
							min={0}
							emptyValue={0}
							max={MAX_ORDER_PRICE}
							step={PRICE_TICK}
						/>
						{#if limitError}
							<p class="text-bearish mt-1 text-xs">{limitError}</p>
						{/if}
					</div>
				{/if}
			{:else if kind === 'LIMIT'}
				<div>
					<SvaKoshLabel class="text-foreground/80">Limit price</SvaKoshLabel>
					<SvaKoshNumberInput
						class={MODAL_STEPPER}
						bind:value={price}
						min={0}
						emptyValue={0}
						max={MAX_ORDER_PRICE}
						step={PRICE_TICK}
					/>
				</div>
			{/if}
		</form>
	{/if}
</TradeSheet>
