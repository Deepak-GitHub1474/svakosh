<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		label,
		icon,
		svgPath,
		iconClass = '',
		class: className = '',
		children
	} = $props<{
		label?: string;
		icon?: any;
		svgPath?: string;
		iconClass?: string;
		class?: string;
		children?: Snippet;
	}>();
</script>

<span
	class={cn(
		'inline-flex items-center justify-center gap-1.5 rounded px-2 py-1 text-[0.625rem] uppercase font-medium leading-none whitespace-nowrap',
		'bg-primary-subtle text-primary border border-primary/10 transition-all',
		className
	)}
>
	{#if label}
		{label}
	{:else if children}
		{@render children()}
	{/if}

	{#if icon || svgPath}
		{#if icon}
			{@const Icon = icon}
			<Icon class={cn('w-3.5 h-3.5', iconClass)} />
		{:else if svgPath}
			<svg class={cn('w-3.5 h-3.5', iconClass)} fill="currentColor" viewBox="0 0 24 24">
				<path d={svgPath} />
			</svg>
		{/if}
	{/if}
</span>
