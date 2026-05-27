<script lang="ts">
	import { cn } from '$lib/utils';
	import FeatureCycler from './FeatureCycler.svelte';
	import IllustrationCarousel from './IllustrationCarousel.svelte';
	import type { TIllustrationPanel } from '../_lib/types';

	let { images, features, class: className = '' }: TIllustrationPanel = $props();
</script>

<div
	class={cn(
		'relative overflow-hidden rounded-2xl bg-[#16181e]',
		className
	)}
>
	<IllustrationCarousel {images} />

	<div
		class="pointer-events-none absolute inset-0 z-[1]"
		style="background: linear-gradient(180deg, transparent 55%, rgba(195, 178, 152, 0.22) 100%);"
	></div>

	<div class="absolute top-5 left-5 z-10">
		<FeatureCycler {features} />
	</div>
</div>
