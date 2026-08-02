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
	<path d="M120-330v-60h300v60H120Zm0-165v-60h470v60H120Zm0-165v-60h470v60H120Zm530 500v-170H480v-60h170v-170h60v170h170v60H710v170h-60Z" />
</svg>
