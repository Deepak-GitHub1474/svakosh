<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { uiState } from '$lib/store/ui.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshBadge from '$lib/components/svakosh/SvaKoshBadge.svelte';
	import WatchlistsDropdown from './WatchlistsDropdown.svelte';
	import SearchSymbolsOverlay from './SearchSymbolsOverlay.svelte';
	import WatchlistSortBar from './WatchlistSortBar.svelte';
	import WatchlistEntry from './WatchlistEntry.svelte';
	import WatchlistNamePopover from './WatchlistNamePopover.svelte';
	import DeleteWatchlistConfirm from './DeleteWatchlistConfirm.svelte';
	import NoteEditorPopover from './NoteEditorPopover.svelte';
	import {
		addSymbolToWatchlist,
		createWatchlist,
		deleteSymbolNote,
		deleteWatchlist,
		getWatchlistEntries,
		removeSymbolFromWatchlist,
		renameWatchlist,
		upsertSymbolNote
	} from './service';
	import type {
		TSortDirection,
		TWatchlistEntry,
		TWatchlistItem,
		TWatchlistSortBy
	} from './types';

	interface Props {
		watchlists: TWatchlistItem[];
	}

	let { watchlists }: Props = $props();

	let userSelection = $state<string | null>(null);
	const selectedName = $derived(userSelection ?? watchlists[0]?.name ?? null);
	const selectedItem = $derived(watchlists.find((w) => w.name === selectedName) ?? null);

	let entries = $state<TWatchlistEntry[]>([]);
	let entriesLoading = $state(false);
	let entriesError = $state<string | null>(null);
	const addedTokens = $derived(new Set(entries.map((e) => e.sk_token)));

	function entryChange(e: TWatchlistEntry): number {
		return e.ltp - e.prev_close;
	}
	function entryChangePct(e: TWatchlistEntry): number {
		return e.prev_close !== 0 ? (entryChange(e) / e.prev_close) * 100 : 0;
	}

	const sortedEntries = $derived.by(() => {
		const list = [...entries];
		list.sort((a, b) => {
			let cmp = 0;
			switch (sortBy) {
				case 'name':
					cmp = a.trading_symbol.localeCompare(b.trading_symbol);
					break;
				case 'ltp':
					cmp = a.ltp - b.ltp;
					break;
				case 'change':
					cmp = entryChange(a) - entryChange(b);
					break;
				case 'changePct':
					cmp = entryChangePct(a) - entryChangePct(b);
					break;
			}
			return sortDirection === 'asc' ? cmp : -cmp;
		});
		return list;
	});

	async function fetchEntries(name: string | null) {
		if (!name) {
			entries = [];
			return;
		}
		entriesLoading = true;
		entriesError = null;
		const res = await getWatchlistEntries(name);
		if (res.ok) {
			entries = res.data.entries;
		} else {
			entries = [];
			entriesError = res.error;
		}
		entriesLoading = false;
	}

	$effect(() => {
		const name = selectedName;
		let cancelled = false;
		(async () => {
			const target = name;
			await fetchEntries(target);
			if (cancelled || target !== selectedName) {
				entries = [];
			}
		})();
		return () => {
			cancelled = true;
		};
	});

	let isDropdownOpen = $state(false);
	let isCreatePopoverOpen = $state(false);
	let renameTarget = $state<string | null>(null);
	let deleteTarget = $state<string | null>(null);
	let removeSymbolTarget = $state<{ sk_token: string; name: string } | null>(null);
	let noteTarget = $state<{ sk_token: string; name: string; note: string } | null>(null);

	let searchQuery = $state('');
	let isSearchFocused = $state(false);
	let searchInput = $state<HTMLInputElement>();

	let sortBy = $state<TWatchlistSortBy>('name');
	let sortDirection = $state<TSortDirection>('asc');

	function selectWatchlist(name: string) {
		userSelection = name;
	}

	function clearSearch() {
		searchQuery = '';
		searchInput?.focus();
	}

	function focusSearchInput() {
		searchQuery = 'NIFTY';
		isSearchFocused = true;
		searchInput?.focus();
	}

	function handleSortChange(key: TWatchlistSortBy) {
		if (sortBy === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = key;
			sortDirection = 'asc';
		}
	}

	function openCreatePopover() {
		isDropdownOpen = false;
		isCreatePopoverOpen = true;
	}

	async function handleCreateWatchlist(name: string) {
		const res = await createWatchlist(name);
		if (!res.ok) return res;
		await invalidateAll();
		userSelection = res.data.name;
		return { ok: true as const };
	}

	async function handleRenameWatchlist(newName: string) {
		const oldName = renameTarget;
		if (!oldName) return { ok: false as const, error: 'No watchlist selected.' };
		const res = await renameWatchlist(oldName, newName);
		if (!res.ok) return res;
		await invalidateAll();
		if (userSelection === oldName) userSelection = res.data.new_name;
		return { ok: true as const };
	}

	async function handleDeleteWatchlist() {
		const name = deleteTarget;
		if (!name) return { ok: false as const, error: 'No watchlist selected.' };
		const res = await deleteWatchlist(name);
		if (!res.ok) return res;
		await invalidateAll();
		if (userSelection === name) userSelection = null;
		return { ok: true as const };
	}

	async function handleAddSymbol(hit: { name: string; sk_token: string }) {
		if (!selectedName || selectedItem?.predefined) return;
		const res = await addSymbolToWatchlist(selectedName, hit.sk_token);
		if (res.ok || res.status === 409) {
			await Promise.all([invalidateAll(), fetchEntries(selectedName)]);
		} else {
			console.error('add symbol failed:', res.error);
		}
	}

	function requestRemoveSymbol(sk_token: string, name: string) {
		if (!selectedName || selectedItem?.predefined) return;
		removeSymbolTarget = { sk_token, name };
	}

	async function confirmRemoveSymbol() {
		if (!selectedName || !removeSymbolTarget) {
			return { ok: false as const, error: 'No symbol selected.' };
		}
		const res = await removeSymbolFromWatchlist(selectedName, removeSymbolTarget.sk_token);
		if (res.ok || res.status === 404) {
			await Promise.all([invalidateAll(), fetchEntries(selectedName)]);
			return { ok: true as const };
		}
		return res;
	}

	async function handleSaveNote(note: string) {
		if (!selectedName || !noteTarget) return { ok: false as const, error: 'No symbol selected.' };
		const res = await upsertSymbolNote(selectedName, noteTarget.sk_token, note);
		if (!res.ok) return res;
		await fetchEntries(selectedName);
		return { ok: true as const };
	}

	async function handleClearNote() {
		if (!selectedName || !noteTarget) return { ok: false as const, error: 'No symbol selected.' };
		const res = await deleteSymbolNote(selectedName, noteTarget.sk_token);
		if (!res.ok) return res;
		await fetchEntries(selectedName);
		return { ok: true as const };
	}

	function clickAwayAction(isInZone: (target: HTMLElement, node: HTMLElement) => boolean, close: () => void) {
		return (node: HTMLElement) => {
			function onClick(e: MouseEvent) {
				const target = e.target as HTMLElement | null;
				if (target && !isInZone(target, node)) close();
			}
			document.addEventListener('mousedown', onClick);
			return {
				destroy() {
					document.removeEventListener('mousedown', onClick);
				}
			};
		};
	}

	const handleClickOutsideDropdown = clickAwayAction(
		(t, node) => node.contains(t),
		() => {
			if (isDropdownOpen) isDropdownOpen = false;
		}
	);

	const handleClickOutsideSearch = clickAwayAction(
		(t) => !!t.closest('[data-search-zone]'),
		() => {
			if (isSearchFocused) isSearchFocused = false;
		}
	);
</script>

<aside
	class="fixed top-12 h-[calc(100vh-3rem)] flex flex-col bg-background border-r border-border-subtle transition-all duration-300 ease-in-out
    {uiState.isWatchlistVisible ? 'translate-x-0' : '-translate-x-full'}
    left-[56px] w-[280px] 2xl:w-[340px]"
>
	<div use:handleClickOutsideSearch class="contents">
		<div
			data-search-zone
			class="flex items-center gap-2 p-2 border-b border-border-subtle bg-glass"
		>
			<span class="material-symbols-outlined text-muted-foreground icon-size">search</span>
			<input
				bind:this={searchInput}
				bind:value={searchQuery}
				onfocus={() => (isSearchFocused = true)}
				type="text"
				placeholder="Search Company you want to invest"
				class="flex-1 min-w-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none border-none"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={clearSearch}
					aria-label="Clear search"
					class="material-symbols-outlined text-muted-foreground hover:text-error transition-colors"
					style="font-size:1rem"
				>
					close
				</button>
			{/if}
		</div>
	</div>

	<div class="relative" use:handleClickOutsideDropdown>
		<button
			type="button"
			onclick={() => (isDropdownOpen = !isDropdownOpen)}
			class="w-full flex items-center justify-between gap-2 p-2 border-b border-border-subtle hover:bg-glass transition-colors cursor-pointer"
		>
			<div class="flex items-center gap-1.5 min-w-0">
				<span class="text-xs text-foreground truncate text-left">
					{selectedName ?? 'Select Watchlist'}
				</span>
				{#if selectedItem?.predefined}
					<SvaKoshBadge label="Predefined" variant="primary" class="shrink-0" />
				{/if}
			</div>
			<span
				class="material-symbols-outlined icon-size transition-transform duration-200 {isDropdownOpen
					? 'rotate-180 text-primary'
					: 'text-muted-foreground'}"
			>
				arrow_drop_down_circle
			</span>
		</button>

		<WatchlistsDropdown
			isOpen={isDropdownOpen}
			{watchlists}
			{selectedName}
			onClose={() => (isDropdownOpen = false)}
			onSelect={selectWatchlist}
			onCreate={openCreatePopover}
			onRename={(name) => (renameTarget = name)}
			onDelete={(name) => (deleteTarget = name)}
		/>
	</div>

	<div class="flex-1 min-h-0 relative">
		<div class="h-full overflow-y-auto pb-6 hide-scrollbar">
			{#if entriesLoading && entries.length === 0}
				<div class="flex items-center justify-center h-full text-[0.625rem] text-muted-foreground">
					Loading...
				</div>
			{:else if entriesError}
				<EmptyState title="Couldn't load entries" description={entriesError} icon="error" />
			{:else if entries.length === 0}
				<EmptyState
					title="This watchlist is empty"
					description="Search and add symbols to track live market data."
					icon="playlist_add"
					actionLabel="Search Symbols"
					actionIcon="search"
					onAction={focusSearchInput}
				/>
			{:else}
				{#each sortedEntries as entry (entry.sk_token)}
					<WatchlistEntry
						name={entry.trading_symbol}
						exchange={entry.exchange}
						instrument={entry.instrument}
						companyName={entry.company_name ?? null}
						ltp={entry.ltp}
						prevClose={entry.prev_close}
						canMutate={!selectedItem?.predefined}
						hasNote={!!entry.symbol_note}
						onNote={() =>
							(noteTarget = {
								sk_token: entry.sk_token,
								name: entry.trading_symbol,
								note: entry.symbol_note ?? ''
							})}
						onRemove={() => requestRemoveSymbol(entry.sk_token, entry.trading_symbol)}
					/>
				{/each}
			{/if}
		</div>

		<SearchSymbolsOverlay
			isOpen={isSearchFocused}
			query={searchQuery}
			watchlistName={selectedName}
			isPredefined={selectedItem?.predefined ?? false}
			{addedTokens}
			onadd={handleAddSymbol}
			onseed={(q) => {
				searchQuery = q;
				searchInput?.focus();
			}}
		/>
	</div>

	<WatchlistSortBar {sortBy} onsortchange={handleSortChange} />
</aside>

<WatchlistNamePopover
	isOpen={isCreatePopoverOpen}
	title="Create New Watchlist"
	submitLabel="Create"
	onClose={() => (isCreatePopoverOpen = false)}
	onSubmit={handleCreateWatchlist}
/>

<WatchlistNamePopover
	isOpen={renameTarget !== null}
	title="Rename Watchlist"
	submitLabel="Save"
	initialName={renameTarget ?? ''}
	onClose={() => (renameTarget = null)}
	onSubmit={handleRenameWatchlist}
/>

<DeleteWatchlistConfirm
	isOpen={deleteTarget !== null}
	title="Delete watchlist?"
	description={`This permanently removes "${deleteTarget ?? ''}" and all its symbols. Cannot be undone.`}
	confirmLabel="Delete"
	loadingLabel="Deleting..."
	onClose={() => (deleteTarget = null)}
	onConfirm={handleDeleteWatchlist}
/>

<DeleteWatchlistConfirm
	isOpen={removeSymbolTarget !== null}
	title="Remove symbol?"
	description={`Remove "${removeSymbolTarget?.name ?? ''}" from this watchlist?`}
	confirmLabel="Remove"
	loadingLabel="Removing..."
	onClose={() => (removeSymbolTarget = null)}
	onConfirm={confirmRemoveSymbol}
/>

<NoteEditorPopover
	isOpen={noteTarget !== null}
	symbolName={noteTarget?.name ?? ''}
	initialNote={noteTarget?.note ?? ''}
	onClose={() => (noteTarget = null)}
	onSave={handleSaveNote}
	onClear={handleClearNote}
/>
