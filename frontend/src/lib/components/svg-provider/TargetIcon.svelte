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
		d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
	/>
</svg>
