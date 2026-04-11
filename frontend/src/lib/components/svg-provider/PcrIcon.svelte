<script lang="ts">
	import { cn } from '$lib/utils';
	let { class: className = '' } = $props();
</script>

<svg 
    class={cn('w-12 h-12', className)}
    fill="currentColor" 
    viewBox="0 0 24 24">
    <path d="M13 11h9v2h-9v-2zm-2 0h-9v2h9v-2zm1-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
</svg>
