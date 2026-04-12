<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		for: htmlFor,
		class: className = '',
		children
	} = $props<{
		for?: string;
		class?: string;
		children?: Snippet;
	}>();
</script>

<label
	for={htmlFor}
	class={cn(
		'block ml-1 mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground select-none',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</label>
