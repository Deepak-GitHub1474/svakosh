<script lang="ts">
	import AwardStar from '$lib/components/svg-provider/material/AwardStar.svelte';
	import Diamond from '$lib/components/svg-provider/material/Diamond.svelte';
	import ElectricBolt from '$lib/components/svg-provider/material/ElectricBolt.svelte';
	import Shield from '$lib/components/svg-provider/material/Shield.svelte';

	const features = [
		{
			title: 'Secure & Private',
			body: 'Your data is encrypted and always protected.',
			icon: Shield
		},
		{
			title: 'Fast & Reliable',
			body: 'Stay ahead with real-time market data and analytics.',
			icon: ElectricBolt
		},
		{
			title: 'Premium Experience',
			body: 'Diversify and manage your portfolio with confidence.',
			icon: Diamond
		},
		{
			title: 'Powerful Tools',
			body: 'Powerful tools for beginners and pro traders.',
			icon: AwardStar
		}
	] as const;
</script>

<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
	{#each features as f (f.title)}
		<div class="flex items-start gap-3">
			<f.icon class="icon-size mt-px text-primary" />
			<div>
				<div class="text-sm font-semibold text-primary">{f.title}</div>
				<p class="mt-1 text-xs leading-snug text-muted-foreground">{f.body}</p>
			</div>
		</div>
	{/each}
</div>
