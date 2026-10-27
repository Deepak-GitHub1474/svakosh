<script lang="ts">
	import type { Snippet } from 'svelte';
	import PremiumGate from '$lib/components/billing/PremiumGate.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<PremiumGate feature="stocks_screener" title="Stocks Screener">{@render children()}</PremiumGate>
