<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		style = '',
		filled = false
	}: { class?: string; style?: string; filled?: boolean } = $props();
</script>

<svg
	class={cn('inline-block shrink-0 align-[-0.15em]', className)}
	{style}
	width="1em"
	height="1em"
	viewBox="0 -960 960 960"
	fill="currentColor"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<path d="m140-85-46-46 300-300 160 161 298-335 42 41-340 384-160-159L140-85Zm0-269-46-46 300-300 160 161 298-335 42 41-340 384-160-159-254 254Z" />
</svg>
