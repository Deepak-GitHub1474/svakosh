<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';
	import { lockScroll } from './utils';

	let {
		open = $bindable(false),
		label = 'Menu',
		class: className = '',
		children
	}: { open?: boolean; label?: string; class?: string; children: Snippet } = $props();

	let panel = $state<HTMLElement>();

	$effect(() => {
		if (!open) return;

		const opener = document.activeElement as HTMLElement | null;
		const release = lockScroll();
		panel?.focus();

		const onkey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false;
		};
		window.addEventListener('keydown', onkey);

		return () => {
			release();
			window.removeEventListener('keydown', onkey);
			opener?.focus();
		};
	});
</script>

<div class={cn('fixed inset-0 z-70', !open && 'pointer-events-none')} inert={!open}>
	<button
		type="button"
		tabindex={-1}
		aria-hidden="true"
		onclick={() => (open = false)}
		class={cn(
			'bg-background/70 absolute inset-0 h-full w-full cursor-default backdrop-blur-sm',
			'transition-opacity duration-300 motion-reduce:transition-none',
			open ? 'opacity-100' : 'opacity-0'
		)}
	></button>

	<div
		bind:this={panel}
		tabindex={-1}
		role="dialog"
		aria-modal="true"
		aria-label={label}
		class={cn(
			'border-border-muted bg-surface absolute inset-y-0 right-0 flex w-[min(20rem,82%)] flex-col overflow-y-auto border-l outline-none',
			'transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform motion-reduce:transition-none',
			open ? 'translate-x-0' : 'translate-x-full',
			className
		)}
	>
		{@render children()}
	</div>
</div>
