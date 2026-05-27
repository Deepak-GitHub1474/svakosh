<script lang="ts">
	import { cn } from '$lib/utils';
	import type { TIllustrationPanel } from '../_lib/types';

	let { image, alt, caption, index, class: className = '' }: TIllustrationPanel = $props();
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

	<div class="absolute top-5 left-5 z-10 flex items-center gap-2.5">
		<span
			class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[#08090a]"
		>
			{index}
		</span>
		<span class="text-sm text-primary tracking-wide">{caption}</span>
	</div>
</div>
