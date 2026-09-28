<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let { open = $bindable(false), class: className = '' }: { open?: boolean; class?: string } =
		$props();

	const bar =
		'absolute top-1/2 left-0 h-px w-5 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none';
</script>

<button
	type="button"
	aria-label={open ? 'Close menu' : 'Open menu'}
	aria-expanded={open}
	onclick={() => (open = !open)}
	class={cn(
		'text-foreground hover:bg-surface inline-flex size-10 items-center justify-center rounded-full transition-colors',
		className
	)}
>
	<span class="relative block size-5" aria-hidden="true">
		<span class={cn(bar, open ? 'rotate-45' : '-translate-y-1.5')}></span>
		<span
			class={cn(
				'absolute top-1/2 left-0 h-px w-5 rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none',
				open ? 'opacity-0' : 'opacity-100'
			)}
		></span>
		<span class={cn(bar, open ? '-rotate-45' : 'translate-y-1.5')}></span>
	</span>
</button>
