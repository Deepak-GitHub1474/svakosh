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
		d="M12 3 2 8.5 12 14l10-5.5L12 3zM4.24 11.3 2 12.5 12 18l10-5.5-2.24-1.2L12 15.6l-7.76-4.3zm0 4L2 16.5 12 22l10-5.5-2.24-1.2L12 19.6l-7.76-4.3z"
	/>
</svg>
