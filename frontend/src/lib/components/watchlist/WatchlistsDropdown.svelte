<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import SvaKoshBadge from '$lib/components/svakosh/SvaKoshBadge.svelte';
	import type { TWatchlistItem } from './types';

	interface Props {
		isOpen: boolean;
		watchlists: TWatchlistItem[];
		selectedName?: string | null;
		onClose: () => void;
		onSelect?: (name: string) => void;
		onCreate?: () => void;
		onRename?: (name: string) => void;
		onDelete?: (name: string) => void;
	}

	let {
		isOpen,
		watchlists,
		selectedName = null,
		onClose,
		onSelect,
		onCreate,
		onRename,
		onDelete
	}: Props = $props();

	function handleSelect(name: string) {
		onSelect?.(name);
		onClose();
	}

	function handleRename(e: MouseEvent, name: string) {
		e.stopPropagation();
		onRename?.(name);
		onClose();
	}

	function handleDelete(e: MouseEvent, name: string) {
		e.stopPropagation();
		onDelete?.(name);
		onClose();
	}
</script>

{#if isOpen}
	<div
		role="dialog"
		aria-modal="false"
		aria-label="Select Watchlist"
		class="absolute left-0 right-0 top-full z-50 flex flex-col max-h-[60vh]
		       rounded-b-2xl border border-t-0 border-border-subtle
		       bg-background backdrop-blur-xl
		       shadow-[0_15px_25px_-5px_rgba(0,0,0,0.6),0_8px_10px_-6px_rgba(0,0,0,0.4)]
		       overflow-hidden"
		transition:fly={{ y: -6, duration: 190, easing: cubicOut }}
	>
		<div
			class="shrink-0 px-3 py-2 text-[0.6875rem] text-muted-foreground border-b border-border-subtle bg-glass"
		>
			Select Watchlist:
		</div>

		<div class="flex-1 min-h-0 overflow-y-auto hide-scrollbar">
			{#if watchlists.length === 0}
				<div class="p-4 text-center text-[0.625rem] text-muted-foreground">
					No watchlists yet.
				</div>
			{:else}
				{#each watchlists as wl (wl.name)}
					{@const isSelected = selectedName === wl.name}
					<div
						role="button"
						tabindex="0"
						onclick={() => handleSelect(wl.name)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect(wl.name)}
						class="group w-full flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border-subtle hover:bg-glass transition-colors cursor-pointer text-left
						{isSelected ? 'bg-primary-hover' : ''}"
					>
						<div class="flex items-center gap-1.5 min-w-0">
							<span class="text-sm text-foreground truncate">{wl.name}</span>
							{#if wl.predefined}
								<SvaKoshBadge label="Predefined" variant="primary" class="shrink-0" />
							{/if}
							<span class="shrink-0 text-[0.625rem] text-muted-foreground"
								>({wl.count} {wl.count === 1 ? 'Stock' : 'Stocks'})</span
							>
						</div>

						{#if isSelected}
							<span class="material-symbols-outlined text-primary icon-size shrink-0"
								>check_circle</span
							>
						{:else if !wl.predefined}
							<div
								class="shrink-0 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<button
									type="button"
									onclick={(e) => handleRename(e, wl.name)}
									aria-label="Rename watchlist"
									title="Rename"
									class="material-symbols-outlined text-muted-foreground hover:text-primary cursor-pointer"
									style="font-size:1rem"
								>
									drive_file_rename_outline
								</button>
								<button
									type="button"
									onclick={(e) => handleDelete(e, wl.name)}
									aria-label="Delete watchlist"
									title="Delete"
									class="material-symbols-outlined text-muted-foreground hover:text-bearish cursor-pointer"
									style="font-size:1rem"
								>
									delete
								</button>
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<div class="shrink-0 bg-glass">
			<button
				type="button"
				class="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-primary-hover transition-colors cursor-pointer rounded-b-2xl"
				onclick={() => onCreate?.()}
			>
				<span class="text-xs text-primary">Create New Watchlist</span>
				<span class="material-symbols-outlined text-primary icon-size">add_circle</span>
			</button>
		</div>
	</div>
{/if}
