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
	<path
		d="M160-360v80h640v-80H160Zm0-440h640q33 0 56.5 23.5T880-720v440q0 33-23.5 56.5T800-200H640v200l-160-80-160 80v-200H160q-33 0-56.5-23.5T80-280v-440q0-33 23.5-56.5T160-800Zm0 320h640v-240H160v240Zm0 200v-440 440Z"
	/>
</svg>
