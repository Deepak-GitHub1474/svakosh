<script lang="ts">
	import { BRAND, BUSINESS } from '$lib/brand';
	import Icon from '$lib/components/landing/Icon.svelte';
	import { ICONS } from '$lib/components/landing/data';
	import { CONTACT } from '../_lib/content';
</script>

<svelte:head>
	<title>Contact Us | {BRAND.name}</title>
	<meta name="description" content={CONTACT.intro} />
</svelte:head>

<p class="text-muted-foreground flex items-center gap-3 text-xs tracking-[0.2em] uppercase">
	<span class="bg-primary h-px w-8 shrink-0" aria-hidden="true"></span>
	Support
</p>
<h1 class="mt-5 text-[clamp(1.75rem,5vw,2.5rem)] leading-tight font-semibold tracking-tight">
	Contact Us
</h1>
<p class="text-muted-foreground mt-5 leading-relaxed">{CONTACT.intro}</p>

<a
	href="mailto:{BUSINESS.email}"
	class="border-border-muted bg-surface/40 hover:border-primary/40 mt-10 inline-flex items-center gap-3 rounded-2xl border p-4 transition-colors"
>
	<span
		class="bg-primary/10 text-primary grid size-11 place-items-center rounded-xl"
		aria-hidden="true"
	>
		<Icon path={ICONS.bookmark} class="size-5" />
	</span>
	<span>
		<span class="text-muted-foreground block text-xs tracking-wider uppercase">Email</span>
		<span class="text-foreground mt-1 block text-sm">{BUSINESS.email}</span>
	</span>
</a>
