<script lang="ts">
	import { cn, getInitials } from '$lib/utils';

	let {
		url = '',
		name = '',
		class: className = ''
	}: { url?: string; name?: string; class?: string } = $props();

	let failed = $state(false);
	$effect(() => {
		url;
		failed = false;
	});

	const initials = $derived(getInitials(name));
</script>

<div
	class={cn(
		'bg-primary/15 text-primary flex items-center justify-center overflow-hidden rounded-full font-medium',
		className
	)}
>
	{#if url && !failed}
		<img src={url} alt={name} onerror={() => (failed = true)} class="h-full w-full object-cover" />
	{:else}
		<span>{initials}</span>
	{/if}
</div>
