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
	const reference = PRICING.plans.find((p) => p.prices.monthly)?.prices;
	const tabs = PRICING.periods.map((p) => {
		const save = reference
			? Math.round((1 - reference[p.value] / (reference.monthly * p.months)) * 100)
			: 0;
		return { label: save > 0 ? `${p.label} · Save ${save}%` : p.label, value: p.value };
	});
</script>

<section id="pricing" class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
	<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
		<SectionHead eyebrow="Pricing" title={PRICING.title} />
		<SvaKoshTabs
			{tabs}
			activeTab={period}
			onTabChange={(value: TPeriod) => (period = value)}
			class="reveal border-primary/20 bg-primary-subtle w-fit shrink-0"
		/>
	</div>

	<div class="relative mt-10">
		<div
			class="pointer-events-none absolute -top-10 -left-14 hidden -rotate-12 lg:block"
			aria-hidden="true"
		>
			<div class="bg-primary/10 absolute inset-0 rounded-full blur-2xl"></div>
			<svg viewBox="0 0 120 72" class="motion-safe:animate-float relative w-28">
				<rect
					x="2"
					y="2"
					width="116"
					height="68"
					rx="10"
					class="fill-surface stroke-border-muted"
					stroke-width="2"
				/>
				<rect
					x="10"
					y="10"
					width="100"
					height="52"
					rx="6"
					class="stroke-primary/30 fill-none"
					stroke-width="1.5"
				/>
				<circle
					cx="60"
					cy="36"
					r="16"
					class="fill-primary/10 stroke-primary/40"
					stroke-width="1.5"
				/>
				<text x="60" y="43" text-anchor="middle" class="fill-primary text-xl font-semibold">₹</text>
			</svg>
		</div>

		<div
			class="pointer-events-none absolute -right-12 -bottom-12 z-10 hidden rotate-12 lg:block"
			aria-hidden="true"
		>
			<div class="bg-primary/10 absolute inset-0 rounded-full blur-2xl"></div>
			<svg
				viewBox="0 0 80 112"
				class="motion-safe:animate-float relative w-16 [animation-delay:-3.5s]"
			>
				<path
					d="M40 2 78 26v72a12 12 0 0 1-12 12H14A12 12 0 0 1 2 98V26Z"
					class="fill-surface stroke-border-muted"
					stroke-width="2"
				/>
				<circle
					cx="40"
					cy="28"
					r="6"
					class="fill-background stroke-border-muted"
					stroke-width="2"
				/>
				<text x="40" y="82" text-anchor="middle" class="fill-primary text-3xl font-semibold">%</text
				>
			</svg>
		</div>

		<div class="relative grid gap-4 md:grid-cols-3">
			{#each PRICING.plans as plan (plan.name)}
				{@const featured = 'featured' in plan && plan.featured}
				<article
					class="reveal spot relative flex flex-col rounded-2xl border p-6 {featured
						? 'border-primary/40 bg-primary/5'
						: 'border-border-muted bg-surface/40'}"
					use:spotlight
				>
					<div class="flex items-start justify-between gap-3">
						<span class="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
							<Icon path={plan.icon} class="size-5" />
						</span>
						{#if plan.trial}
							<span class="bg-primary/15 text-primary rounded-md px-2 py-1 text-xs"
								>First month free</span
							>
						{/if}
					</div>
					<h3 class="mt-4 text-lg font-semibold tracking-tight">{plan.name}</h3>
					<p class="text-muted-foreground mt-1 text-sm">{plan.body}</p>

					<p class="mt-6 flex items-baseline gap-1.5">
						<span class="text-3xl font-semibold tracking-tight tabular-nums">
							{amount(plan.prices[period])}
						</span>
						{#if plan.prices[period]}
							<span class="text-muted-foreground text-sm">{unit}</span>
						{/if}
					</p>

					<ul class="text-muted-foreground mt-6 flex flex-1 flex-col gap-3 text-sm">
						{#each plan.features as feature (feature.label)}
							<li class="flex items-start gap-2.5">
								<Icon path={feature.icon} class="text-primary mt-0.5 size-4 shrink-0" />
								{feature.label}
							</li>
						{/each}
						{#if plan.more}
							<li class="flex items-center gap-1.5">
								{plan.more}
								<Icon path={ICONS.arrow} class="size-3.5" />
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
	</div>
</section>
