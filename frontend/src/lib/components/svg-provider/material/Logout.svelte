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
	<path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h299v60H180v600h299v60H180Zm486-185-43-43 102-102H360v-60h363L621-612l43-43 176 176-174 174Z" />
</svg>
