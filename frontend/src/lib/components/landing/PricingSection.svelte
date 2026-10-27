<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import ArrowRightIcon from '$lib/components/svg-provider/ArrowRightIcon.svelte';
	import SectionHead from './SectionHead.svelte';
	import { PRICING } from './data';
	import { spotlight } from './utils';

	type TPeriod = (typeof PRICING.periods)[number]['value'];

	let period = $state<TPeriod>('monthly');

	const amount = (value: number) => `₹${value.toLocaleString('en-IN')}`;
	const UNITS: Record<TPeriod, string> = {
		monthly: '/ month',
		quarterly: '/ quarter',
		annually: '/ year'
	};
	const unit = $derived(UNITS[period]);
	const save = (prices: Record<TPeriod, number>) => {
		const months = PRICING.periods.find((p) => p.value === period)?.months ?? 1;
		return prices.monthly ? Math.round((1 - prices[period] / (prices.monthly * months)) * 100) : 0;
	};
</script>

<section id="pricing" class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
	<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
		<SectionHead eyebrow="Pricing" title={PRICING.title} />
		<SvaKoshTabs
			tabs={[...PRICING.periods]}
			activeTab={period}
			onTabChange={(value: TPeriod) => (period = value)}
			class="reveal border-primary/20 bg-primary-subtle w-fit shrink-0"
		/>
	</div>

	<div class="mt-10 grid gap-4 md:grid-cols-3">
		{#each PRICING.plans as plan (plan.name)}
			{@const featured = 'featured' in plan && plan.featured}
			<article
				class="reveal spot relative flex flex-col rounded-2xl border p-6 {featured
					? 'border-primary/40 bg-primary/5'
					: 'border-border-muted bg-surface/40'}"
				use:spotlight
			>
				<div class="flex items-start gap-3">
					<span
						class="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-xl"
					>
						<plan.icon class="size-5" />
					</span>
					<div class="min-w-0">
						<h3 class="text-lg leading-tight font-semibold tracking-tight">{plan.name}</h3>
						<p class="text-muted-foreground mt-1 text-sm">{plan.body}</p>
					</div>
				</div>

				<p class="mt-6 flex items-baseline gap-1.5">
					<span class="text-3xl font-semibold tracking-tight tabular-nums">
						{amount(plan.prices[period])}
					</span>
					{#if plan.prices[period]}
						<span class="text-muted-foreground text-sm">{unit}</span>
					{/if}
				</p>
				{#if plan.trial || save(plan.prices) > 0}
					<div class="mt-3 flex flex-wrap gap-2 text-xs">
						{#if plan.trial}
							<span class="bg-primary/15 text-primary rounded-md px-2 py-1">First month free</span>
						{/if}
						{#if save(plan.prices) > 0}
							<span class="bg-success-subtle text-success rounded-md px-2 py-1"
								>Save {save(plan.prices)}%</span
							>
						{/if}
					</div>
				{/if}

				<ul class="text-muted-foreground mt-6 flex flex-1 flex-col gap-3 text-sm">
					{#each plan.features as feature (feature.label)}
						<li class="flex items-start gap-2.5">
							<feature.icon class="text-primary mt-0.5 size-4 shrink-0" />
							{feature.label}
						</li>
					{/each}
					{#if plan.more}
						<li class="flex items-center gap-1.5">
							{plan.more}
							<ArrowRightIcon class="size-3.5" />
						</li>
					{/if}
				</ul>

				<SvaKoshButton
					variant={featured ? 'solid' : 'secondary'}
					href="/auth/signin"
					label={plan.trial ? 'Start free month' : 'Start free'}
					class="mt-8 h-12 w-full border-transparent text-sm normal-case"
				/>
			</article>
		{/each}
	</div>
</section>
