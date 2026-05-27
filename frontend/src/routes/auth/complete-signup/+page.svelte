<script lang="ts">
	import { BRAND } from '$lib/brand';
	import { APP_FEATURES } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SvaKoshLogo from '../_components/SvaKoshLogo.svelte';
	import IllustrationPanel from '../_components/IllustrationPanel.svelte';
	import FeaturesBar from '../_components/FeaturesBar.svelte';
	import IdentifierForm from '../_components/IdentifierForm.svelte';
	import OtpVerifyForm from '../_components/OtpVerifyForm.svelte';
	import bull from '../_assets/bull.png';
	import globe from '../_assets/globe.png';
	import man from '../_assets/man.png';

	let { data, form } = $props();

	const otpSent = $derived(Boolean(form?.sent));
	const formIdentifier = $derived(String(form?.identifier ?? ''));
	const pendingChannel = $derived(data?.pendingChannel ?? 'email');
	const channelLabel = $derived(pendingChannel === 'email' ? 'Email' : 'Mobile number');
	const placeholder = $derived(pendingChannel === 'email' ? 'you@example.com' : '9876543210');
	const redirectTo = $derived(String(form?.redirect ?? data?.redirect ?? ''));
	const illustrations = [
		{ src: bull, alt: 'Bull' },
		{ src: globe, alt: 'Globe' },
		{ src: man, alt: 'Trader' }
	]

	function changeIdentifier() {
		goto(page.url.pathname + page.url.search, { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>Verify your {pendingChannel} | {BRAND.name}</title>
</svelte:head>

<main class="relative min-h-dvh bg-[#101216] text-foreground">
	<div class="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
		<IllustrationPanel
			images={illustrations}
			features={APP_FEATURES}
			class="h-[32vh] w-full rounded-b-3xl lg:h-full lg:rounded-b-none"
		/>

		<div class="flex w-full items-start justify-center p-4 lg:h-full lg:items-center lg:pb-32">
			<div class="w-full max-w-[26rem]">
				<div class="flex flex-col">
					<SvaKoshLogo class="self-start" />
					<div class="mt-8 hidden lg:block">
						<h1 class="text-2xl font-semibold leading-tight text-foreground">
							One more step <span aria-hidden="true">🔐</span>
						</h1>
						<p class="mt-1.5 text-sm text-muted-foreground">
							Verify your {pendingChannel} to finish setting up your account.
						</p>
					</div>

					{#if !otpSent}
						<IdentifierForm
							action="?/sendOtp"
							label={channelLabel}
							{placeholder}
							iconType={pendingChannel === 'email' ? 'mail' : 'user'}
							inputId="add-identifier"
							ctaLabel="Send OTP"
							{redirectTo}
							message={form?.message}
						/>
					{:else}
						<OtpVerifyForm
							verifyAction="?/verifyOtp"
							resendAction="?/sendOtp"
							identifier={formIdentifier}
							{redirectTo}
							ctaLabel="Verify & finish"
							changeLabel={`Use different ${pendingChannel}`}
							message={form?.message}
							error={form?.error}
							onChange={changeIdentifier}
						/>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden bg-gradient-to-t from-black/85 via-black/55 to-transparent px-4 pb-8 pt-24 lg:block [&>*]:pointer-events-auto">
		<FeaturesBar />
	</div>
</main>
