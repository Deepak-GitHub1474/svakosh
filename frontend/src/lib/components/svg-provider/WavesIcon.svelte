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
		d="M4 15.5c1.6 0 2.4-1 4-1s2.4 1 4 1 2.4-1 4-1 2.4 1 4 1V18c-1.6 0-2.4-1-4-1s-2.4 1-4 1-2.4-1-4-1-2.4 1-4 1v-2.5zm0-5c1.6 0 2.4-1 4-1s2.4 1 4 1 2.4-1 4-1 2.4 1 4 1V13c-1.6 0-2.4-1-4-1s-2.4 1-4 1-2.4-1-4-1-2.4 1-4 1v-2.5zm0-5c1.6 0 2.4-1 4-1s2.4 1 4 1 2.4-1 4-1 2.4 1 4 1V8c-1.6 0-2.4-1-4-1s-2.4 1-4 1-2.4-1-4-1-2.4 1-4 1V5.5z"
	/>
</svg>
