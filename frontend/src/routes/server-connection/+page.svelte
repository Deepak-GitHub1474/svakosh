<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { BRAND } from '$lib/brand';
	import Pulse from '$lib/components/svakosh/Pulse.svelte';
	import Background from '$lib/components/svakosh/Background.svelte';
	import { getServerConnectionView } from './_lib/api';
	import type { THealthResponse } from './_lib/types';

	let healthInfo = $state<THealthResponse | null>(null);
	let requestError = $state<string | null>(null);
	const connected = $derived(healthInfo?.success);
	const healthData = $derived(
		healthInfo?.data && typeof healthInfo.data === 'object'
			? (healthInfo.data as Record<string, unknown>)
			: null
	);

	onMount(async () => {
		try {
			healthInfo = await getServerConnectionView();
			requestError = null;
		} catch (e) {
			requestError = e instanceof Error ? e.message : String(e);
		}
	});
</script>

<svelte:head>
	<title>API link · {BRAND.name}</title>
	<meta name="description" content="Backend Connection status for Svakosh." />
</svelte:head>

<main
	class="bg-background relative min-h-dvh overflow-hidden px-4 py-10 sm:px-6 sm:py-14"
>
	<Background />

	<div class="relative mx-auto flex max-w-2xl flex-col gap-8">
		<header class="text-center">
			<h1 class="text-foreground mt-2 text-2xl font-semibold tracking-tight">
				Backend Connection
			</h1>
			<p class="text-muted-foreground mt-2">
				Backend connectivity check <span class="text-primary-muted font-mono">/health</span>
			</p>
		</header>

		<section class="glass-panel rounded-2xl border border-surface-border p-4 shadow-2xl">
			<div class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-5">
				<div class="flex items-center gap-5">
					<Pulse active={connected} colorClass={connected ? 'bg-bullish' : 'bg-bearish'} />
					<div>
						<p class="text-muted-foreground  tracking-widest uppercase">Session</p>
						<p
							class="font-mono font-bold tracking-wide {connected ? 'text-bullish' : 'text-bearish'}"
						>
							{connected ? 'CONNECTED' : 'DISCONNECTED'}
						</p>	
					</div>
				</div>
				<div
					class="border-surface-elevated bg-surface-elevated rounded-lg border p-4 font-mono text-xs text-muted-foreground break-all sm:max-w-[60%]"
					title="Configured API base URL"
				>
					{healthInfo?.backendUrl ?? 'Resolving...'}
				</div>
			</div>

			{#if healthInfo === null && requestError === null}
				<div class="mt-6 rounded-xl border border-primary-muted bg-glass p-4 text-primary-muted">
					Checking backend connection...
				</div>
			{:else if requestError != null}
				<div
					class="border-bearish-muted bg-bearish-subtle mt-6 rounded-xl border p-4 text-bearish"
				>
					<p class="font-semibold">Unreachable</p>
					<p class="text-foreground mt-1 font-mono">{requestError}</p>
				</div>
			{:else if healthInfo?.success && healthData}
				<div class="mt-6 space-y-6">
					<div
						class="border-bullish-muted bg-bullish-subtle rounded-xl border p-4 text-bullish"
					>
						<span class="font-semibold">Status:</span>
						{healthInfo.message}
					</div>
					<dl class="grid gap-3 sm:grid-cols-2">
						<div
							class="border-surface-border bg-terminal-silver-bg rounded-lg border p-4"
						>
							<dt class="text-muted-foreground text-[0.65rem] tracking-wider uppercase">
								Service
							</dt>
							<dd class="text-foreground mt-0.5 font-mono">{healthData?.service}</dd>
						</div>
						<div
							class="border-surface-border bg-terminal-silver-bg rounded-lg border p-4"
						>
							<dt class="text-muted-foreground text-[0.65rem] tracking-wider uppercase">
								Version
							</dt>
							<dd class="text-foreground mt-0.5 font-mono">{healthData?.version}</dd>
						</div>
						<div
							class="border-surface-border bg-terminal-silver-bg sm:col-span-2 rounded-lg border p-4"
						>
							<dt class="text-muted-foreground text-[0.65rem] tracking-wider uppercase">
								Environment
							</dt>
							<dd class="text-foreground mt-0.5 font-mono">{healthData?.env}</dd>
						</div>
					</dl>
				</div>
			{:else}
				<div class="mt-6 space-y-4">
					<div
						class="border-bearish-muted bg-bearish-subtle rounded-xl border p-4 text-bearish"
					>
						<p class="font-semibold">Request failed</p>
						<p class="text-foreground mt-1">{healthInfo?.message}</p>
					</div>
					<details class="border-surface-border rounded-xl border">
						<summary
							class="text-muted-foreground hover:text-foreground cursor-pointer p-4 font-semibold tracking-wider uppercase"
						>
							Technical detail
						</summary>
						<pre
							class="text-muted-foreground border-t border-surface-border max-h-48 overflow-auto p-4 font-mono text-[0.65rem] whitespace-pre-wrap"
						>{JSON.stringify({ data: healthInfo?.data }, null, 2)}</pre>
					</details>
				</div>
			{/if}
		</section>

		<nav class="text-muted-foreground flex flex-wrap justify-center gap-4 text-center">
			<a href={resolve('/')} class="text-primary hover:underline transition-colors">{BRAND.name} home</a>
			<span aria-hidden="true">·</span>
			<a href={resolve('/health')} class="hover:text-foreground transition-colors">Frontend Heartbeat</a>
		</nav>
	</div>
</main>
