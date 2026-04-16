<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<svg
	class={cn('w-12 h-12', className)}
	fill="none"
	viewBox="0 0 24 24"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7" />
</svg>
