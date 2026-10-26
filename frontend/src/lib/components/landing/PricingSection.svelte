<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import Icon from './Icon.svelte';
	import SectionHead from './SectionHead.svelte';
	import { ICONS, PRICING } from './data';
	import { spotlight } from './utils';

	type TPlanId = (typeof PRICING.plans)[number]['id'];

	let active = $state<TPlanId>(PRICING.plans[0].id);

	const plan = $derived(PRICING.plans.find((p) => p.id === active) ?? PRICING.plans[0]);
	const monthly = $derived(plan.prices.monthly);
	const saving = (price: number, months: number) =>
		months > 1 ? Math.round((1 - price / (monthly * months)) * 100) : 0;
</script>

<section id="pricing" class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
	<SectionHead eyebrow="Pricing" title={PRICING.title} />

	<div class="reveal border-border-muted bg-surface/40 mt-10 overflow-hidden rounded-3xl border">
		<div class="grid grid-cols-2" role="tablist">
			{#each PRICING.plans as option (option.id)}
				<button
					type="button"
					role="tab"
					aria-selected={option.id === active}
					onclick={() => (active = option.id)}
					class="border-b py-4 text-sm transition-colors sm:text-base {option.id === active
						? 'border-primary text-foreground'
						: 'border-border-muted text-muted-foreground hover:text-foreground'}"
				>
					{option.name}
				</button>
			{/each}
		</div>

		<div class="grid gap-8 px-4 py-8 sm:px-6 md:grid-cols-3 md:gap-5 md:py-10">
			{#each PRICING.periods as period (period.value)}
				{@const price = plan.prices[period.value]}
				{@const save = saving(price, period.months)}
				<div class="flex flex-col">
					<p class="mb-4 flex items-center justify-center gap-2">
						<span class="text-muted-foreground text-lg tracking-[0.3em] uppercase">
							{period.label}
						</span>
						{#if save}
							<span class="bg-primary/15 text-primary rounded-md px-1.5 py-0.5 text-xs font-medium">
								Save {save}%
							</span>
						{/if}
					</p>

					<article
						class="spot border-border-muted bg-surface/60 relative flex flex-1 flex-col rounded-2xl border p-5"
						use:spotlight
					>
						<div class="flex items-start justify-between gap-3">
							<span class="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
								<Icon path={plan.icon} class="size-5" />
							</span>
							<span
								class="border-border-muted text-muted-foreground rounded-full border px-2.5 py-1 text-xs tracking-wider uppercase"
							>
								First month free
							</span>
						</div>

						<h3 class="mt-4 font-semibold tracking-tight">{plan.name}</h3>
						<p class="text-muted-foreground text-sm">{plan.body}</p>

						<p class="mt-5 flex items-baseline gap-1.5">
							<span class="text-3xl font-semibold tracking-tight tabular-nums">
								₹{price.toLocaleString('en-IN')}
							</span>
							<span class="text-muted-foreground text-xs">/ {plan.per}{period.unit}</span>
						</p>

						<SvaKoshButton
							variant="solid"
							href="/auth/signin"
							label="Start free month"
							class="mt-5 h-12 w-full border-transparent text-sm normal-case"
						/>

						<div class="bg-border-muted my-5 h-px"></div>

						<h4 class="text-sm font-medium">Features</h4>
						<ul class="text-muted-foreground mt-3 flex flex-col gap-3 text-sm">
							{#each plan.features as feature (feature.label)}
								<li class="flex items-center gap-2.5">
									<Icon path={feature.icon} class="text-primary size-4" />
									{feature.label}
								</li>
							{/each}
						</ul>
						<p class="text-muted-foreground mt-4 flex items-center gap-1 text-sm">
							and more
							<Icon path={ICONS.arrow} class="size-3.5" />
						</p>
					</article>
				</div>
			{/each}
		</div>

		<p
			class="text-muted-foreground border-border-muted flex items-start gap-3 border-t px-4 py-5 text-sm leading-relaxed sm:px-6"
		>
			<Icon path={ICONS.info} class="mt-0.5 size-4" />
			{PRICING.note}
		</p>
	</div>
</section>
