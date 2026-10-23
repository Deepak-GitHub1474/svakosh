<script lang="ts">
	import { marketFeed, type TDepthLevel } from '$lib/market/feed.svelte';

	const LEVELS = 5;

	let { token, onPick }: { token: string; onPick?: (price: number) => void } = $props();

	$effect(() => marketFeed.watchDepth(token));

	const book = $derived(marketFeed.depth[token]);
	const rows = $derived(
		Array.from({ length: LEVELS }, (_, i) => ({
			bid: book?.bids[i],
			ask: book?.asks[i]
		}))
	);
	const total = (levels: TDepthLevel[] = []) => levels.reduce((sum, l) => sum + l.qty, 0);
	const qty = (value?: number) => (value ? value.toLocaleString('en-IN') : '—');
	const price = (level?: TDepthLevel) => (level?.price ? level.price.toFixed(2) : '—');
</script>

{#snippet cell(level: TDepthLevel | undefined, tone: string)}
	{#if level?.price && onPick}
		<button
			type="button"
			class="{tone} hover:bg-glass rounded px-1 tabular-nums transition-colors"
			onclick={() => onPick(level.price)}>{price(level)}</button
		>
	{:else}
		<span class="{tone} px-1 tabular-nums">{price(level)}</span>
	{/if}
{/snippet}

<div class="grid grid-cols-2 gap-3 text-xs tabular-nums">
	{#each [{ side: 'bid', label: 'Bid', tone: 'text-bullish' }, { side: 'ask', label: 'Ask', tone: 'text-bearish' }] as col (col.side)}
		{@const levels = col.side === 'bid' ? book?.bids : book?.asks}
		<div class="bg-glass/40 rounded-lg p-2">
			<div class="text-muted-foreground mb-1 grid grid-cols-[1fr_auto_auto] gap-2 px-1">
				<span>{col.label}</span>
				<span class="text-right">Orders</span>
				<span class="text-right">Qty</span>
			</div>
			{#each rows as row, i (i)}
				{@const level = col.side === 'bid' ? row.bid : row.ask}
				<div class="grid grid-cols-[1fr_auto_auto] items-center gap-2 py-0.5">
					{@render cell(level, col.tone)}
					<span class="text-muted-foreground text-right">{level?.orders || '—'}</span>
					<span class="text-foreground px-1 text-right">{qty(level?.qty)}</span>
				</div>
			{/each}
			<div class="text-muted-foreground mt-1 flex justify-between px-1">
				<span>Total</span>
				<span class="text-foreground">{qty(total(levels))}</span>
			</div>
		</div>
	{/each}
</div>
{#if !book}
	<p class="text-muted-foreground mt-2 text-center text-xs">Waiting for market depth…</p>
{/if}
