<script lang="ts">
	import type { Snippet } from 'svelte';
	import { spotlight } from './utils';

	let {
		title,
		subtitle,
		chips = [],
		children
	}: { title: string; subtitle: string; chips?: readonly string[]; children: Snippet } = $props();
</script>

<article
	class="spot border-border-muted bg-surface/50 flex h-full flex-col overflow-hidden rounded-2xl border"
	use:spotlight
>
	<div
		class="border-border-subtle flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
	>
		<div class="min-w-0">
			<h3 class="text-primary text-base font-medium tracking-tight">{title}</h3>
			<p class="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
		</div>

		{#if chips.length}
			<div class="flex shrink-0 gap-2">
				{#each chips as chip (chip)}
					<span
						class="border-border-muted bg-background/60 text-muted-foreground rounded-md border px-2.5 py-1 text-xs"
					>
						{chip}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<div class="hide-scrollbar flex-1 overflow-y-auto p-5">
		{@render children()}
	</div>
</article>
