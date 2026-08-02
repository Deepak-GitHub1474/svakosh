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
		<path d="M440-360h80v-100h100v-80H520v-100h-80v100H340v80h100v100Zm40 279q-140-35-230-162.5T160-523v-238l320-120 320 120v238q0 152-90 279.5T480-81Z" />
	{:else}
		<path d="M440-360h80v-100h100v-80H520v-100h-80v100H340v80h100v100Zm40 279q-140-35-230-162.5T160-523v-238l320-120 320 120v238q0 152-90 279.5T480-81Zm0-62q115-38 187.5-143.5T740-523v-196l-260-98-260 98v196q0 131 72.5 236.5T480-143Zm0-337Z" />
	{/if}
</svg>
