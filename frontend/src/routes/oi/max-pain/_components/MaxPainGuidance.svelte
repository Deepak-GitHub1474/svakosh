<script lang="ts">
	import { slide } from 'svelte/transition';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';

	type Props = {
		selectedSymbol: string;
		maxPainStrike: number;
	};

	let { selectedSymbol, maxPainStrike }: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4" in:slide={{ delay: 200 }}>
	<SvaKoshCard class="flex flex-col gap-1 pt-0 pb-2">
		<h4 class="text-xs text-primary uppercase tracking-wider font-semibold">What is Max Pain?</h4>
		<p class="text-xs text-muted-foreground leading-relaxed">
			The strike price at which the total payout for option sellers is minimized. Often, indices tend to move towards this point at expiry.
		</p>
	</SvaKoshCard>

	<SvaKoshCard class="flex flex-col gap-1 pt-0 pb-2">
		<h4 class="text-xs text-primary uppercase tracking-wider font-semibold">How to read?</h4>
		<p class="text-xs text-muted-foreground leading-relaxed">
			Look for the lowest point on the "Pain" curve. This is the strike where option buyers lose the most amount of collective premium.
		</p>
	</SvaKoshCard>

	<SvaKoshCard class="bg-primary/5 !border-primary/10 flex flex-col gap-1 pt-0 pb-2">
		<h4 class="text-xs text-primary uppercase tracking-wider font-semibold">Market Insight</h4>
		<p class="text-xs text-muted-foreground leading-relaxed">
			Currently <span class="text-primary font-medium">{selectedSymbol}</span> shows a convergence point at <span class="text-primary font-medium">{maxPainStrike}</span>.
			Monitor shift in this point to identify trend reversals.
		</p>
	</SvaKoshCard>
</div>