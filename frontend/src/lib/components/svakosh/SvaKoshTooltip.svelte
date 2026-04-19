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
		top: 'top-full left-1/2 -translate-x-1/2 border-t-white/10',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white/10',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-white/10',
		right: 'right-full top-1/2 -translate-y-1/2 border-r-white/10'
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
				'absolute z-[110] whitespace-nowrap rounded-md font-medium px-3 py-1.5',
				'bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl',
				'border-t border-l border-white/20 border-b border-r border-black/60',
				'text-xs text-foreground shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.05)]',
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
					'absolute border-[7px] border-transparent z-[-1]',
					triangleClasses[position]
				)}
			></div>
		</div>
	{/if}
</div>
