<script lang="ts">
	import { TRADE_BUTTON } from '$lib/components/order/const';
	let {
		side,
		strike,
		align,
		onorder
	}: {
		side: 'CE' | 'PE';
		strike: string;
		align: 'left' | 'right';
		onorder: (side: 'CE' | 'PE', transaction: 'BUY' | 'SELL') => void;
	} = $props();

	const contract = $derived(side === 'CE' ? 'call' : 'put');
	const action =
		'inline-flex size-8 items-center justify-center rounded border text-sm font-medium transition-colors';
</script>

<span
	class="pointer-events-none absolute inset-y-0 z-10 hidden items-center gap-4 opacity-0 transition-opacity duration-150 group-focus-within/row:pointer-events-auto group-focus-within/row:opacity-100 group-hover/row:pointer-events-auto group-hover/row:opacity-100 lg:flex {align ===
	'left'
		? 'left-3'
		: 'right-3'}"
>
	<button
		type="button"
		onclick={() => onorder(side, 'BUY')}
		class="{action} {TRADE_BUTTON.BUY}"
		aria-label="Buy {strike} {contract}"
	>
		B
	</button>
	<button
		type="button"
		onclick={() => onorder(side, 'SELL')}
		class="{action} {TRADE_BUTTON.SELL}"
		aria-label="Sell {strike} {contract}"
	>
		S
	</button>
</span>
