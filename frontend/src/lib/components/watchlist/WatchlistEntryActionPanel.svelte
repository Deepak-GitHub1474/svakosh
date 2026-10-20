<script lang="ts">
	import { TRADE_BUTTON } from '$lib/components/order/const';
	import { fade } from 'svelte/transition';
	import SvaKoshDrawer from '$lib/components/svakosh/SvaKoshDrawer.svelte';
	import Delete from '$lib/components/svg-provider/material/Delete.svelte';
	import StickyNote2 from '$lib/components/svg-provider/material/StickyNote2.svelte';

	interface Props {
		isOpen: boolean;
		isDesktop: boolean;
		openUp: boolean;
		symbolName: string;
		showNote: boolean;
		showDelete: boolean;
		showTrade?: boolean;
		hasNote: boolean;
		onTrade?: (transaction: 'BUY' | 'SELL') => void;
		onNote: () => void;
		onDelete: () => void;
		onClose: () => void;
	}

	let {
		isOpen,
		isDesktop,
		openUp,
		symbolName,
		showNote,
		showDelete,
		showTrade = false,
		hasNote,
		onTrade,
		onNote,
		onDelete,
		onClose
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#snippet items(pad: string)}
	{#if showNote}
		<button
			type="button"
			onclick={onNote}
			class="flex w-full items-center gap-3 rounded-md px-3 {pad} text-xs text-muted-foreground transition-all duration-200 hover:bg-glass hover:text-foreground cursor-pointer text-left"
		>
			<StickyNote2 style="font-size:0.875rem" />
			{hasNote ? 'Edit note' : 'Add note'}
		</button>
	{/if}
	{#if showDelete}
		<button
			type="button"
			onclick={onDelete}
			class="flex w-full items-center gap-3 rounded-md px-3 {pad} text-xs text-bearish/80 transition-all duration-200 hover:bg-bearish-subtle hover:text-bearish cursor-pointer text-left"
		>
			<Delete style="font-size:0.875rem" />
			Remove
		</button>
	{/if}
{/snippet}

{#if isOpen}
	{#if isDesktop}
		<div
			role="menu"
			tabindex="-1"
			transition:fade={{ duration: 100 }}
			class="absolute right-0 z-50 w-40 rounded-lg border border-border-subtle bg-background shadow-[0_10px_20px_-5px_rgba(0,0,0,0.6)] p-1
			{openUp ? 'bottom-full mb-1' : 'top-full mt-1'}"
		>
			{@render items('py-2')}
		</div>
	{:else}
		<SvaKoshDrawer isOpen={true} {onClose} title={symbolName}>
			<div class="p-2">
				{#if showTrade}
					<div class="flex gap-2 px-1 pb-2">
						<button
							type="button"
							onclick={() => onTrade?.('BUY')}
							class="flex-1 cursor-pointer rounded-md border py-2.5 text-xs font-medium {TRADE_BUTTON.BUY}"
						>
							Buy
						</button>
						<button
							type="button"
							onclick={() => onTrade?.('SELL')}
							class="flex-1 cursor-pointer rounded-md border py-2.5 text-xs font-medium {TRADE_BUTTON.SELL}"
						>
							Sell
						</button>
					</div>
				{/if}
				{@render items('py-3.5')}
			</div>
		</SvaKoshDrawer>
	{/if}
{/if}
