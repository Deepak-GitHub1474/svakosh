<script lang="ts">
	import { TRADE_BUTTON, TRADE_LABEL } from '$lib/components/order/const';
	import { MODAL_BUTTON } from '$lib/trade/const';
	import SvaKoshDrawer from '$lib/components/svakosh/SvaKoshDrawer.svelte';
	import SvaKoshSheet from '$lib/components/svakosh/SvaKoshSheet.svelte';
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';
	import Delete from '$lib/components/svg-provider/material/Delete.svelte';
	import StickyNote2 from '$lib/components/svg-provider/material/StickyNote2.svelte';
	import MarketDepth from './MarketDepth.svelte';
	import { changeOf, marketFeed, type TQuoteField } from '$lib/market/feed.svelte';
	import { istDateTime } from '$lib/market/time';
	import { cn, formatNumber } from '$lib/utils';
	import { isTradable, type TWatchlistEntry } from './types';

	interface Props {
		entry: TWatchlistEntry | null;
		canMutate: boolean;
		onClose: () => void;
		onNote: () => void;
		onRemove: () => void;
		onOrder: (transaction: 'BUY' | 'SELL') => void;
	}

	let { entry, canMutate, onClose, onNote, onRemove, onOrder }: Props = $props();

	const FIELDS: TQuoteField[] = [
		'ltp',
		'prev_close',
		'open',
		'high',
		'low',
		'volume',
		'atp',
		'ltq',
		'total_buy_qty',
		'total_sell_qty',
		'oi',
		'prev_oi',
		'upper_circuit',
		'lower_circuit',
		'high_52w',
		'low_52w',
		'ts'
	];
	const DERIVATIVES = new Set(['FUTURE', 'OPTION']);

	let shown = $state<TWatchlistEntry | null>(null);
	let isDesktop = $state(false);

	$effect(() => {
		if (entry) shown = entry;
	});

	$effect(() => {
		const mq = window.matchMedia('(min-width: 1024px)');
		const sync = () => (isDesktop = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	const tradable = $derived(isTradable(shown?.instrument ?? ''));
	const derivative = $derived(DERIVATIVES.has((shown?.instrument ?? '').toUpperCase()));

	$effect(() => {
		if (!entry) return;
		const token = entry.sk_token;
		const stopQuote = marketFeed.subscribe([token], FIELDS);
		const stopDepth = isTradable(entry.instrument) ? marketFeed.watchDepth(token) : undefined;
		return () => {
			stopQuote();
			stopDepth?.();
		};
	});

	const quote = $derived(shown ? (marketFeed.quotes[shown.sk_token] ?? {}) : {});
	const book = $derived(shown ? marketFeed.books[shown.sk_token] : undefined);
	const move = $derived(changeOf(quote));
	const isUp = $derived(move.change >= 0);
	const sign = $derived(move.change > 0 ? '+' : '');

	const low = $derived(quote.low ?? 0);
	const high = $derived(quote.high ?? 0);
	const span = $derived(high - low);
	const at = (v?: number) =>
		span > 0 && v ? Math.min(100, Math.max(0, ((v - low) / span) * 100)) : 0;
	const openAt = $derived(at(quote.open));
	const ltpAt = $derived(at(quote.ltp));
	const ltpUp = $derived((quote.ltp ?? 0) >= (quote.open ?? 0));

	const price = (v?: number) => (v ? formatNumber(v) : '—');
	const whole = (v?: number) => (v !== undefined ? v.toLocaleString('en-IN') : '—');

	const metrics = $derived.by(() => {
		if (!tradable)
			return [
				['LTP', price(quote.ltp)],
				['52W High', price(quote.high_52w)],
				['52W Low', price(quote.low_52w)]
			];
		const rows = [
			['LTP', price(quote.ltp)],
			['ATP', price(quote.atp)],
			['LTQ', whole(quote.ltq)],
			['LTT', quote.ts ? istDateTime(quote.ts) : '—'],
			['Volume', whole(quote.volume)]
		];
		if (derivative) rows.push(['OI', whole(quote.oi)], ['Previous OI', whole(quote.prev_oi)]);
		rows.push(
			['Total Buy Qty', whole(quote.total_buy_qty)],
			['Total Sell Qty', whole(quote.total_sell_qty)],
			['52W High', price(quote.high_52w)],
			['52W Low', price(quote.low_52w)]
		);
		return rows;
	});

	const ICON_BUTTON =
		'bg-surface-elevated text-foreground/80 hover:text-foreground flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors';
</script>

{#snippet header()}
	{#if shown}
		<div class="flex items-center gap-2 px-4 py-3">
			<div class="flex min-w-0 flex-1 flex-col">
				<span class="text-foreground truncate text-base font-medium">{shown.trading_symbol}</span>
				<span class="text-xs tabular-nums">
					<span class="text-foreground">{price(quote.ltp)}</span>
					<span class={isUp ? 'text-bullish' : 'text-bearish'}>
						{sign}{formatNumber(move.change)} ({sign}{formatNumber(move.change_pct)}%)
					</span>
				</span>
			</div>
			{#if tradable || canMutate}
				<button
					type="button"
					onclick={onNote}
					aria-label={shown.symbol_note ? 'Edit note' : 'Add note'}
					title={shown.symbol_note ? 'Edit note' : 'Add note'}
					class={cn(ICON_BUTTON, shown.symbol_note && 'text-primary')}
				>
					<StickyNote2 class="text-base" />
				</button>
			{/if}
			{#if canMutate}
				<button
					type="button"
					onclick={onRemove}
					aria-label="Remove"
					title="Remove"
					class={cn(ICON_BUTTON, 'text-bearish hover:text-bearish-hover')}
				>
					<Delete class="text-base" />
				</button>
			{/if}
			{#if isDesktop}
				<button type="button" onclick={onClose} aria-label="Close" class={ICON_BUTTON}>
					<CloseIcon class="h-4 w-4" />
				</button>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet stat(label: string, value: string, end = false)}
	<div class="flex flex-col gap-0.5 {end ? 'items-end' : ''}">
		<span class="text-muted-foreground text-xs">{label}</span>
		<span class="text-foreground text-sm tabular-nums">{value}</span>
	</div>
{/snippet}

{#snippet pair(label: string, value: string)}
	<div class="flex items-center justify-between gap-2 text-xs tabular-nums">
		<span class="text-muted-foreground">{label}</span>
		<span class="text-foreground">{value}</span>
	</div>
{/snippet}

{#snippet body()}
	<div class="flex flex-col gap-3 p-3">
		{#if tradable}
			<section class="bg-surface-elevated flex flex-col gap-3 rounded-lg p-3">
				<h3 class="text-foreground text-sm font-medium">Market Depth</h3>
				<MarketDepth {book} />
			</section>
		{/if}

		<section class="bg-surface-elevated flex flex-col gap-3 rounded-lg p-3">
			<h3 class="text-foreground text-sm font-medium">Today's Range</h3>
			<div class="grid grid-cols-4 gap-2">
				{@render stat('Open', price(quote.open))}
				{@render stat('High', price(quote.high))}
				{@render stat('Low', price(quote.low))}
				{@render stat('Prev. Close', price(quote.prev_close), true)}
			</div>
			<div class="relative mt-3 mb-4 h-1.5 rounded-full bg-white/10">
				{#if span > 0}
					<div
						class="absolute inset-y-0 rounded-full transition-all duration-300 {ltpUp
							? 'bg-bullish'
							: 'bg-bearish'}"
						style="left: {Math.min(openAt, ltpAt)}%; width: {Math.abs(ltpAt - openAt)}%"
					></div>
					<div
						class="bg-muted-foreground absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-300"
						style="left: {openAt}%"
					></div>
					<div
						class="border-b-foreground absolute top-full mt-1 size-0 -translate-x-1/2 border-x-[0.3125rem] border-b-[0.5rem] border-x-transparent transition-[left] duration-300"
						style="left: {ltpAt}%"
					></div>
				{/if}
			</div>
			{#if tradable}
				<div class="grid grid-cols-2 gap-x-6 gap-y-3">
					{@render pair('Lower Circuit', price(quote.lower_circuit))}
					{@render pair('Upper Circuit', price(quote.upper_circuit))}
				</div>
			{/if}
		</section>

		<section class="bg-surface-elevated flex flex-col gap-3 rounded-lg p-3">
			<h3 class="text-foreground text-sm font-medium">Market Metrics</h3>
			{#each metrics as [label, value] (label)}
				{@render pair(label, value)}
			{/each}
		</section>
	</div>
{/snippet}

{#snippet actions()}
	<div class="flex gap-3">
		<button
			type="button"
			onclick={() => onOrder('BUY')}
			class="flex {MODAL_BUTTON} flex-1 cursor-pointer items-center justify-center rounded-md border {TRADE_LABEL} {TRADE_BUTTON.BUY}"
		>
			Buy
		</button>
		<button
			type="button"
			onclick={() => onOrder('SELL')}
			class="flex {MODAL_BUTTON} flex-1 cursor-pointer items-center justify-center rounded-md border {TRADE_LABEL} {TRADE_BUTTON.SELL}"
		>
			Sell
		</button>
	</div>
{/snippet}

{#if isDesktop}
	<SvaKoshSheet isOpen={!!entry} {onClose} {header} footer={tradable ? actions : undefined}>
		{@render body()}
	</SvaKoshSheet>
{:else}
	<SvaKoshDrawer
		isOpen={!!entry}
		{onClose}
		snapPoints={[90]}
		footer={tradable ? actions : undefined}
		class="overflow-hidden"
	>
		<div class="bg-surface border-border-subtle sticky top-0 z-10 border-b">
			{@render header()}
		</div>
		{@render body()}
	</SvaKoshDrawer>
{/if}
