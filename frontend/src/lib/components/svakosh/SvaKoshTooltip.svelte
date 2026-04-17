<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

	let {
		content,
		position = 'top',
		delay = 150,
		offset = 8,
		class: className = '',
		children
	}: {
		content: string | Snippet;
		position?: TooltipPosition;
		delay?: number;
		offset?: number;
		class?: string;
		children: Snippet;
	} = $props();

	let isVisible = $state(false);
	let timeout: any;

	function show() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			isVisible = true;
		}, delay);
	}

	function hide() {
		clearTimeout(timeout);
		isVisible = false;
	}

	const positionClasses: Record<'top' | 'bottom' | 'left' | 'right', string> = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-[var(--offset)]',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-[var(--offset)]',
		left: 'right-full top-1/2 -translate-y-1/2 mr-[var(--offset)]',
		right: 'left-full top-1/2 -translate-y-1/2 ml-[var(--offset)]'
	};

	const flyParams: Record<'top' | 'bottom' | 'left' | 'right', { x?: number, y?: number, duration: number }> = {
		top: { y: 4, duration: 200 },
		bottom: { y: -4, duration: 200 },
		left: { x: 4, duration: 200 },
		right: { x: -4, duration: 200 }
	};

	const triangleClasses: Record<'top' | 'bottom' | 'left' | 'right', string> = {
		top: 'top-full left-1/2 -translate-x-1/2 border-t-background/95',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-background/95',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-background/95',
		right: 'right-full top-1/2 -translate-y-1/2 border-r-background/95'
	};
</script>

<div 
	class="relative inline-block"
	onmouseenter={show}
	onmouseleave={hide}
	role="tooltip"
>
	{@render children()}

	{#if isVisible}
		<div
			class={cn(
				'absolute z-[110] whitespace-nowrap rounded-lg border border-white/10 px-2.5 py-1.5',
				'bg-background/95 backdrop-blur-md shadow-2xl',
				'text-[0.625rem] font-medium tracking-wide text-foreground',
				positionClasses[position],
				className
			)}
			style="--offset: {offset}px"
			transition:fly={flyParams[position]}
		>
			{#if typeof content === 'string'}
				{content}
			{:else}
				{@render content()}
			{/if}

			<div 
				class={cn(
					'absolute border-4 border-transparent',
					triangleClasses[position]
				)}
			></div>
		</div>
	{/if}
</div>
