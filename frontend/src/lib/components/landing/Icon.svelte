<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let { path, class: className = '' }: { path: string; class?: string } = $props();
</script>

<svg
	class={cn('block size-4 shrink-0', className)}
	viewBox="0 0 24 24"
	fill="currentColor"
	aria-hidden="true"
>
	<path d={path} />
</svg>
