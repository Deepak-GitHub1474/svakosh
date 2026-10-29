<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cn } from '$lib/utils';

	let {
		isOpen = $bindable(false),
		onClose,
		header,
		children,
		footer,
		width = '26rem',
		class: className = ''
	}: {
		isOpen: boolean;
		onClose?: () => void;
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
		width?: string;
		class?: string;
	} = $props();

	function close() {
		isOpen = false;
		onClose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<button
		type="button"
		aria-label="Close"
		onclick={close}
		class="fixed inset-0 z-[1120] bg-black/50"
		transition:fade={{ duration: 200 }}
	></button>

	<div
		role="dialog"
		aria-modal="true"
		style="width: {width}; max-width: 100vw;"
		class={cn(
			'border-surface-border bg-surface fixed inset-y-0 right-0 z-[1130] flex flex-col border-l',
			'shadow-[-10px_0_30px_-5px_rgba(0,0,0,0.6)] will-change-transform',
			className
		)}
		transition:fly={{ x: '100%', opacity: 1, duration: 280, easing: cubicOut }}
	>
		{#if header}
			<div class="border-border-subtle shrink-0 border-b">
				{@render header()}
			</div>
		{/if}

		<div class="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
			{@render children()}
		</div>

		{#if footer}
			<div class="border-border-subtle shrink-0 border-t px-4 py-3">
				{@render footer()}
			</div>
		{/if}
	</div>
{/if}
