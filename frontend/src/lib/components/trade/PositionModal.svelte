<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import { exitSide } from '$lib/trade/position';
	import { sendOrder } from '$lib/trade/send';
	import type { TExitTarget } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	type TKind = 'MARKET' | 'LIMIT';

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

	let quantity = $state('');
	let kind = $state<TKind>('MARKET');
	let price = $state('');
	let level = $state('');
	let orderKey = $state('');
	let placing = $state(false);

	$effect(() => {
		if (!target) return;
		quantity = target.mode === 'exit' ? String(Math.abs(target.quantity)) : '';
		kind = 'MARKET';
		price = target.ltp ? target.ltp.toFixed(2) : '';
		level = '';
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
	const valid = $derived(
		qtyValid && (priced ? levelValue > 0 && !levelError : kind === 'MARKET' || Number(price) > 0)
	);

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
				type: mode === 'stoploss' ? 'SL-M' : mode === 'target' ? 'LIMIT' : kind,
				quantity: qty,
				price: mode === 'target' ? levelValue : !priced && kind === 'LIMIT' ? Number(price) : 0,
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

<SvaKoshModal bind:isOpen width="22rem" class="overflow-hidden">
	{#if target}
		<ModalHeader
			title={`${TITLES[mode]} ${target.symbol}`}
			subtitle={`${side} · ${target.product} · LTP ${target.ltp ? formatNumber(target.ltp) : '—'}`}
			onClose={() => (isOpen = false)}
		/>
		<form class="flex flex-col gap-4 p-4" onsubmit={submit} novalidate>
			<div>
				<SvaKoshLabel for="position-qty">Quantity</SvaKoshLabel>
				<SvaKoshInput
					id="position-qty"
					bind:value={quantity}
					type="number"
					inputmode="numeric"
					min="1"
					max={mode === 'add' ? undefined : String(held)}
					step="1"
					placeholder={mode === 'add' ? 'Quantity to add' : `Up to ${held}`}
					class={quantity && !qtyValid ? 'border-bearish-muted' : ''}
				/>
				<p class="text-muted-foreground mt-1 text-xs">Open {held}</p>
			</div>
			{#if priced}
				<div>
					<SvaKoshLabel for="position-level">
						{mode === 'stoploss' ? 'Trigger price' : 'Target price'}
					</SvaKoshLabel>
					<SvaKoshInput
						id="position-level"
						bind:value={level}
						type="number"
						inputmode="decimal"
						min="0"
						step="0.05"
						class={levelError ? 'border-bearish-muted' : ''}
					/>
					<p class="mt-1 text-xs {levelError ? 'text-bearish' : 'text-muted-foreground'}">
						{levelError ||
							(mode === 'stoploss'
								? 'Exits at market once the trigger is hit.'
								: 'Exits at this price or better.')}
					</p>
				</div>
			{:else}
				<div>
					<SvaKoshLabel>Order type</SvaKoshLabel>
					<SvaKoshTabs
						tabs={KINDS}
						activeTab={kind}
						onTabChange={(next: TKind) => (kind = next)}
						class="w-full [&>button]:flex-1 [&>button]:justify-center"
					/>
				</div>
				{#if kind === 'LIMIT'}
					<div>
						<SvaKoshLabel for="position-price">Limit price</SvaKoshLabel>
						<SvaKoshInput
							id="position-price"
							bind:value={price}
							type="number"
							inputmode="decimal"
							min="0"
							step="0.05"
						/>
					</div>
				{/if}
			{/if}
			<SvaKoshButton
				type="submit"
				variant={side === 'SELL' ? 'bearish' : 'bullish'}
				label={placing
					? 'Placing…'
					: priced
						? `Place ${TITLES[mode].toLowerCase()}`
						: `${side === 'SELL' ? 'Sell' : 'Buy'} ${qty || ''}`}
				disabled={!valid || placing}
			/>
		</form>
	{/if}
</SvaKoshModal>
