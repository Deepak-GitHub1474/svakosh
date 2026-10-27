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
		d="M12.6 10A6 6 0 1 0 7 15.9V18h2v2h2v2h4v-3.6l-1.5-1.5 1.5-1.5-1.4-1.4L12.6 10zM6 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"
	/>
</svg>
