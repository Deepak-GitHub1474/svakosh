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
	{#if filled}
		<path d="m289-87-42-42 269-270 140 140 215-214 42 42-257 257-140-140L289-87Zm-149-33q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h600q24 0 42 18t18 42v198H140v482Z" />
	{:else}
		<path d="m289-87-42-42 269-270 140 140 216-215 42 42-258 258-140-140L289-87Zm-149-33q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h600q24 0 42 18t18 42v198H140v482Zm0-542h600v-138H140v138Zm0 0v-138 138Z" />
	{/if}
</svg>
