<script lang="ts">
	import { fade } from 'svelte/transition';
	import SvaKoshDrawer from '$lib/components/svakosh/SvaKoshDrawer.svelte';

	interface Props {
		isOpen: boolean;
		isDesktop: boolean;
		openUp: boolean;
		symbolName: string;
		showNote: boolean;
		showDelete: boolean;
		hasNote: boolean;
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
		hasNote,
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
			<span class="material-symbols-outlined" style="font-size:0.875rem">sticky_note_2</span>
			{hasNote ? 'Edit note' : 'Add note'}
		</button>
	{/if}
	{#if showDelete}
		<button
			type="button"
			onclick={onDelete}
			class="flex w-full items-center gap-3 rounded-md px-3 {pad} text-xs text-bearish/80 transition-all duration-200 hover:bg-bearish-subtle hover:text-bearish cursor-pointer text-left"
		>
			<span class="material-symbols-outlined" style="font-size:0.875rem">delete</span>
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
				{@render items('py-3.5')}
			</div>
		</SvaKoshDrawer>
	{/if}
{/if}
