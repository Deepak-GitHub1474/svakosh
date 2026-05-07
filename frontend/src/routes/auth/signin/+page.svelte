<script lang="ts">
	import { BRAND } from '$lib/brand';
	import AuricLogo from '../_components/AuricLogo.svelte';
	import IllustrationPanel from '../_components/IllustrationPanel.svelte';
	import AuthInput from '../_components/AuthInput.svelte';
	import OAuthButtons from '../_components/OAuthButtons.svelte';
	import FeaturesBar from '../_components/FeaturesBar.svelte';
	import AuthCard from '../_components/AuthCard.svelte';
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

<main class="min-h-dvh bg-background text-foreground">
	<div class="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
		<AuthCard>
			{#snippet illustration()}
				<IllustrationPanel
					image={bullImage}
					alt="Golden bull on a rocky outcrop with candlestick chart in the background"
					caption="Momentum Rise"
					index={1}
					class="lg:rounded-r-none lg:min-h-full"
				/>
			{/snippet}

			{#snippet form()}
				<div class="flex flex-col">
					<AuricLogo class="self-end" />

					<h1 class="mt-8 text-[1.6rem] font-semibold leading-tight text-foreground">
						Welcome back <span aria-hidden="true">👋</span>
					</h1>
					<p class="mt-1.5 text-[0.85rem] text-muted-foreground">
						Sign in to continue to your account
					</p>

					<form class="mt-7 space-y-4" onsubmit={handleSubmit}>
						<div>
							<label
								for="signin-email"
								class="mb-1.5 block text-[0.72rem] font-medium tracking-wide text-muted-foreground"
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
								class="mb-1.5 block text-[0.72rem] font-medium tracking-wide text-muted-foreground"
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
							class="auth-cta w-full [--terminal-bg:var(--primary)] [--terminal-border:var(--primary)] [--terminal-bg-hover:#e6c54a] [--terminal-border-hover:#e6c54a] [--terminal-fg:#08090a]"
						>
							{#snippet icon()}
								<span class="material-symbols-outlined icon-size">arrow_forward</span>
							{/snippet}
						</SvaKoshButton>
					</form>

					<div class="my-5 flex items-center gap-3">
						<span class="h-px flex-1 bg-[rgba(255,255,255,0.06)]"></span>
						<span class="text-[0.72rem] text-muted-foreground">or continue with</span>
						<span class="h-px flex-1 bg-[rgba(255,255,255,0.06)]"></span>
					</div>

					<OAuthButtons />

					<p class="mt-6 text-center text-[0.82rem] text-muted-foreground">
						Don't have an account?
						<a href="/auth/signup" class="font-medium text-primary hover:underline">Sign up</a>
					</p>
				</div>
			{/snippet}
		</AuthCard>

		<div class="mt-8">
			<FeaturesBar />
		</div>
	</div>
</main>

<style>
	:global(.auth-cta .btn-terminal__icon) {
		opacity: 0.9;
	}
</style>
