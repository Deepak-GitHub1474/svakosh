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
		d="M12 2v2.2L6.4 6 3 15h1a4 4 0 0 0 8 0h1L8.6 6.6 12 5.4l3.4 1.2L11 15h1a4 4 0 0 0 8 0h1l-3.4-9L12 4.2V2h-2zm-6 7.6L8.1 15H3.9L6 9.6zm12 0L20.1 15h-4.2L18 9.6zM7 19h10v2H7v-2z"
	/>
</svg>
