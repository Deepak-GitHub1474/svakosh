<script lang="ts">
	import { getContext } from 'svelte';
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';
	import { SHEET_CONTEXT } from '$lib/trade/const';

	let {
		title,
		subtitle = '',
		onClose
	}: { title: string; subtitle?: string; onClose: () => void } = $props();

	const sheet = getContext<{ drawer: boolean } | undefined>(SHEET_CONTEXT);
</script>

<header
	class="bg-surface-elevated border-border-subtle border-b px-5 pb-3 {sheet?.drawer
		? 'pt-2.5'
		: 'pt-4'}"
>
	{#if sheet?.drawer}
		<div aria-hidden="true" class="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15"></div>
	{/if}
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0">
			<h2 class="text-foreground truncate text-base font-medium">{title}</h2>
			{#if subtitle}
				<p class="text-muted-foreground mt-1 text-xs">{subtitle}</p>
			{/if}
		</div>
		{#if !sheet?.drawer}
			<button
				type="button"
				onclick={onClose}
				aria-label="Close"
				class="text-muted-foreground hover:text-foreground -mr-1 shrink-0 p-0.5 transition-colors"
			>
				<CloseIcon class="h-5 w-5" />
			</button>
		{/if}
	</div>
</header>
