<script lang="ts">
	import { fade } from 'svelte/transition';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import DetailIcon from '$lib/components/svg-provider/Info.svelte';
	import UpArrow from '$lib/components/svg-provider/UpArrow.svelte';
	import DownArrow from '$lib/components/svg-provider/DownArrow.svelte';

	interface Props {
		stats: {
			total: number;
			highs: number;
			lows: number;
		};
	}

	let { stats }: Props = $props();
</script>

<div
	in:fade={{ duration: 800 }}
	class="bg-background/95 backdrop-blur-md border-b border-border-subtle flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-4 pb-4"
>
	<header>
		<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
			52-Week Breakout
		</h1>
		<p class="text-muted-foreground text-sm">Real-time detection of periodic stock price extremes</p>
	</header>

	<section class="grid grid-cols-2 md:grid-cols-3 gap-4 lg:w-auto w-full">
		<SvaKoshCard
			label="Total Breakouts"
			value={stats.total}
			ghostIcon={DetailIcon}
			class="w-full lg:w-48 py-2.5 col-span-2 md:col-span-1"
			valueClass="text-xl"
			ghostIconClass="h-8 w-8"
		/>
		<SvaKoshCard
			label="New Highs"
			value={stats.highs}
			variant="bullish"
			ghostIcon={UpArrow}
			class="w-full lg:w-48 py-2.5"
			valueClass="text-xl"
			ghostIconClass="h-8 w-8"
		/>
		<SvaKoshCard
			label="New Lows"
			value={stats.lows}
			variant="bearish"
			ghostIcon={DownArrow}
			class="w-full lg:w-48 py-2.5"
			valueClass="text-xl"
			ghostIconClass="h-8 w-8"
		/>
	</section>
</div>
