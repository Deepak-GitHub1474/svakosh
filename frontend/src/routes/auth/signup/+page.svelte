<script lang="ts">
	import { BRAND } from '$lib/brand';
	import SvaKoshLogo from '../_components/SvaKoshLogo.svelte';
	import IllustrationPanel from '../_components/IllustrationPanel.svelte';
	import AuthInput from '../_components/AuthInput.svelte';
	import OAuthButtons from '../_components/OAuthButtons.svelte';
	import FeaturesBar from '../_components/FeaturesBar.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import bullImage from '../_assets/bull.png';

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
							Create <span class="text-primary italic">your</span> account
						</h1>
						<p class="mt-1.5 text-sm text-muted-foreground">
							Join Auric and start your trading journey
						</p>
					</div>

					<form class="mt-8 space-y-4" onsubmit={handleSubmit}>
						<div>
							<label
								for="signup-name"
								class="mb-1.5 block text-sm font-medium tracking-wide text-muted-foreground"
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
								class="mb-1.5 block text-sm font-medium tracking-wide text-muted-foreground"
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
								class="mb-1.5 block text-sm font-medium tracking-wide text-muted-foreground"
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
								class="mb-1.5 block text-sm font-medium tracking-wide text-muted-foreground"
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
						Already have an account?
						<a href="/auth/signin" class="font-medium text-primary hover:underline">Sign in</a>
					</p>
				</div>
			</div>
		</div>
	</div>
	<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pb-8 pt-24 lg:block [&>*]:pointer-events-auto">
		<FeaturesBar />
	</div>
</main>
