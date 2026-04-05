<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { BRAND } from '$lib/brand';
	import SvaKoshButton from '$lib/components/SvaKoshButton.svelte';
	import { cn } from '$lib/utils';

	const status = $derived(page.status);
	const err = $derived(page.error);

	const isNotFound = $derived(status === 404);
	const heading = $derived(isNotFound ? 'Page not found' : 'Something went wrong');
	const message = $derived(
		isNotFound
			? "We couldn't find this page. It may have been moved or the link is wrong."
			: err?.message?.trim()
				? err.message
				: 'An unexpected error occurred. Try refreshing or go back home.'
	);

	let refreshing = $state(false);

	function goHome() {
		goto(resolve('/'));
	}

	async function refresh() {
		if (refreshing) return;
		refreshing = true;
		if (isNotFound) {
			location.reload();
			return;
		}
		try {
			await invalidateAll();
		} finally {
			refreshing = false;
		}
	}
</script>

<svelte:head>
	<title>{isNotFound ? 'Not found' : 'Error'} | {BRAND.name}</title>
	<meta name="description" content={heading} />
</svelte:head>

<main class="bg-background flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
	<div class="glass-panel w-full max-w-md rounded-2xl p-8 text-center shadow-2xl">
		<p
			class="text-primary/30 xs:text-6xl text-5xl font-black tracking-tight tabular-nums select-none"
			aria-hidden="true"
		>
			{status}
		</p>
		<h1 class="text-foreground xs:text-2xl mt-3 text-xl font-semibold tracking-tight">
			{heading}
		</h1>
		<p class="text-muted-foreground mt-3 text-sm leading-relaxed text-pretty">
			{message}
		</p>
	</div>

	<div
		class="xs:flex-row flex w-full max-w-5xl flex-col flex-wrap items-center justify-center gap-4"
	>
		<SvaKoshButton variant="primary" label="Go home" shine onclick={goHome}>
			{#snippet icon()}
				<svg
					class="size-full"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
					<polyline points="9 22 9 12 15 12 15 22" />
				</svg>
			{/snippet}
		</SvaKoshButton>
		<SvaKoshButton variant="secondary" label="Refresh" disabled={refreshing} onclick={refresh}>
			{#snippet icon()}
				<svg
					class={cn('size-full', refreshing && 'animate-spin')}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
					<path d="M3 3v5h5" />
					<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
					<path d="M16 16h5v5" />
				</svg>
			{/snippet}
		</SvaKoshButton>
	</div>
</main>
