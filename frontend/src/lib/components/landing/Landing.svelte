<script lang="ts">
	import AnalyticsStack from './AnalyticsStack.svelte';
	import Carousel from './Carousel.svelte';
	import BreakoutPanel from './BreakoutPanel.svelte';
	import FeatureCard from './FeatureCard.svelte';
	import Footer from './Footer.svelte';
	import Hero from './Hero.svelte';
	import Icon from './Icon.svelte';
	import Nav from './Nav.svelte';
	import MarketPanel from './MarketPanel.svelte';
	import OptionsPanel from './OptionsPanel.svelte';
	import TrackerPanel from './TrackerPanel.svelte';
	import SectionHead from './SectionHead.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import Ticker from './Ticker.svelte';
	import Watermark from './Watermark.svelte';
	import { ANALYTICS, CTA, MODULES, SECURITY, WORKFLOW } from './data';
	import { spotlight } from './utils';
</script>

<Nav />
<Ticker />

<main id="top">
	<Hero />

	<section id="modules" class="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:pt-12">
		<SectionHead eyebrow="Modules" title={MODULES.title} body={MODULES.body} />

		<Carousel items={MODULES.items} class="mt-10">
			{#snippet slide(item)}
				{#if item.id === 'options'}
					<OptionsPanel />
				{:else if item.id === 'tracker'}
					<TrackerPanel />
				{:else if item.id === 'breakout'}
					<BreakoutPanel />
				{:else}
					<MarketPanel />
				{/if}
			{/snippet}
		</Carousel>
	</section>

	<section id="analytics" class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
		<SectionHead eyebrow="Analytics" title={ANALYTICS.title} body={ANALYTICS.body} />

		<AnalyticsStack items={ANALYTICS.items} class="mt-8 md:hidden" />

		<div class="mt-10 hidden gap-4 md:grid md:grid-cols-2">
			{#each ANALYTICS.items as item, i (item.title)}
				<FeatureCard index={i} {...item} />
			{/each}
		</div>
	</section>

	<section id="workflow" class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
		<SectionHead eyebrow="Workflow" title={WORKFLOW.title} body={WORKFLOW.body} />

		<ol class="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
			{#each WORKFLOW.items as step, i (step.title)}
				<li class="reveal">
					<div class="bg-border-muted relative h-px">
						<span class="bg-primary absolute inset-y-0 left-0 w-12" aria-hidden="true"></span>
					</div>

					<div class="flex items-center gap-4 pt-6">
						<span
							class="border-border-muted bg-surface text-primary grid size-11 place-items-center rounded-xl border"
						>
							<Icon path={step.icon} class="size-5" />
						</span>
						<span class="text-muted-foreground text-xs tracking-[0.18em] uppercase">
							Step {String(i + 1).padStart(2, '0')}
						</span>
					</div>

					<h3 class="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
					<p class="text-muted-foreground mt-3 leading-relaxed">{step.body}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section id="security" class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
		<SectionHead eyebrow="Security" title={SECURITY.title} />

		<dl class="reveal mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each SECURITY.items as item (item.title)}
				<div
					class="spot border-border-muted bg-surface/40 relative grid grid-cols-[2.75rem_1fr] content-start gap-x-3 rounded-2xl border p-4"
					use:spotlight
				>
					<span
						class="bg-primary/10 text-primary col-start-1 row-span-2 row-start-1 grid size-11 shrink-0 place-items-center self-start rounded-xl"
						aria-hidden="true"
					>
						<Icon path={item.icon} class="size-5" />
					</span>
					<dt class="col-start-2 row-start-1 self-center font-medium tracking-tight">
						{item.title}
					</dt>
					<dd class="text-muted-foreground col-start-2 row-start-2 mt-1.5 text-sm leading-relaxed">
						{item.body}
					</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
		<div
			class="reveal border-border-muted bg-surface/40 relative overflow-hidden rounded-3xl border px-6 py-10 sm:px-10 md:py-12"
		>
			<div
				class="bg-primary/10 pointer-events-none absolute -top-28 -right-20 size-72 rounded-full blur-3xl"
				aria-hidden="true"
			></div>

			<div
				class="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12"
			>
				<div class="max-w-xl">
					<p
						class="text-muted-foreground flex items-center gap-3 text-xs tracking-[0.2em] uppercase"
					>
						<span class="bg-primary h-px w-8 shrink-0" aria-hidden="true"></span>
						{CTA.eyebrow}
					</p>
					<h2
						class="mt-4 text-[clamp(1.5rem,4vw,2.25rem)] leading-tight font-semibold tracking-tight text-balance"
					>
						{CTA.title}
					</h2>
					<p class="text-muted-foreground mt-3 leading-relaxed">{CTA.body}</p>
				</div>

				<SvaKoshButton
					variant="solid"
					href={CTA.href}
					label={CTA.label}
					class="h-12 shrink-0 px-8 text-sm normal-case"
				/>
			</div>
		</div>
	</section>

	<div class="mt-12 w-full overflow-x-clip md:mt-16">
		<Watermark
			text="SvaKosh"
			class="mx-auto w-fit text-[clamp(3.5rem,19vw,14rem)] leading-[0.95] font-semibold tracking-tighter whitespace-nowrap select-none"
		/>
	</div>
</main>

<Footer />
