<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { exitSide } from '$lib/trade/position';
	import { sendOrder } from '$lib/trade/send';
	import type { TExitTarget } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	type TKind = 'MARKET' | 'LIMIT';

	const KINDS: { label: string; value: TKind }[] = [
		{ label: 'Market', value: 'MARKET' },
		{ label: 'Limit', value: 'LIMIT' }
	];

	let {
		isOpen = $bindable(false),
		target,
		onDone
	}: { isOpen: boolean; target: TExitTarget | null; onDone?: () => void } = $props();

	let quantity = $state('');
	let kind = $state<TKind>('MARKET');
	let price = $state('');
	let trigger = $state('');
	let orderKey = $state('');
	let placing = $state(false);

	$effect(() => {
		if (!target) return;
		quantity = String(Math.abs(target.quantity));
		kind = 'MARKET';
		price = target.ltp ? target.ltp.toFixed(2) : '';
		trigger = '';
		orderKey = crypto.randomUUID();
	});

	const stoploss = $derived(target?.mode === 'stoploss');
	const side = $derived(exitSide(target?.quantity ?? 0));
	const qty = $derived(Math.floor(Number(quantity)));
	const qtyValid = $derived(qty >= 1 && qty <= Math.abs(target?.quantity ?? 0));
	const triggerValue = $derived(Number(trigger));
	const triggerError = $derived.by(() => {
		if (!stoploss || !trigger) return '';
		if (!(triggerValue > 0)) return 'Enter a trigger price.';
		if (!target?.ltp) return '';
		if (side === 'SELL' && triggerValue >= target.ltp) return 'Trigger must be below LTP.';
		if (side === 'BUY' && triggerValue <= target.ltp) return 'Trigger must be above LTP.';
		return '';
	});
	const valid = $derived(
		qtyValid &&
			(stoploss ? triggerValue > 0 && !triggerError : kind === 'MARKET' || Number(price) > 0)
	);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!target || !valid || placing) return;
		placing = true;
		const ok = await sendOrder(
			{
				account_id: tradeAccounts.accountId,
				client_order_id: orderKey,
				token: target.token,
				side,
				product: target.product,
				type: stoploss ? 'SL-M' : kind,
				quantity: qty,
				price: !stoploss && kind === 'LIMIT' ? Number(price) : 0,
				trigger_price: stoploss ? triggerValue : 0
			},
			`${stoploss ? 'Stop-loss' : 'Exit'} ${qty} ${target.symbol}`
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
			title={`${stoploss ? 'Stop-loss' : 'Exit'} ${target.symbol}`}
			subtitle={`${side} · ${target.product} · LTP ${target.ltp ? formatNumber(target.ltp) : '—'}`}
			onClose={() => (isOpen = false)}
		/>
		<form class="flex flex-col gap-4 p-4" onsubmit={submit} novalidate>
			<div>
				<SvaKoshLabel for="exit-qty">Quantity</SvaKoshLabel>
				<SvaKoshInput
					id="exit-qty"
					bind:value={quantity}
					type="number"
					inputmode="numeric"
					min="1"
					max={String(Math.abs(target.quantity))}
					step="1"
					class={qtyValid ? '' : 'border-bearish-muted'}
				/>
				<p class="text-muted-foreground mt-1 text-xs">Open {Math.abs(target.quantity)}</p>
			</div>
			{#if stoploss}
				<div>
					<SvaKoshLabel for="exit-trigger">Trigger price</SvaKoshLabel>
					<SvaKoshInput
						id="exit-trigger"
						placeholder={side === 'SELL' ? 'Below LTP' : 'Above LTP'}
						bind:value={trigger}
						type="number"
						inputmode="decimal"
						min="0"
						step="0.05"
						class={triggerError ? 'border-bearish-muted' : ''}
					/>
					<p class="mt-1 text-xs {triggerError ? 'text-bearish' : 'text-muted-foreground'}">
						{triggerError || 'Exits at market once the trigger is hit.'}
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
						<SvaKoshLabel for="exit-price">Limit price</SvaKoshLabel>
						<SvaKoshInput
							id="exit-price"
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
					: stoploss
						? 'Place stop-loss'
						: `${side === 'SELL' ? 'Sell' : 'Buy'} ${qty || ''}`}
				disabled={!valid || placing}
			/>
		</form>
	{/if}
</SvaKoshModal>
