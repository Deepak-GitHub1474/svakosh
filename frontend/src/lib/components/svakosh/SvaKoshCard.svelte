<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Variant = 'primary' | 'bullish' | 'bearish' | 'surface';

	let {
		label,
		value,
		variant = 'surface',
		meta,
		ghostIcon,
		svgPath,
		class: className = '',
		children,
		valueClass = '',
		ghostIconClass = ''
	} = $props<{
		label?: string;
		value?: string | number;
		variant?: Variant;
		meta?: string | Snippet;
		ghostIcon?: any;
		svgPath?: string;
		class?: string;
		children?: Snippet;
		valueClass?: string;
		ghostIconClass?: string;
	}>();

	const variantStyles: Record<Variant, string> = {
		primary: 'text-primary',
		bullish: 'text-bullish',
		bearish: 'text-bearish',
		surface: 'text-foreground'
	};
</script>

<div
	class={cn(
		'glass-panel group relative overflow-hidden rounded-xl p-4 transition-all duration-300',
		className
	)}
>
	{#if label}
		<div class="mb-1 select-none text-xs uppercase tracking-widest text-muted-foreground">
			{label}
		</div>
	{/if}

	<div class="flex items-baseline gap-2">
		{#if value !== undefined}
			<div class={cn('text-lg tracking-tight', variantStyles[variant as Variant], valueClass)}>
				{value}
			</div>
		{/if}

		{#if meta}
			{#if typeof meta === 'string'}
				<span class="text-xs opacity-60 tabular-nums">({meta})</span>
			{:else}
				{@render meta()}
			{/if}
		{/if}
	</div>

	{#if children}
		<div class="mt-2">
			{@render children()}
		</div>
	{/if}

	{#if ghostIcon || svgPath}
		<div
			class="pointer-events-none absolute right-0 bottom-0 p-2 opacity-5 transition-opacity group-hover:opacity-10"
			aria-hidden="true"
		>
			{#if ghostIcon}
				{@const Icon = ghostIcon}
				<Icon class={cn('h-12 w-12', ghostIconClass)} />
			{:else if svgPath}
				<svg class={cn('h-12 w-12', ghostIconClass)} fill="currentColor" viewBox="0 0 24 24">
					<path d={svgPath} />
				</svg>
			{/if}
		</div>
	{/if}
</div>
