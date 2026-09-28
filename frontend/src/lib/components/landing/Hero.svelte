<script lang="ts">
	import HeroCandles from './HeroCandles.svelte';
	import StatReel from './StatReel.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import { HERO, STATS } from './data';
</script>

<div class="relative isolate">
	<HeroCandles class="absolute inset-0 -z-10" />

	<section class="mx-auto max-w-6xl px-4 pt-14 pb-20 sm:px-6 md:pt-24 md:pb-28">
		<h1
			class="rise max-w-4xl text-[clamp(2.25rem,8.5vw,4.75rem)] leading-[1.08] font-semibold tracking-tight text-balance"
			style="--i: 1"
		>
			{HERO.title[0]}
			<span class="text-primary">{HERO.title[1]}</span>
		</h1>

		<p
			class="rise text-muted-foreground mt-6 max-w-xl text-base leading-relaxed text-pretty sm:text-lg"
			style="--i: 3"
		>
			{HERO.body}
		</p>

		<div class="rise mt-10 flex flex-col gap-3 sm:flex-row" style="--i: 4">
			<SvaKoshButton
				variant="solid"
				href={HERO.primary.href}
				label={HERO.primary.label}
				class="h-12 px-7 sm:min-w-56"
			/>

			<SvaKoshButton
				shine
				variant="secondary"
				href={HERO.secondary.href}
				label={HERO.secondary.label}
				class="h-12 border-transparent px-7 text-sm normal-case sm:min-w-56"
			/>
		</div>

		<dl
			class="rise border-border-subtle mt-24 grid grid-cols-1 gap-5 border-t pt-8 sm:grid-cols-3 sm:gap-8 sm:pt-10 md:mt-32"
			style="--i: 5"
		>
			{#each STATS as stat, i (stat.label)}
				<StatReel value={stat.value} label={stat.label} icon={stat.icon} index={i} />
			{/each}
		</dl>
	</section>
</div>
