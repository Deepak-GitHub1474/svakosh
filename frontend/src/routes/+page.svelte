<script lang="ts">
	import { BRAND } from '$lib/brand';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
</script>

<svelte:head>
	<title>{BRAND.name} | {BRAND.tagline}</title>
</svelte:head>

<div class="min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
	<header class="h-16 border-b border-border-subtle flex items-center justify-between px-6 lg:px-12 max-w-7xl w-full mx-auto">
		<div class="flex items-center gap-2">
			<span class="text-xl font-bold tracking-tighter text-primary uppercase select-none">
				{BRAND.name}
			</span>
		</div>
		<div class="flex items-center gap-4">
			<a href="/auth/signin">
				<SvaKoshButton variant="secondary" label="Sign In" class="text-sm px-4 py-1.5" />
			</a>
			<a href="/auth/signin">
				<SvaKoshButton variant="primary" shine label="Get Started" class="text-sm px-5 py-1.5" />
			</a>
		</div>
	</header>

	<main class="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-5xl mx-auto">
		<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
			</span>
			{BRAND.tagline}
		</div>

		<h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15]">
			Master the Markets with <span class="bg-gradient-to-r from-primary via-primary-hover to-bullish bg-clip-text text-transparent">{BRAND.name}</span>
		</h1>

		<p class="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
			Real-time options analytics, Open Interest tracking, and advanced market insights engineered for modern traders.
		</p>

		<div class="mt-10 flex flex-col sm:flex-row items-center gap-4">
			<a href="/auth/signin">
				<SvaKoshButton variant="primary" shine label="Launch Platform" class="px-8 py-3 text-base font-semibold" />
			</a>
		</div>

		<div class="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full max-w-4xl">
			<div class="p-6 rounded-xl border border-border-subtle bg-white/[0.01] backdrop-blur-sm">
				<div class="text-primary font-semibold text-lg mb-2">OI Analytics</div>
				<p class="text-sm text-muted-foreground">Comprehensive Open Interest tracking, buildup analysis, and straddle monitoring in real time.</p>
			</div>
			<div class="p-6 rounded-xl border border-border-subtle bg-white/[0.01] backdrop-blur-sm">
				<div class="text-primary font-semibold text-lg mb-2">Market Pulse</div>
				<p class="text-sm text-muted-foreground">Instant sentiment shifts, 52-week breakout screeners, and volume anomaly detection.</p>
			</div>
			<div class="p-6 rounded-xl border border-border-subtle bg-white/[0.01] backdrop-blur-sm">
				<div class="text-primary font-semibold text-lg mb-2">Passwordless Auth</div>
				<p class="text-sm text-muted-foreground">Seamless and secure authentication via Passkeys, WebAuthn, Google OAuth, and OTP.</p>
			</div>
		</div>
	</main>

	<footer class="border-t border-border-subtle py-8 text-center text-xs text-muted-foreground">
		<p>{BRAND.name} &middot; {BRAND.tagline}</p>
	</footer>
</div>
