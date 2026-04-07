<script lang="ts">
	import { cn } from '$lib/utils/cn';

	type Props = {
		active?: boolean;
		colorClass?: string;
		sizeClass?: string;
	};

	let {
		active = true,
		colorClass = 'bg-bullish',
		sizeClass = 'h-3 w-3'
	}: Props = $props();
</script>

<span
	class={cn('relative flex shrink-0', sizeClass, active && 'animate-pulse')}
	aria-hidden="true"
>
	<span
		class={cn(
			'absolute inline-flex h-full w-full rounded-full opacity-75',
			colorClass,
			active && 'animate-ping'
		)}
	></span>
	<span class={cn('relative inline-flex rounded-full', sizeClass, colorClass)}></span>
</span>
