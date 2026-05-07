<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		image: string;
		alt: string;
		caption: string;
		index: number;
		class?: string;
	};

	let { image, alt, caption, index, class: className = '' }: Props = $props();
</script>

<div
	class={cn(
		'relative overflow-hidden rounded-2xl bg-no-repeat',
		'aspect-[3/5] lg:aspect-auto lg:h-full lg:min-h-[720px]',
		className
	)}
	style="background-color: #16181e;
		background-image: url({image});
		background-size: 160%;
		background-position: 54% 10%;"
	role="img"
	aria-label={alt}
>
	<div
		class="pointer-events-none absolute inset-0"
		style="background: linear-gradient(180deg, transparent 55%, rgba(195, 178, 152, 0.22) 100%);"
	></div>

	<div class="absolute top-5 left-5 z-10 flex items-center gap-2.5">
		<span
			class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[0.7rem] font-semibold text-[#08090a] shadow-[0_0_12px_rgba(212,175,55,0.45)]"
		>
			{index}
		</span>
		<span class="text-[0.85rem] font-medium text-primary tracking-wide">{caption}</span>
	</div>
</div>
