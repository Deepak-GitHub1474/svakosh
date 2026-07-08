<script lang="ts">
	import { fade } from 'svelte/transition';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SymbolImage from '$lib/components/symbol-image/SymbolImage.svelte';

	type TSearchHit = { name: string; exchange: string; sk_token: string };

	interface Props {
		isOpen: boolean;
		query: string;
		watchlistName?: string | null;
		isPredefined?: boolean;
		addedTokens?: Set<string>;
		onadd?: (hit: TSearchHit) => Promise<void> | void;
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

	const POOL: TSearchHit[] = [
		{ name: 'NIFTY', exchange: 'NSE', sk_token: 'SKT:1:1:NIFTY' },
		{ name: 'BANKNIFTY', exchange: 'NSE', sk_token: 'SKT:1:1:BANKNIFTY' },
		{ name: 'FINNIFTY', exchange: 'NSE', sk_token: 'SKT:1:1:FINNIFTY' },
		{ name: 'MIDCPNIFTY', exchange: 'NSE', sk_token: 'SKT:1:1:MIDCPNIFTY' },
		{ name: 'NIFTYNXT50', exchange: 'NSE', sk_token: 'SKT:1:1:NIFTYNXT50' },
		{ name: 'SENSEX', exchange: 'BSE', sk_token: 'SKT:2:1:SENSEX' },
		{ name: 'BANKEX', exchange: 'BSE', sk_token: 'SKT:2:1:BANKEX' },
		{ name: 'RELIANCE', exchange: 'NSE', sk_token: 'SKT:1:2:RELIANCE-EQ' },
		{ name: 'HDFCBANK', exchange: 'NSE', sk_token: 'SKT:1:2:HDFCBANK-EQ' },
		{ name: 'ICICIBANK', exchange: 'NSE', sk_token: 'SKT:1:2:ICICIBANK-EQ' },
		{ name: 'INFY', exchange: 'NSE', sk_token: 'SKT:1:2:INFY-EQ' },
		{ name: 'TCS', exchange: 'NSE', sk_token: 'SKT:1:2:TCS-EQ' },
		{ name: 'SBIN', exchange: 'NSE', sk_token: 'SKT:1:2:SBIN-EQ' },
		{ name: 'AXISBANK', exchange: 'NSE', sk_token: 'SKT:1:2:AXISBANK-EQ' },
		{ name: 'KOTAKBANK', exchange: 'NSE', sk_token: 'SKT:1:2:KOTAKBANK-EQ' },
		{ name: 'TATAMOTORS', exchange: 'NSE', sk_token: 'SKT:1:2:TATAMOTORS-EQ' },
		{ name: 'BHARTIARTL', exchange: 'NSE', sk_token: 'SKT:1:2:BHARTIARTL-EQ' },
		{ name: 'WIPRO', exchange: 'NSE', sk_token: 'SKT:1:2:WIPRO-EQ' },
		{ name: 'ADANIENT', exchange: 'NSE', sk_token: 'SKT:1:2:ADANIENT-EQ' },
		{ name: 'JIOFIN', exchange: 'NSE', sk_token: 'SKT:1:2:JIOFIN-EQ' },
		{ name: 'ASIANPAINT', exchange: 'NSE', sk_token: 'SKT:1:2:ASIANPAINT-EQ' }
	];

	const trimmed = $derived(query.trim());
	const hasMinQuery = $derived(trimmed.length > 2);
	const results = $derived.by(() => {
		if (!hasMinQuery) return [];
		const q = trimmed.toUpperCase();
		return POOL.filter((s) => s.name.includes(q)).slice(0, 30);
	});

	const canAdd = $derived(!!watchlistName && !isPredefined);

	let pendingToken = $state<string | null>(null);

	async function handleAdd(hit: TSearchHit) {
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
					icon="search"
					actionLabel="Search Symbols"
					actionIcon="search"
					onAction={() => onseed?.('NIFTY')}
				/>
			{:else if results.length === 0}
				<EmptyState
					title="No matches found"
					description="Try a different symbol."
					icon="search_off"
				/>
			{:else}
				{#each results as hit (hit.sk_token)}
					{@const busy = pendingToken === hit.sk_token}
					{@const added = addedTokens.has(hit.sk_token)}
					{@const disabled = !canAdd || busy || added}
					<div
						class="group flex items-center gap-3 px-3 py-2 border-b border-border-subtle hover:bg-glass transition-colors"
					>
						<SymbolImage
							name={hit.name}
							class="w-9 h-9 shrink-0 group-hover:border-primary/20"
						/>
						<div class="flex-1 min-w-0 flex flex-col">
							<span class="text-xs text-foreground truncate">{hit.name}</span>
							<span class="text-[0.625rem] text-muted-foreground truncate">{hit.exchange}</span>
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
							class="material-symbols-outlined cursor-pointer transition-colors {added
								? 'text-bullish'
								: 'text-muted-foreground hover:text-primary'} disabled:cursor-not-allowed {added
								? ''
								: 'disabled:opacity-40'}"
							style="font-size:1rem"
						>
							{added ? 'check_circle' : busy ? 'progress_activity' : 'add_circle'}
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}
