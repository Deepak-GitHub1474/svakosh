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
	<path d="m122-221-42-43 296-296 165 166 139-156q-60-69-135.5-108.5T378-698q-72 0-137.5 26T122-599l-42-43q62-56 137.5-86T378-758q100 0 187.5 43.5T719-594l120-136 41 44-124 141q34 51 55 115.5T842-296h-60q-6-53-23.5-103T713-497L544-307 376-475 122-221Z" />
</svg>
