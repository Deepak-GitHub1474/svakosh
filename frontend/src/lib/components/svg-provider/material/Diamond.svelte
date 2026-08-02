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
	<path d="M480-120 80-600l120-240h560l120 240-400 480ZM368-630h224l-75-150h-74l-75 150Zm82 381v-321H183l267 321Zm60 0 267-321H510v321Zm149-381h136l-75-150H584l75 150Zm-494 0h136l75-150H240l-75 150Z" />
</svg>
