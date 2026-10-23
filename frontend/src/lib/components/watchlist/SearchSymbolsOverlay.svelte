<script lang="ts">
	import { fade } from 'svelte/transition';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SymbolImage from '$lib/components/symbol-image/SymbolImage.svelte';
	import AddCircle from '$lib/components/svg-provider/material/AddCircle.svelte';
	import CheckCircle from '$lib/components/svg-provider/material/CheckCircle.svelte';
	import ProgressActivity from '$lib/components/svg-provider/material/ProgressActivity.svelte';
	import Search from '$lib/components/svg-provider/material/Search.svelte';
	import SearchOff from '$lib/components/svg-provider/material/SearchOff.svelte';

	import { searchSymbols } from './service';
	import type { TSymbol } from './types';

	const SEARCH_DEBOUNCE_MS = 250;

	interface Props {
		isOpen: boolean;
		query: string;
		watchlistName?: string | null;
		isPredefined?: boolean;
		addedTokens?: Set<string>;
		onadd?: (hit: TSymbol) => Promise<void> | void;
		onseed?: (q: string) => void;
	}

	let {
		isOpen,
		query,
		watchlistName = null,
		isPredefined = false,
		addedTokens = new Set<string>(),
		onadd,
		onseed
	}: Props = $props();

	const trimmed = $derived(query.trim());
	const hasMinQuery = $derived(trimmed.length > 2);

	let results = $state<TSymbol[]>([]);
	let searching = $state(false);
	let searchError = $state('');

	$effect(() => {
		const q = trimmed;
		if (q.length <= 2) {
			results = [];
			searchError = '';
			return;
		}
		searching = true;
		const timer = setTimeout(async () => {
			const res = await searchSymbols(q);
			if (q !== trimmed) return;
			searching = false;
			results = res.ok ? res.data : [];
			searchError = res.ok ? '' : res.error;
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	});

	const canAdd = $derived(!!watchlistName && !isPredefined);

	let pendingToken = $state<string | null>(null);

	async function handleAdd(hit: TSymbol) {
		if (!canAdd || pendingToken) return;
		pendingToken = hit.sk_token;
		try {
			await onadd?.(hit);
		} finally {
			pendingToken = null;
		}
	}
</script>

{#if isOpen}
	<div
		data-search-zone
		class="absolute inset-0 z-40 bg-background flex flex-col"
		transition:fade={{ duration: 120 }}
	>
		<div class="flex-1 min-h-0 overflow-y-auto pb-6 hide-scrollbar">
			{#if !hasMinQuery}
				<EmptyState
					title="Search Symbols"
					description="Enter at least 3 characters to search NSE / BSE / F&O."
					icon={Search}
					actionLabel="Search Symbols"
					actionIcon={Search}
					onAction={() => onseed?.('NIFTY')}
				/>
			{:else if searching && results.length === 0}
				<EmptyState title="Searching..." icon={ProgressActivity} />
			{:else if searchError}
				<EmptyState title="Search unavailable" description={searchError} icon={SearchOff} />
			{:else if results.length === 0}
				<EmptyState
					title="No matches found"
					description="Try a different symbol."
					icon={SearchOff}
				/>
			{:else}
				{#each results as hit (hit.sk_token)}
					{@const busy = pendingToken === hit.sk_token}
					{@const added = addedTokens.has(hit.sk_token)}
					{@const disabled = !canAdd || busy || added}
					{@const StateIcon = added
						? CheckCircle
						: busy
							? ProgressActivity
							: AddCircle}
					<div
						class="group flex items-center gap-3 pl-3 pr-4 lg:pl-2 lg:pr-3 py-2 border-b border-border-subtle hover:bg-glass transition-colors"
					>
						<SymbolImage
							name={hit.underlying_symbol}
							class="w-9 h-9 shrink-0 group-hover:border-primary/20"
						/>
						<div class="flex-1 min-w-0 flex flex-col">
							<span class="text-xs text-foreground truncate">{hit.trading_symbol}</span>
							<span class="text-[0.625rem] text-muted-foreground truncate"
								>{hit.exchange} · {hit.instrument}</span
							>
						</div>
						<button
							type="button"
							onclick={() => handleAdd(hit)}
							{disabled}
							aria-label={added
								? 'Already in watchlist'
								: canAdd
									? 'Add to watchlist'
									: 'Predefined watchlist is read-only'}
							title={added
								? 'Already in watchlist'
								: !canAdd
									? 'Predefined watchlists are read-only'
									: busy
										? 'Adding...'
										: 'Add to watchlist'}
							class="cursor-pointer transition-colors {added
								? 'text-bullish'
								: 'text-muted-foreground hover:text-primary'} disabled:cursor-not-allowed {added
								? ''
								: 'disabled:opacity-40'}"
						>
							<StateIcon style="font-size:1rem" />
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}
