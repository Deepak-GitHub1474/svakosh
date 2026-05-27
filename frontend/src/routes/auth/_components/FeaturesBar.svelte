<script lang="ts">
	const features = [
		{
			title: 'Secure & Private',
			body: 'Your data is encrypted and always protected.',
			icon: 'shield'
		},
		{
			title: 'Fast & Reliable',
			body: 'Stay ahead with real-time market data and analytics.',
			icon: 'electric_bolt'
		},
		{
			title: 'Premium Experience',
			body: 'Diversify and manage your portfolio with confidence.',
			icon: 'diamond'
		},
		{
			title: 'Powerful Tools',
			body: 'Powerful tools for beginners and pro traders.',
			icon: 'award_star'
		}
	] as const;
</script>

<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
	{#each features as f (f.title)}
		<div class="flex items-start gap-3">
			<span class="material-symbols-outlined icon-size mt-px text-primary" aria-hidden="true">
				{f.icon}
			</span>
			<div>
				<div class="text-sm font-semibold text-primary">{f.title}</div>
				<p class="mt-1 text-xs leading-snug text-muted-foreground">{f.body}</p>
			</div>
		</div>
	{/each}
</div>
