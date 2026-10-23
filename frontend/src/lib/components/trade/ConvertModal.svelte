<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshNumberInput from '$lib/components/svakosh/SvaKoshNumberInput.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import TradeSheet from '$lib/components/trade/TradeSheet.svelte';
	import { MODAL_BUTTON, MODAL_STEPPER } from '$lib/trade/const';
	import { instrumentNames } from '$lib/trade/names.svelte';
	import { convertPosition } from '$lib/trade/service';
	import type { TConvertTarget, TProduct } from '$lib/trade/types';

	const LABELS: Record<TProduct, string> = { MIS: 'Intraday', CNC: 'Delivery', NRML: 'Overnight' };

	let {
		isOpen = $bindable(false),
		target,
		onDone
	}: { isOpen: boolean; target: TConvertTarget | null; onDone?: () => void } = $props();

	let quantity = $state(0);
	let converting = $state(false);

	$effect(() => {
		if (target) quantity = Math.abs(target.quantity);
	});

	const held = $derived(Math.abs(target?.quantity ?? 0));
	const lot = $derived((target && instrumentNames.names[target.token]?.lot_size) || 1);
	const carry = $derived<TProduct>(target?.token.split(':')[1] === 'EQ' ? 'CNC' : 'NRML');
	const to = $derived<TProduct>(target?.product === 'MIS' ? carry : 'MIS');
	const qty = $derived(Math.floor(Number(quantity)));
	const dayQty = $derived(Math.max(0, held - Math.abs(target?.overnight_quantity ?? 0)));
	const valid = $derived(qty >= 1 && qty <= held && qty % lot === 0);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!target || !valid || converting) return;
		converting = true;
		const res = await convertPosition({
			account_id: target.account_id,
			token: target.token,
			side: target.quantity > 0 ? 'BUY' : 'SELL',
			quantity: qty,
			from: target.product,
			to,
			overnight: qty > dayQty
		});
		converting = false;
		const label = `${qty} ${target.symbol} to ${LABELS[to]}`;
		if (!res.ok) {
			toast.error({ title: `Convert ${label} failed`, description: res.error });
			return;
		}
		toast.success({ title: `Converted ${label}` });
		isOpen = false;
		onDone?.();
	}
</script>

<TradeSheet bind:isOpen>
	{#if target}
		<ModalHeader
			title={`Convert ${target.symbol}`}
			subtitle={`${target.product} → ${to} · ${LABELS[target.product]} to ${LABELS[to]}`}
			onClose={() => (isOpen = false)}
		/>
		<form class="flex flex-col gap-4 p-4" onsubmit={submit} novalidate>
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
					max={held}
					step={lot}
				/>
				{#if qty && qty % lot}
					<p class="text-bearish mt-1 text-xs">
						Quantity must be a multiple of the lot size {lot}.
					</p>
				{/if}
			</div>
			<SvaKoshButton
				type="submit"
				variant="solid"
				class="mt-3 {MODAL_BUTTON}"
				label={converting ? 'Converting…' : `Convert to ${LABELS[to]}`}
				disabled={!valid || converting}
			/>
		</form>
	{/if}
</TradeSheet>
