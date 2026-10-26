<script lang="ts">
	import { BRAND } from '$lib/brand';
	import Icon from '$lib/components/landing/Icon.svelte';
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

<dl class="mt-10 grid gap-3 sm:grid-cols-2">
	{#each CONTACT.items as item (item.label)}
		<div
			class="border-border-muted bg-surface/40 grid grid-cols-[2.75rem_1fr] gap-x-3 rounded-2xl border p-4"
		>
			<span
				class="bg-primary/10 text-primary row-span-2 grid size-11 place-items-center rounded-xl"
				aria-hidden="true"
			>
				<Icon path={item.icon} class="size-5" />
			</span>
			<dt class="text-muted-foreground self-center text-xs tracking-wider uppercase">
				{item.label}
			</dt>
			<dd class="mt-1 text-sm leading-relaxed break-words">
				{#if item.kind === 'email'}
					<a href="mailto:{item.value}" class="text-foreground hover:text-primary transition-colors"
						>{item.value}</a
					>
				{:else}
					{item.value}
				{/if}
			</dd>
		</div>
	{/each}
</dl>
