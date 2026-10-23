<script lang="ts">
	import { TRADE_BUTTON } from '$lib/components/order/const';
	import { MODAL_BUTTON } from '$lib/trade/const';
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

{#snippet items(size: string, tone: string, menu = false)}
	{#if showNote}
		<button
			type="button"
			onclick={onNote}
			class="flex w-full items-center gap-3 rounded-md px-3 {size} {tone} hover:bg-glass hover:text-foreground cursor-pointer text-left transition-all duration-200"
		>
			<StickyNote2 class="text-[1.1667em]" />
			{hasNote ? 'Edit note' : 'Add note'}
		</button>
	{/if}
	{#if showDelete}
		{#if menu && showNote}
			<div role="separator" class="border-border-subtle my-1.5 border-t"></div>
		{/if}
		<button
			type="button"
			onclick={onDelete}
			class="flex w-full items-center gap-3 rounded-md px-3 {size} {menu
				? 'text-bearish bg-bearish/10 hover:bg-bearish/15'
				: 'text-bearish/80 hover:bg-bearish-subtle hover:text-bearish'} cursor-pointer text-left transition-all duration-200"
		>
			<Delete class="text-[1.1667em]" />
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
			class="border-border-subtle bg-surface-elevated absolute right-0 z-50 min-w-40 rounded-lg border p-1.5 shadow-lg
			{openUp ? 'bottom-full mb-1' : 'top-full mt-1'}"
		>
			{@render items('py-2 text-sm', 'text-foreground/80', true)}
		</div>
	{:else}
		<SvaKoshDrawer isOpen={true} {onClose} title={symbolName} contentClass="flex flex-col">
			<div class="flex flex-1 flex-col p-2">
				{@render items('py-3.5 text-base', 'text-foreground/80')}
				{#if showTrade}
					<div class="mt-auto flex gap-2 px-1 pt-4">
						<button
							type="button"
							onclick={() => onTrade?.('BUY')}
							class="flex {MODAL_BUTTON} flex-1 cursor-pointer items-center justify-center rounded-md border font-medium {TRADE_BUTTON.BUY}"
						>
							Buy
						</button>
						<button
							type="button"
							onclick={() => onTrade?.('SELL')}
							class="flex {MODAL_BUTTON} flex-1 cursor-pointer items-center justify-center rounded-md border font-medium {TRADE_BUTTON.SELL}"
						>
							Sell
						</button>
					</div>
				{/if}
			</div>
		</SvaKoshDrawer>
	{/if}
{/if}
