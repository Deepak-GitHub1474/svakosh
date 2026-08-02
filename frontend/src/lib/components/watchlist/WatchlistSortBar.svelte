<script lang="ts">
	import type { TWatchlistSortBy } from './types';
	import SwapVert from '$lib/components/svg-provider/material/SwapVert.svelte';

	interface Props {
		sortBy: TWatchlistSortBy;
		onsortchange?: (key: TWatchlistSortBy) => void;
	}

	let { sortBy, onsortchange }: Props = $props();

	const options: { key: TWatchlistSortBy; label: string }[] = [
		{ key: 'name', label: 'A-Z' },
		{ key: 'ltp', label: 'LTP' },
		{ key: 'change', label: 'Change' },
		{ key: 'changePct', label: 'Change %' }
	];
</script>

<div
	class="shrink-0 flex items-center justify-between gap-2 py-2 px-4 lg:px-2 border-t border-border-subtle bg-glass"
>
	<span class="text-xs text-muted-foreground inline-flex items-center gap-1">
		<SwapVert style="font-size:0.875rem" />
		Sort By
	</span>
	<div class="flex">
		{#each options as opt (opt.key)}
			{@const active = sortBy === opt.key}
			<button
				type="button"
				onclick={() => onsortchange?.(opt.key)}
				class="px-1.5 py-1 text-xs border-none bg-transparent cursor-pointer rounded transition-colors {active
					? 'bg-primary-hover text-primary'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				{opt.label}
			</button>
		{/each}
	</div>
</div>
