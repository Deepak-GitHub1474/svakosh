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
		<path d="M120-639v-141q0-24.75 17.63-42.38Q155.25-840 180-840h600q24.75 0 42.38 17.62Q840-804.75 840-780v141H120Zm60 518q-24.75 0-42.37-17.63Q120-156.25 120-181v-398h190v458H180Zm470 0v-458h190v398q0 24.75-17.62 42.37Q804.75-121 780-121H650Zm-280 0v-458h220v458H370Z" />
	{:else}
		<path d="M780-121H180q-24 0-42-18t-18-42v-599q0-24 18-42t42-18h600q24 0 42 18t18 42v599q0 24-18 42t-42 18ZM180-639h600v-141H180v141Zm130 60H180v398h130v-398Zm340 0v398h130v-398H650Zm-60 0H370v398h220v-398Z" />
	{/if}
</svg>
