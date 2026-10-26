<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import Icon from './Icon.svelte';
	import SectionHead from './SectionHead.svelte';
	import { ICONS, PRICING } from './data';
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
				<div class="flex items-center justify-between gap-3">
					<h3 class="text-lg font-semibold tracking-tight">{plan.name}</h3>
					{#if plan.trial}
						<span class="bg-primary/15 text-primary rounded-md px-2 py-1 text-xs"
							>First month free</span
						>
					{/if}
				</div>
				<p class="text-muted-foreground mt-1 text-sm">{plan.body}</p>

				{#if plan.options.length === 1}
					{@const price = plan.options[0].prices[period]}
					<p class="mt-6 flex items-baseline gap-1.5">
						<span class="text-3xl font-semibold tracking-tight tabular-nums">{amount(price)}</span>
						<span class="text-muted-foreground text-sm">{price ? unit : 'always'}</span>
					</p>
				{:else}
					<dl class="mt-6 flex flex-col gap-1.5">
						{#each plan.options as option (option.label)}
							<div class="flex items-baseline gap-1.5">
								<dt class="text-muted-foreground w-10 shrink-0 text-xs tracking-wider">
									{option.label}
								</dt>
								<dd class="flex items-baseline gap-1.5">
									<span class="text-2xl font-semibold tracking-tight tabular-nums">
										{amount(option.prices[period])}
									</span>
									<span class="text-muted-foreground text-sm">{unit}</span>
								</dd>
							</div>
						{/each}
					</dl>
				{/if}

				<ul class="text-muted-foreground mt-6 flex flex-1 flex-col gap-3 text-sm">
					{#each plan.features as feature (feature)}
						<li class="flex items-start gap-2.5">
							<Icon path={ICONS.check} class="text-primary mt-0.5 size-4 shrink-0" />
							{feature}
						</li>
					{/each}
				</ul>

				<SvaKoshButton
					variant={featured ? 'solid' : 'secondary'}
					href="/auth/signin"
					label={plan.trial ? 'Start free month' : 'Start free'}
					class="mt-8 h-11 w-full text-sm normal-case"
				/>
			</article>
		{/each}
	</div>
</section>
