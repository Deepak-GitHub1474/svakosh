<script lang="ts">
	import SymbolImage from '$lib/components/symbol-image/SymbolImage.svelte';
	import WatchlistEntryActions from './WatchlistEntryActions.svelte';
	import { formatNumber } from '$lib/utils';
	import { isTradable } from './types';

	interface Props {
		name: string;
		exchange?: string;
		instrument?: string;
		companyName?: string | null;
		ltp: number;
		prevClose: number;
		logoUrl?: string;
		canMutate?: boolean;
		hasNote?: boolean;
		onNote?: () => void;
		onRemove?: () => Promise<void> | void;
	}

	let {
		name,
		exchange,
		instrument = '',
		companyName = null,
		ltp,
		prevClose,
		logoUrl,
		canMutate = false,
		hasNote = false,
		onNote,
		onRemove
	}: Props = $props();

	const subtitle = $derived(companyName?.trim() || exchange || '');

	const change = $derived(ltp - prevClose);
	const changePct = $derived(prevClose !== 0 ? (change / prevClose) * 100 : 0);
	const isUp = $derived(change >= 0);
	const sign = $derived(change > 0 ? '+' : '');
	const tradable = $derived(isTradable(instrument));
	const showNote = $derived(tradable || canMutate);
	const showMenu = $derived(canMutate);
	const hasActions = $derived(showNote || showMenu);

	let actionsMenuOpen = $state(false);
</script>

<div
	onmouseleave={() => (actionsMenuOpen = false)}
	role="presentation"
	class="group flex items-center gap-3 px-3 py-2 border-b border-border-subtle hover:bg-glass transition-colors cursor-pointer"
>
	<SymbolImage {name} {logoUrl} class="w-9 h-9 shrink-0 group-hover:border-primary/20" />

	<div class="flex-1 min-w-0 flex items-center justify-between gap-2">
		<div class="flex flex-col min-w-0">
			<span class="text-xs text-foreground truncate">{name}</span>
			{#if subtitle}
				<span class="text-[0.625rem] text-muted-foreground truncate">{subtitle}</span>
			{/if}
		</div>

		<div class="flex items-center shrink-0">
			<div class="flex flex-col items-end {hasActions ? 'group-hover:hidden' : ''}">
				<span class="text-xs text-foreground">{formatNumber(ltp)}</span>
				<span class="text-[0.625rem] {isUp ? 'text-bullish' : 'text-bearish'}">
					{sign}{formatNumber(change)} ({sign}{formatNumber(changePct)}%)
				</span>
			</div>
			{#if hasActions}
				<div class="hidden group-hover:flex">
					<WatchlistEntryActions
						bind:menuOpen={actionsMenuOpen}
						{showNote}
						{showMenu}
						{hasNote}
						{onNote}
						{onRemove}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
