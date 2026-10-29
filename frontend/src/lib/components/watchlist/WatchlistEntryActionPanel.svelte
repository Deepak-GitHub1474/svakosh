<script lang="ts">
	import { fade } from 'svelte/transition';
	import Delete from '$lib/components/svg-provider/material/Delete.svelte';
	import StickyNote2 from '$lib/components/svg-provider/material/StickyNote2.svelte';

	interface Props {
		isOpen: boolean;
		openUp: boolean;
		showNote: boolean;
		showDelete: boolean;
		hasNote: boolean;
		onNote: () => void;
		onDelete: () => void;
		onClose: () => void;
	}

	let { isOpen, openUp, showNote, showDelete, hasNote, onNote, onDelete, onClose }: Props =
		$props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		role="menu"
		tabindex="-1"
		transition:fade={{ duration: 100 }}
		class="border-border-subtle bg-surface-elevated absolute right-0 z-50 min-w-40 rounded-lg border p-1.5 shadow-lg
		{openUp ? 'bottom-full mb-1' : 'top-full mt-1'}"
	>
		{#if showNote}
			<button
				type="button"
				onclick={onNote}
				class="text-foreground/80 hover:bg-glass hover:text-foreground flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-all duration-200"
			>
				<StickyNote2 class="text-[1.1667em]" />
				{hasNote ? 'Edit note' : 'Add note'}
			</button>
		{/if}
		{#if showDelete}
			{#if showNote}
				<div role="separator" class="border-border-subtle my-1.5 border-t"></div>
			{/if}
			<button
				type="button"
				onclick={onDelete}
				class="text-bearish bg-bearish/10 hover:bg-bearish/15 flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-all duration-200"
			>
				<Delete class="text-[1.1667em]" />
				Remove
			</button>
		{/if}
	</div>
{/if}
