<script lang="ts">
	import type { TBook, TBookLevel } from '$lib/market/feed.svelte';
	import { formatNumber } from '$lib/utils';

	let { book }: { book?: TBook } = $props();

	const LEVELS = 5;
	const empty: TBookLevel = { price: 0, qty: 0, orders: 0 };

	const bids = $derived(Array.from({ length: LEVELS }, (_, i) => book?.bids[i] ?? empty));
	const asks = $derived(Array.from({ length: LEVELS }, (_, i) => book?.asks[i] ?? empty));
	const bidTotal = $derived(bids.reduce((sum, l) => sum + l.qty, 0));
	const askTotal = $derived(asks.reduce((sum, l) => sum + l.qty, 0));
	const maxQty = $derived(Math.max(1, ...bids.map((l) => l.qty), ...asks.map((l) => l.qty)));

	const qty = (v: number) => (v ? v.toLocaleString('en-IN') : '—');
	const price = (v: number) => (v ? formatNumber(v) : '—');
</script>

{#snippet side(label: string, levels: TBookLevel[], total: number, tone: string, bar: string)}
	<div class="min-w-0 flex-1">
		<div
			class="text-muted-foreground border-border-subtle bg-glass flex justify-between border-b px-2 py-2 text-xs"
		>
			<span>{label}</span>
			<span>Quantity</span>
		</div>
		{#each levels as level, i (i)}
			<div
				class="border-border-subtle flex items-center justify-between gap-2 border-b px-2 py-1.5 text-xs tabular-nums"
			>
				<span class="text-foreground">{price(level.price)}</span>
				<span class="relative flex min-w-10 justify-end">
					<span
						class="absolute inset-y-0 right-0 rounded-sm {bar} transition-[width] duration-300"
						style="width: {(level.qty / maxQty) * 100}%"
					></span>
					<span class="text-foreground relative px-1">{qty(level.qty)}</span>
				</span>
			</div>
		{/each}
		<div class="bg-glass flex justify-between px-2 py-2 text-xs font-semibold tabular-nums">
			<span class="text-foreground">TOTAL</span>
			<span class={tone}>{qty(total)}</span>
		</div>
	</div>
{/snippet}

<div class="border-border-subtle flex overflow-hidden rounded-md border">
	{@render side('Bid', bids, bidTotal, 'text-bullish', 'bg-bullish-subtle')}
	<div class="bg-border-subtle w-px shrink-0"></div>
	{@render side('Ask', asks, askTotal, 'text-bearish', 'bg-bearish-subtle')}
</div>
