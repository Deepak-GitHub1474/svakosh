<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<svg class={cn('w-12 h-12', className)} fill="currentColor" viewBox="0 0 24 24">
	<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
</svg>
