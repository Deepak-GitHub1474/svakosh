<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', style = '' }: { class?: string; style?: string } = $props();
</script>

<svg
	class={cn('block size-4 shrink-0', className)}
	{style}
	viewBox="0 0 24 24"
	fill="currentColor"
	aria-hidden="true"
>
	<path d="M3 3v18h18v-2H5V3H3zm16.3 2.3-5.6 5.6-3-3L7 12.6 8.4 14l3.3-3.3 3 3 7-7-1.4-1.4z" />
</svg>
