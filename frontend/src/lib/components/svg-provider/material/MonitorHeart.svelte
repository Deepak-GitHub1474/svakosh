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
		<path d="M140-160q-24 0-42-18t-18-42v-230h221l72 144q4 8 11.5 12t15.5 4q8 0 15.5-4t11.5-12l133-266 53 106q4 8 11.5 12t15.5 4h240v230q0 24-18 42t-42 18H140ZM80-510v-230q0-24 18-42t42-18h680q24 0 42 18t18 42v230H659l-72-143q-4-8-11.5-11.5T560-668q-8 0-15.5 3.5T533-653L400-388l-53-106q-4-8-11.5-12t-15.5-4H80Z" />
	{:else}
		<path d="M80-570v-170q0-24 18-42t42-18h680q24 0 42 18t18 42v170h-60v-170H140v170H80Zm60 410q-24 0-42-18t-18-42v-170h60v170h680v-170h60v170q0 24-18 42t-42 18H140Zm275.6-134q7.6-4 11.4-12l133-266 53 106q3.75 8 11.25 12t15.75 4h240v-60H659l-72-143q-3.72-8.25-11.17-11.63-7.45-3.37-15.64-3.37-8.19 0-15.79 3.37-7.6 3.38-11.4 11.63L400-388l-53-106q-3.75-8-11.25-12T320-510H80v60h221l72 144q3.72 8 11.17 12 7.45 4 15.64 4 8.19 0 15.79-4ZM480-480Z" />
	{/if}
</svg>
