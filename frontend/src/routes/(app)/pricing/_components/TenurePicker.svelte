<script lang="ts">
	import { TENURES, TENURE_LABELS, TENURE_UNITS } from '$lib/billing/const';
	import { matchPrice, rupees } from '$lib/billing/helper';
	import type { TPlan, TTenure } from '$lib/billing/types';

	let {
		plan,
		broker,
		ip,
		value = $bindable()
	}: { plan: TPlan; broker: string | null; ip: string | null; value: TTenure } = $props();

	const options = $derived(
		TENURES.flatMap((tenure) => {
			const price = matchPrice(plan, tenure, broker, ip);
			return price ? [{ tenure, paise: price.price_paise }] : [];
		})
	);

	$effect(() => {
		if (options.length && !options.some((o) => o.tenure === value)) value = options[0].tenure;
	});
</script>

<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
	{#each options as option (option.tenure)}
		{@const selected = option.tenure === value}
		<button
			type="button"
			aria-pressed={selected}
			onclick={() => (value = option.tenure)}
			class="rounded-xl p-3 text-left transition-colors {selected
				? 'bg-primary/15 ring-primary/40 ring-1'
				: 'glass-panel hover:bg-glass'}"
		>
			<span class="text-muted-foreground block text-xs tracking-wider uppercase">
				{TENURE_LABELS[option.tenure]}
			</span>
			<span class="text-foreground mt-1 block text-lg tabular-nums">
				{option.paise ? rupees(option.paise) : 'Free'}
			</span>
			{#if option.paise}
				<span class="text-muted-foreground text-xs">per {TENURE_UNITS[option.tenure]}</span>
			{/if}
		</button>
	{:else}
		<p class="text-muted-foreground text-sm">No billing period is available for this choice.</p>
	{/each}
</div>
