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
	<path d="M3 12h3.5l2-6 4 12 2.5-6H21v2h-4.8l-3.4 8.2L8.9 10 7.6 14H3v-2z" />
</svg>
