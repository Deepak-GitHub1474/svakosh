<script lang="ts">
	const features = [
		{
			title: 'Bank-grade Security',
			body: 'Your data is encrypted and always protected.',
			icon: 'shield'
		},
		{
			title: 'Real-time Insights',
			body: 'Stay ahead with real-time market data and analytics.',
			icon: 'chart'
		},
		{
			title: 'Smart Portfolio',
			body: 'Diversify and manage your portfolio with confidence.',
			icon: 'pie'
		},
		{
			title: 'Built for Traders',
			body: 'Powerful tools for beginners and pro traders.',
			icon: 'trophy'
		}
	] as const;
</script>

<div
	class="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#101216] px-6 py-5 sm:px-8 sm:py-6"
>
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
		{#each features as f (f.title)}
			<div class="flex items-start gap-3">
				<span class="mt-0.5 text-primary" aria-hidden="true">
					{#if f.icon === 'shield'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 2 4 5v7c0 5 3.6 8.7 8 10 4.4-1.3 8-5 8-10V5l-8-3Z" />
							<path d="m9 12 2.2 2.2L15 10.5" />
						</svg>
					{:else if f.icon === 'chart'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 3v18h18" />
							<rect x="7" y="12" width="2.5" height="6" rx="0.4" fill="currentColor" />
							<rect x="11.5" y="8" width="2.5" height="10" rx="0.4" fill="currentColor" />
							<rect x="16" y="14" width="2.5" height="4" rx="0.4" fill="currentColor" />
						</svg>
					{:else if f.icon === 'pie'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 3v9h9" />
							<path d="M21 12a9 9 0 1 1-9-9" />
							<path d="M12 12 5.6 5.6" opacity="0.4" />
						</svg>
					{:else if f.icon === 'trophy'}
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
							<path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
							<path d="M5 6H3v2a3 3 0 0 0 3 3" />
							<path d="M19 6h2v2a3 3 0 0 1-3 3" />
							<path d="M9 13h6l-.5 4h-5L9 13Z" />
							<path d="M8 20h8" />
						</svg>
					{/if}
				</span>
				<div>
					<div class="text-[0.85rem] font-semibold text-primary">{f.title}</div>
					<p class="mt-1 text-[0.78rem] leading-snug text-muted-foreground">{f.body}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
