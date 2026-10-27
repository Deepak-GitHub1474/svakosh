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
	<path
		d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
	/>
</svg>
