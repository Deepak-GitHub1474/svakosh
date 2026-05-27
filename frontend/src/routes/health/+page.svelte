<script lang="ts">
	import { resolve } from '$app/paths';
	import { BRAND } from '$lib/brand';
	import Pulse from '$src/lib/components/Pulse.svelte';
	import Background from '$src/lib/components/Background.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const pulseWhen = $derived(
		new Intl.DateTimeFormat(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit'
		}).format(new Date(data.lastPulseAt))
	);
</script>

<svelte:head>
	<title>Heartbeat · {BRAND.name}</title>
	<meta name="description" content="Svakosh frontend availability check." />
</svelte:head>

<main
	class="bg-background relative min-h-dvh overflow-hidden px-4 py-10 sm:px-6 sm:py-14"
>
	<Background />

	<div class="relative mx-auto flex max-w-2xl flex-col gap-8">
		<header class="text-center">
			<h1 class="text-foreground mt-2 text-2xl font-semibold tracking-tight">
				Frontend Heartbeat
			</h1>
			<p class="text-muted-foreground mt-2">
				Frontend connectivity status <span class="text-primary-muted font-mono">/health</span>
			</p>
		</header>

		<section class="glass-panel rounded-2xl border border-surface-border p-4 shadow-2xl">
			<div class="flex items-start gap-2">
				<div class="flex items-start gap-5">
					<div class="mt-5">
						<Pulse />
					</div>
					<div>
						<p class="text-muted-foreground  tracking-widest uppercase">Status</p>
						<p
							class="text-bullish mt-1 text-base font-semibold leading-snug tracking-tight sm:text-lg"
						>
							Frontend is up and running.
						</p>
						<p class="text-muted-foreground mt-2 leading-relaxed text-sm">
							Use this endpoint to confirm the UI shell and routing respond. For API reachability, open
							<a
								href={resolve('/server-connection')}
								data-sveltekit-preload-data="off"
								class="text-primary font-medium underline-offset-2 hover:underline"
							>
								Backend Connection</a
							>.
						</p>
					</div>
				</div>
			</div>

			<div class="border-surface-border bg-terminal-silver-bg mt-8 rounded-xl border p-4">
				<p class="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.2em] uppercase">
					Last pulse
				</p>
				<p class="text-primary-muted mt-2 font-mono text-sm tracking-tight">{pulseWhen}</p>
			</div>
		</section>

		<nav class="text-muted-foreground flex flex-wrap justify-center gap-4 text-center">
			<a href={resolve('/')} class="text-primary hover:underline transition-colors">{BRAND.name} home</a>
			<span aria-hidden="true">·</span>
			<a
				href={resolve('/server-connection')}
				data-sveltekit-preload-data="off"
				class="hover:text-foreground transition-colors"
			>
				Backend Connection</a
			>
		</nav>
	</div>
</main>
