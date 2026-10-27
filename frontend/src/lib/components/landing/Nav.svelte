<script lang="ts">
	import MenuToggle from './MenuToggle.svelte';
	import Sheet from './Sheet.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshLogo from '$lib/components/svakosh/SvaKoshLogo.svelte';
	import { resolve } from '$app/paths';
	import { BRAND } from '$lib/brand';
	import { NAV } from './data';

	let { sections = true }: { sections?: boolean } = $props();

	let open = $state(false);
</script>

<header
	class="sticky top-0 z-50 border-b border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)] backdrop-blur-2xl backdrop-saturate-150"
	style="--i: 0"
>
	<nav class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
		{#snippet logo()}
			<SvaKoshLogo class="size-10" />
			<span class="flex min-w-0 flex-col leading-tight">
				<span class="text-primary truncate text-lg/tight font-bold tracking-tight"
					>{BRAND.wordmark}</span
				>
				<span class="text-muted-foreground truncate text-sm/tight">{BRAND.tagline}</span>
			</span>
		{/snippet}
		{#if sections}
			<a href="#top" class="rise flex min-w-0 items-center gap-2.5">{@render logo()}</a>
		{:else}
			<a href={resolve('/')} class="rise flex min-w-0 items-center gap-2.5">{@render logo()}</a>
		{/if}

		<ul
			class="text-muted-foreground hidden items-center gap-7 text-base md:flex {sections
				? ''
				: 'invisible'}"
		>
			{#each NAV as link, i (link.id)}
				<li class="rise" style="--i: {i + 1}">
					<a
						href="#{link.id}"
						class="hover:text-foreground flex items-center gap-1.5 transition-colors"
					>
						<link.icon class="size-4" />
						{link.label}
					</a>
				</li>
			{/each}
		</ul>

		<div class="rise hidden items-center gap-4 md:flex" style="--i: 5">
			<SvaKoshButton
				variant="secondary"
				href="/auth/signin"
				label="Sign in"
				class="h-12 min-w-0 border-transparent px-5 text-sm normal-case"
			/>
			<SvaKoshButton
				variant="solid"
				href="/auth/signin"
				label="Get started"
				class="h-12 min-w-0 px-5 text-sm normal-case"
			/>
		</div>

		<MenuToggle bind:open class="-mr-2.5 md:hidden" />
	</nav>
</header>

<Sheet bind:open class="md:hidden">
	<div class="border-border-subtle flex h-16 shrink-0 items-center justify-between border-b px-5">
		<span class="flex items-center gap-2">
			<SvaKoshLogo />
			<span class="flex flex-col">
				<span class="text-primary text-sm/tight font-semibold tracking-tight">{BRAND.wordmark}</span
				>
				<span class="text-muted-foreground text-xs/tight">{BRAND.tagline}</span>
			</span>
		</span>
		<MenuToggle bind:open class="-mr-2.5" />
	</div>

	<nav class="flex flex-col gap-1 p-3 {sections ? '' : 'hidden'}">
		{#each NAV as link (link.id)}
			<a
				href="#{link.id}"
				onclick={() => (open = false)}
				class="hover:bg-surface flex items-center gap-3 rounded-lg px-3 py-3 text-base transition-colors"
			>
				<link.icon class="text-muted-foreground size-5" />
				{link.label}
			</a>
		{/each}
	</nav>

	<div class="border-border-subtle mt-auto flex flex-col gap-2 border-t p-5">
		<SvaKoshButton
			variant="solid"
			href="/auth/signin"
			label="Get started"
			class="h-12 w-full text-sm normal-case"
		/>
		<SvaKoshButton
			variant="secondary"
			href="/auth/signin"
			label="Sign in"
			class="h-12 w-full border-transparent text-sm normal-case"
		/>
	</div>
</Sheet>
