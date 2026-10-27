<script lang="ts">
	import { cn } from '$lib/utils';

	let { tone, class: className = '' }: { tone: 'success' | 'error'; class?: string } = $props();

	const STROKE = '[stroke-dasharray:1] motion-safe:[stroke-dashoffset:1] motion-safe:animate-draw';
	const PATHS = { success: ['M15 27l7 7 15-15'], error: ['M19 19l14 14', 'M33 19L19 33'] };
</script>

<div class={cn('relative grid size-24 place-items-center', className)} aria-hidden="true">
	<span class="motion-safe:animate-ripple absolute inset-2 rounded-full bg-current/20"></span>
	<span
		class="motion-safe:animate-ripple absolute inset-2 rounded-full bg-current/20 motion-safe:[animation-delay:0.5s]"
	></span>
	<svg
		viewBox="0 0 52 52"
		class="motion-safe:animate-pop relative size-20"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle
			cx="26"
			cy="26"
			r="24"
			pathLength="1"
			fill="currentColor"
			fill-opacity="0.1"
			class={STROKE}
		/>
		{#each PATHS[tone] as d, i (d)}
			<path {d} pathLength="1" class={STROKE} style:animation-delay="{0.35 + i * 0.2}s" />
		{/each}
	</svg>
</div>
