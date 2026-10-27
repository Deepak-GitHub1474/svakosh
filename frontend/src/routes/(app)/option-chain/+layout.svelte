<script lang="ts">
	import type { Snippet } from 'svelte';
	import PremiumGate from '$lib/components/billing/PremiumGate.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<PremiumGate feature="option_chain" title="Option Chain">{@render children()}</PremiumGate>
