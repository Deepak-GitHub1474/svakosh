<script lang="ts">
	import ExpandLess from '$lib/components/svg-provider/material/ExpandLess.svelte';
	import { TABLE } from '$lib/trade/const';
	import type { TSortDir } from '$lib/trade/sort';

	let {
		label,
		dir,
		onToggle,
		class: className = ''
	}: { label: string; dir: TSortDir; onToggle: () => void; class?: string } = $props();

	const ARIA: Record<TSortDir, 'none' | 'descending' | 'ascending'> = {
		'': 'none',
		desc: 'descending',
		asc: 'ascending'
	};
</script>

<th class="{TABLE.th} {className}" aria-sort={ARIA[dir]}>
	<button
		type="button"
		onclick={onToggle}
		title="Sort by {label}"
		class="hover:text-foreground inline-flex items-center gap-0.5 transition-colors {dir
			? 'text-primary'
			: ''}"
	>
		{label}
		<ExpandLess class="size-4 {dir === 'desc' ? 'rotate-180' : ''} {dir ? '' : 'opacity-40'}" />
	</button>
</th>
