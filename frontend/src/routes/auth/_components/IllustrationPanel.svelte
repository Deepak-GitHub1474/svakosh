<script lang="ts">
	import { cn } from '$lib/utils';
	import FeatureCycler from './FeatureCycler.svelte';
	import type { TIllustrationPanel } from '../_lib/types';

	let { image, alt, features, class: className = '' }: TIllustrationPanel = $props();
</script>

<div
	class={cn(
		'relative overflow-hidden rounded-2xl bg-[#16181e] bg-no-repeat [background-position:50%_30%] [background-size:140%] lg:[background-size:160%] lg:[background-position:54%_10%]',
		className
	)}
	style="background-image: url({image});"
	role="img"
	aria-label={alt}
>
	<div
		class="pointer-events-none absolute inset-0"
		style="background: linear-gradient(180deg, transparent 55%, rgba(195, 178, 152, 0.22) 100%);"
	></div>

	<div class="absolute top-5 left-5 z-10">
		<FeatureCycler {features} />
	</div>
</div>
