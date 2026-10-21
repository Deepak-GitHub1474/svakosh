<script lang="ts">
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';

	let {
		title,
		subtitle = '',
		onClose
	}: { title: string; subtitle?: string; onClose: () => void } = $props();
</script>

<header
	class="bg-surface-elevated border-border-subtle flex items-start justify-between gap-4 border-b px-5 pt-4 pb-3"
>
	<div class="min-w-0">
		<h2 class="text-foreground truncate text-base font-medium">{title}</h2>
		{#if subtitle}
			<p class="text-muted-foreground mt-1 text-xs">{subtitle}</p>
		{/if}
	</div>
	<button
		type="button"
		onclick={onClose}
		aria-label="Close"
		class="text-muted-foreground hover:text-foreground -mr-1 shrink-0 p-0.5 transition-colors"
	>
		<CloseIcon class="h-5 w-5" />
	</button>
</header>
