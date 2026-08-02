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
		<path d="m623-361 32-32-88-88q11-17 18.5-35.5T593-555q0-57-39-96t-96-39q-57 0-96 39t-39 96q0 57 39 96t96 39q22 0 41.5-7.5T538-446l85 85ZM458-470q-35 0-60-25t-25-60q0-35 25-60t60-25q35 0 60 25t25 60q0 35-25 60t-60 25ZM140-240q-24 0-42-18t-18-42v-480q0-24 18-42t42-18h680q24 0 42 18t18 42v480q0 24-18 42t-42 18H140ZM40-120v-60h880v60H40Z" />
	{:else}
		<path d="m623-361 32-32-88-88q11-17 18.5-35.36Q593-534.71 593-555q0-57-39-96t-96-39q-57 0-96 39.08-39 39.07-39 96Q323-498 362-459t96 39q22.09 0 41.54-7.5Q519-435 537.72-446L623-361ZM458.04-470Q423-470 398-494.96q-25-24.95-25-60Q373-590 397.97-615T458-640q35 0 60 24.96 25 24.95 25 60Q543-520 518.04-495q-24.95 25-60 25ZM140-240q-24 0-42-18t-18-42v-480q0-24 18-42t42-18h680q24 0 42 18t18 42v480q0 24-18 42t-42 18H140Zm0-60h680v-480H140v480Zm0 0v-480 480ZM40-120v-60h880v60H40Z" />
	{/if}
</svg>
