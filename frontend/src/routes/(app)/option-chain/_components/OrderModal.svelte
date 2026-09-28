<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import type { TOrderDraft } from '../_lib/types';

	let { isOpen = $bindable(false), draft }: { isOpen: boolean; draft: TOrderDraft | null } =
		$props();

	let transaction = $state<'BUY' | 'SELL'>('BUY');
	let orderType = $state<'Market' | 'Limit'>('Market');
	let product = $state<'MIS' | 'NRML'>('MIS');
	let lots = $state(1);
	let price = $state(0);

	$effect(() => {
		if (!draft) return;
		transaction = draft.transaction;
		orderType = 'Market';
		product = 'MIS';
		lots = 1;
		price = draft.price;
	});

	const quantity = $derived(lots * (draft?.lotSize ?? 1));
	const value = $derived(quantity * (orderType === 'Market' ? (draft?.price ?? 0) : price));

	function submit() {
		if (!draft) return;
		toast.success({
			title: `${transaction} ${quantity} × ${draft.strike} ${draft.side}`,
			description: 'Simulated only — nothing was sent to a broker.'
		});
		isOpen = false;
	}
</script>

<SvaKoshModal bind:isOpen title="Place order" width="26rem" showClose>
	{#if draft}
		<div class="space-y-4">
			<div class="border-border-subtle bg-background/60 rounded-lg border px-3 py-2">
				<p class="text-muted-foreground text-[0.625rem] tracking-[0.12em] uppercase">Instrument</p>
				<p class="mt-0.5 text-sm font-medium tabular-nums">
					{draft.strike}
					{draft.side}
				</p>
				<p class="text-muted-foreground mt-0.5 text-[0.625rem] break-all">{draft.token}</p>
			</div>

			<div class="grid grid-cols-2 gap-2">
				{#each ['BUY', 'SELL'] as side (side)}
					<button
						type="button"
						onclick={() => (transaction = side as 'BUY' | 'SELL')}
						class="rounded-md border py-2 text-xs tracking-wide {transaction === side
							? side === 'BUY'
								? 'border-bullish text-bullish bg-bullish/10'
								: 'border-bearish text-bearish bg-bearish/10'
							: 'border-border-subtle text-muted-foreground'}"
					>
						{side}
					</button>
				{/each}
			</div>

			<div class="grid grid-cols-2 gap-3">
				<label class="block">
					<span class="text-muted-foreground text-[0.625rem] tracking-wide uppercase">Product</span>
					<select
						bind:value={product}
						class="border-border-subtle bg-background/60 mt-1 w-full rounded-md border px-2 py-1.5 text-xs"
					>
						<option value="MIS">MIS</option>
						<option value="NRML">NRML</option>
					</select>
				</label>

				<label class="block">
					<span class="text-muted-foreground text-[0.625rem] tracking-wide uppercase">Type</span>
					<select
						bind:value={orderType}
						class="border-border-subtle bg-background/60 mt-1 w-full rounded-md border px-2 py-1.5 text-xs"
					>
						<option value="Market">Market</option>
						<option value="Limit">Limit</option>
					</select>
				</label>

				<label class="block">
					<span class="text-muted-foreground text-[0.625rem] tracking-wide uppercase">
						Lots ({draft.lotSize})
					</span>
					<input
						type="number"
						min="1"
						bind:value={lots}
						class="border-border-subtle bg-background/60 mt-1 w-full rounded-md border px-2 py-1.5 text-xs tabular-nums"
					/>
				</label>

				<label class="block">
					<span class="text-muted-foreground text-[0.625rem] tracking-wide uppercase">Price</span>
					<input
						type="number"
						step="0.05"
						bind:value={price}
						disabled={orderType === 'Market'}
						class="border-border-subtle bg-background/60 mt-1 w-full rounded-md border px-2 py-1.5 text-xs tabular-nums disabled:opacity-40"
					/>
				</label>
			</div>

			<dl class="border-border-subtle flex justify-between border-t pt-3 text-xs">
				<dt class="text-muted-foreground">Quantity</dt>
				<dd class="tabular-nums">{quantity}</dd>
			</dl>
			<dl class="flex justify-between text-xs">
				<dt class="text-muted-foreground">Approx value</dt>
				<dd class="tabular-nums">₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</dd>
			</dl>

			<p class="text-muted-foreground text-[0.625rem]">
				Simulation only. Nothing is sent to a broker.
			</p>

			<SvaKoshButton
				variant={transaction === 'BUY' ? 'bullish' : 'bearish'}
				label="{transaction} {quantity}"
				class="w-full"
				onclick={submit}
			/>
		</div>
	{/if}
</SvaKoshModal>
