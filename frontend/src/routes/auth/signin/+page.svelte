<script lang="ts">
	import { BRAND } from '$lib/brand';
	import { APP_FEATURES } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SvaKoshLogo from '../_components/SvaKoshLogo.svelte';
	import IllustrationPanel from '../_components/IllustrationPanel.svelte';
	import OAuthButtons from '../_components/OAuthButtons.svelte';
	import FeaturesBar from '../_components/FeaturesBar.svelte';
	import IdentifierForm from '../_components/IdentifierForm.svelte';
	import OtpVerifyForm from '../_components/OtpVerifyForm.svelte';
	import bullImage from '../_assets/bull.png';

	let { form, data } = $props();

	const otpSent = $derived(Boolean(form?.sent));
	const formIdentifier = $derived(String(form?.identifier ?? ''));
	const redirectTo = $derived(String(form?.redirect ?? data?.redirect ?? ''));
	const isEmail = $derived(formIdentifier.includes('@'));

	function changeIdentifier() {
		goto(page.url.pathname + page.url.search, { invalidateAll: true });
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
			features={APP_FEATURES}
			class="h-[36vh] w-full rounded-b-3xl lg:h-full lg:rounded-b-none"
		/>

		<div class="flex w-full items-top justify-center p-4 lg:h-full lg:items-center lg:pb-40 pb-28">
			<div class="w-full max-w-[26rem]">
				<div class="flex flex-col">
					{#if !otpSent}
						<SvaKoshLogo class="self-start" />
						<div class="mt-8 hidden lg:block">
							<h1 class="text-2xl font-semibold leading-tight text-foreground">
								Welcome back <span aria-hidden="true">👋</span>
							</h1>
							<p class="mt-1.5 text-sm text-muted-foreground">
								Sign in or create your account
							</p>
						</div>
						<IdentifierForm
							action="?/sendOtp"
							label="Email or mobile number"
							placeholder="you@example.com or 9876543210"
							iconType="mail"
							inputId="signin-identifier"
							ctaLabel="Continue"
							{redirectTo}
							message={form?.message}
						/>

						<div class="my-5 flex items-center gap-3">
							<span class="h-px flex-1 bg-border-subtle"></span>
							<span class="text-xs text-muted-foreground">or continue with</span>
							<span class="h-px flex-1 bg-border-subtle"></span>
						</div>

						<OAuthButtons />
					{:else}
						<OtpVerifyForm
							verifyAction="?/verifyOtp"
							resendAction="?/sendOtp"
							identifier={formIdentifier}
							{redirectTo}
							ctaLabel="Verify & sign in"
							changeLabel={isEmail ? 'Use different email' : 'Use different mobile'}
							message={form?.message}
							error={form?.error}
							onChange={changeIdentifier}
						/>
					{/if}

					
				</div>
			</div>
		</div>
	</div>
	<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pb-10 pt-24 lg:block [&>*]:pointer-events-auto">
		<FeaturesBar />
	</div>
</main>
