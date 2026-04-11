<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<svg 
    class={cn('w-4 h-4', className)}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor">
    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
</svg>