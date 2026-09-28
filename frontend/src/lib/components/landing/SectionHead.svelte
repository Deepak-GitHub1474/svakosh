<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let {
		eyebrow,
		title,
		body,
		class: className = ''
	}: { eyebrow: string; title: string; body?: string; class?: string } = $props();
</script>

<div class={cn('reveal max-w-2xl', className)}>
	<p class="text-muted-foreground flex items-center gap-3 text-xs tracking-[0.2em] uppercase">
		<span class="bg-primary h-px w-8 shrink-0" aria-hidden="true"></span>
		{eyebrow}
	</p>

	<h2
		class="mt-5 text-[clamp(1.75rem,5.5vw,3rem)] leading-[1.15] font-semibold tracking-tight text-balance"
	>
		{title}
	</h2>

	{#if body}
		<p class="text-muted-foreground mt-5 leading-relaxed">{body}</p>
	{/if}
</div>
