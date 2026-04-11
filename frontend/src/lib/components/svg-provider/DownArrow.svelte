<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<svg 
    class={cn('w-12 h-12', className)}
    fill="currentColor" 
    viewBox="0 0 24 24">
    <path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/>
</svg>
