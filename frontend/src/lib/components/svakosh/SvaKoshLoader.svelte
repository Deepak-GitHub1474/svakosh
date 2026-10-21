<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';

	type Props = {
		message?: string;
		inline?: boolean;
	};

	let { message = 'Loading…', inline = false }: Props = $props();
</script>

<div
	class={cn(
		'flex flex-col items-center justify-center',
		inline ? 'absolute inset-0 z-10 gap-3' : 'fixed inset-0 z-50 gap-4 bg-background/80 backdrop-blur-sm'
	)}
	role="status"
	aria-live="polite"
	aria-busy="true"
	aria-label={message || 'Loading'}
	transition:fade|global={{ duration: inline ? 150 : 0 }}
>
	<span
		class={cn(
			'animate-spin rounded-full border-primary/20 border-t-primary motion-reduce:animate-none',
			inline ? 'h-7 w-7 border-[3px]' : 'h-10 w-10 border-4'
		)}
	></span>
	{#if message}
		<p class={cn('text-muted-foreground', inline ? 'text-xs' : 'text-sm')}>{message}</p>
	{/if}
</div>
