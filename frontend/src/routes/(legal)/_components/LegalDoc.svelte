<script lang="ts">
	import { BRAND, BUSINESS } from '$lib/brand';
	import type { TLegalDoc } from '../_lib/types';

	let { doc }: { doc: TLegalDoc } = $props();
</script>

<svelte:head>
	<title>{doc.title} | {BRAND.name}</title>
	<meta name="description" content={doc.intro} />
</svelte:head>

<article>
	<p class="text-muted-foreground flex items-center gap-3 text-xs tracking-[0.2em] uppercase">
		<span class="bg-primary h-px w-8 shrink-0" aria-hidden="true"></span>
		Last updated {BUSINESS.updated}
	</p>
	<h1 class="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] leading-tight font-semibold tracking-tight">
		{doc.title}
	</h1>
	<p class="text-muted-foreground mt-5 leading-relaxed">{doc.intro}</p>

	{#each doc.sections as section, i (section.heading)}
		<section class="mt-10">
			<h2 class="text-lg font-semibold tracking-tight">
				<span class="text-primary mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
				{section.heading}
			</h2>
			{#each section.body as paragraph (paragraph)}
				<p class="text-muted-foreground mt-3 leading-relaxed">{paragraph}</p>
			{/each}
		</section>
	{/each}
</article>
