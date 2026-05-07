<script lang="ts">
	import { BRAND } from '$lib/brand';
	import SvaKoshLogo from '../_components/SvaKoshLogo.svelte';
	import IllustrationPanel from '../_components/IllustrationPanel.svelte';
	import AuthInput from '../_components/AuthInput.svelte';
	import OAuthButtons from '../_components/OAuthButtons.svelte';
	import FeaturesBar from '../_components/FeaturesBar.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import bullImage from '../_assets/bull.png';

	let email = $state('');
	let password = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
	}
</script>

<svelte:head>
	<title>Sign in | {BRAND.name}</title>
</svelte:head>

<main class="relative min-h-dvh bg-[#101216] text-foreground">
	<div class="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
		<IllustrationPanel
			image={bullImage}
			alt="Golden bull on a rocky outcrop with candlestick chart in the background"
			caption="Momentum Rise"
			index={1}
			class="h-[32vh] w-full rounded-b-3xl lg:h-full lg:rounded-b-none"
		/>

		<div class="flex w-full items-center justify-center p-4 lg:h-full lg:pb-32">
			<div class="w-full max-w-[26rem]">
				<div class="flex flex-col">
					<SvaKoshLogo class="self-start" />
					<div class="mt-8 hidden lg:block">
						<h1 class="text-2xl font-semibold leading-tight text-foreground">
						Welcome back <span aria-hidden="true">👋</span>
						</h1>
						<p class="mt-1.5 text-sm text-muted-foreground">
							Sign in to continue to your account
						</p>
					</div>

					<form class="mt-8 space-y-4" onsubmit={handleSubmit}>
						<div>
							<label
								for="signin-email"
								class="mb-1.5 block text-sm font-medium tracking-wide text-muted-foreground"
							>
								Email address
							</label>
							<AuthInput
								id="signin-email"
								type="email"
								bind:value={email}
								placeholder="you@example.com"
								icon="mail"
								autocomplete="email"
								required
							/>
						</div>

						<div>
							<label
								for="signin-password"
								class="mb-1.5 block text-sm font-medium tracking-wide text-muted-foreground"
							>
								Password
							</label>
							<AuthInput
								id="signin-password"
								type="password"
								bind:value={password}
								placeholder="••••••••••"
								icon="lock"
								autocomplete="current-password"
								required
							/>
							<div class="mt-2 flex justify-end">
								<a
									href="/auth/forgot-password"
									class="text-[0.78rem] font-medium text-primary hover:underline"
								>
									Forgot password?
								</a>
							</div>
						</div>

						<SvaKoshButton
							type="submit"
							variant="primary"
							label="Continue"
							class="w-full py-3.5 text-sm font-medium [--terminal-bg:var(--primary)] [--terminal-border:var(--primary)] [--terminal-bg-hover:#e6c54a] [--terminal-border-hover:#e6c54a] [--terminal-fg:#08090a]"
						>
							{#snippet icon()}
								<span class="material-symbols-outlined icon-size">arrow_forward</span>
							{/snippet}
						</SvaKoshButton>
					</form>

					<div class="my-5 flex items-center gap-3">
						<span class="h-px flex-1 bg-[rgba(255,255,255,0.06)]"></span>
						<span class="text-xs text-muted-foreground">or continue with</span>
						<span class="h-px flex-1 bg-[rgba(255,255,255,0.06)]"></span>
					</div>

					<OAuthButtons />

					<p class="mt-6 text-center text-[0.82rem] text-muted-foreground">
						Don't have an account?
						<a href="/auth/signup" class="font-medium text-primary hover:underline">Sign up</a>
					</p>
				</div>
			</div>
		</div>
	</div>
	<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pb-8 pt-24 lg:block [&>*]:pointer-events-auto">
		<FeaturesBar />
	</div>
</main>
