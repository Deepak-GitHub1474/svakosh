<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<svg 
    class={cn('w-12 h-12', className)}
    fill="currentColor" 
    viewBox="0 0 24 24">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v2c0 1.1.9 2 2 2h2v-2H5v-2zM5 5h2V3H5c-1.1 0-2 .9-2 2v2h2V5zm14-2h-2v2h2v2h2V5c0-1.1-.9-2-2-2zm0 16h-2v2h2c1.1 0 2-.9 2-2v-2h-2v2z"/>
</svg>
