<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import TradeSheet from '$lib/components/trade/TradeSheet.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { MODAL_ACTION, MODAL_ACTIONS } from '$lib/trade/const';
	import { exitSide } from '$lib/trade/position';
	import { sendOrder } from '$lib/trade/send';
	import type { TExitTarget } from '$lib/trade/types';

	let {
		isOpen = $bindable(false),
		targets,
		noun = 'position',
		onDone
	}: {
		isOpen: boolean;
		targets: TExitTarget[];
		noun?: string;
		onDone?: () => void;
	} = $props();

	let placing = $state(false);

	async function exitAll() {
		if (placing || !targets.length) return;
		placing = true;
		let done = 0;
		for (const t of targets) {
			const quantity = Math.abs(t.quantity);
			const ok = await sendOrder(
				{
					account_id: t.account_id,
					client_order_id: crypto.randomUUID(),
					token: t.token,
					side: exitSide(t.quantity),
					product: t.product,
					type: 'MARKET',
					quantity,
					price: 0,
					trigger_price: 0
				},
				`Exit ${quantity} ${t.symbol}`,
				true
			);
			if (ok) done++;
		}
		placing = false;
		if (done) toast.success({ title: `Exit sent for ${done} of ${targets.length}` });
		isOpen = false;
		onDone?.();
	}
</script>

{#snippet actions()}
	<div class={MODAL_ACTIONS}>
		<SvaKoshButton
			variant="solid"
			class={MODAL_ACTION}
			label={placing ? 'Exiting…' : 'Exit at market'}
			disabled={placing || !targets.length}
			onclick={exitAll}
		/>
	</div>
{/snippet}

<TradeSheet bind:isOpen width="24rem" footer={actions}>
	<ModalHeader
		title={`Exit ${targets.length} ${targets.length === 1 ? noun : `${noun}s`}`}
		subtitle="Market orders for the full open quantity"
		onClose={() => (isOpen = false)}
	/>
	<div class="flex flex-col gap-4 p-4">
		<ul class="divide-glass-border max-h-64 divide-y overflow-y-auto text-sm">
			{#each targets as t (`${t.account_id}:${t.token}:${t.product}`)}
				<li class="flex items-center justify-between gap-3 py-2">
					<span class="truncate">
						{t.symbol}
						<span class="text-muted-foreground ml-1 text-xs">{t.product}</span>
					</span>
					<span
						class="shrink-0 tabular-nums {exitSide(t.quantity) === 'SELL'
							? 'text-bearish'
							: 'text-bullish'}"
					>
						{exitSide(t.quantity)}
						{Math.abs(t.quantity)}
					</span>
				</li>
			{/each}
		</ul>
	</div>
</TradeSheet>
