<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Variant = 'primary' | 'bullish' | 'bearish';
	let {
		label,
		variant = 'primary',
		icon,
		svgPath,
		iconClass = '',
		class: className = '',
		children
	} = $props<{
		label?: string;
		variant?: Variant;
		icon?: any;
		svgPath?: string;
		iconClass?: string;
		class?: string;
		children?: Snippet;
	}>();

	const variantStyles: Record<Variant, string> = {
		primary: 'bg-primary-subtle text-primary border-primary/10',
		bullish: 'bg-bullish-subtle/10 text-bullish border-bullish/20',
		bearish: 'bg-bearish-subtle/10 text-bearish border-bearish/20'
	};
</script>

<span
	class={cn(
		'inline-flex items-center justify-center gap-1.5 rounded px-2 py-1 text-[0.625rem] uppercase font-medium leading-none whitespace-nowrap border transition-all',
		variantStyles[variant as Variant],
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
