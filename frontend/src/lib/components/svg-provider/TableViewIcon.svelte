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
	<path d="M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h18v4H3v-4z" />
</svg>
