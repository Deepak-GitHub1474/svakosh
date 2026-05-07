<script lang="ts">
	import { BRAND } from '$lib/brand';
	import AuricLogo from '../_components/AuricLogo.svelte';
	import IllustrationPanel from '../_components/IllustrationPanel.svelte';
	import AuthInput from '../_components/AuthInput.svelte';
	import OAuthButtons from '../_components/OAuthButtons.svelte';
	import FeaturesBar from '../_components/FeaturesBar.svelte';
	import AuthCard from '../_components/AuthCard.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirm = $state('');
	let agreed = $state(false);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
	}
</script>

<svelte:head>
	<title>Create account | {BRAND.name}</title>
</svelte:head>

<main class="min-h-dvh bg-background text-foreground">
	<div class="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
		<AuthCard>
			{#snippet illustration()}
				<IllustrationPanel
					image="/auth/market-mindset.jpg"
					alt="Trader silhouette overlooking a city skyline with chart overlays"
					caption="Market Mindset"
					index={3}
					class="lg:rounded-r-none lg:min-h-full"
				/>
			{/snippet}

			{#snippet form()}
				<div class="flex flex-col">
					<AuricLogo class="self-end" />

					<h1 class="mt-8 text-[1.6rem] font-semibold leading-tight text-foreground">
						Create <span class="text-primary italic">your</span> account
					</h1>
					<p class="mt-1.5 text-[0.85rem] text-muted-foreground">
						Join Auric and start your trading journey
					</p>

					<form class="mt-7 space-y-4" onsubmit={handleSubmit}>
						<div>
							<label
								for="signup-name"
								class="mb-1.5 block text-[0.72rem] font-medium tracking-wide text-muted-foreground"
							>
								Full name
							</label>
							<AuthInput
								id="signup-name"
								type="text"
								bind:value={name}
								placeholder="John Doe"
								icon="user"
								autocomplete="name"
								required
							/>
						</div>

						<div>
							<label
								for="signup-email"
								class="mb-1.5 block text-[0.72rem] font-medium tracking-wide text-muted-foreground"
							>
								Email address
							</label>
							<AuthInput
								id="signup-email"
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
								for="signup-password"
								class="mb-1.5 block text-[0.72rem] font-medium tracking-wide text-muted-foreground"
							>
								Password
							</label>
							<AuthInput
								id="signup-password"
								type="password"
								bind:value={password}
								placeholder="••••••••••"
								icon="lock"
								autocomplete="new-password"
								required
							/>
						</div>

						<div>
							<label
								for="signup-confirm"
								class="mb-1.5 block text-[0.72rem] font-medium tracking-wide text-muted-foreground"
							>
								Confirm password
							</label>
							<AuthInput
								id="signup-confirm"
								type="password"
								bind:value={confirm}
								placeholder="••••••••••"
								icon="lock"
								autocomplete="new-password"
								required
							/>
						</div>

						<label class="flex items-start gap-2.5 pt-1 select-none">
							<input
								type="checkbox"
								bind:checked={agreed}
								class="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--primary)]"
								required
							/>
							<span class="text-[0.78rem] leading-snug text-muted-foreground">
								I agree to the
								<a href="/legal/terms" class="text-primary hover:underline">Terms of Service</a>
								and
								<a href="/legal/privacy" class="text-primary hover:underline">Privacy Policy</a>
							</span>
						</label>

						<SvaKoshButton
							type="submit"
							variant="primary"
							label="Create account"
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
						Already have an account?
						<a href="/auth/signin" class="font-medium text-primary hover:underline">Sign in</a>
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
