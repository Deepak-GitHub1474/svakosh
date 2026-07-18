<script lang="ts">
	import { enhance } from '$app/forms';
	import { cn, safeSubmit } from '$lib/utils';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import OtpFeedback from './OtpFeedback.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import type { TOtpVerifyingForm } from '../_lib/types';

	const RESEND_SECONDS = 30;
	const OTP_LENGTH = 6;

	let {
		verifyAction,
		resendAction,
		identifier,
		redirectTo,
		ctaLabel,
		changeLabel,
		message,
		error,
		onChange
	}: TOtpVerifyingForm = $props();

	let otp = $state('');
	let submitting = $state(false);
	let resending = $state(false);
	let secondsLeft = $state(0);
	let resendKey = $state(0);
	
	const canResend = $derived(secondsLeft <= 0);
	const isValidOtp = $derived(/^\d{6}$/.test(otp));

	$effect(() => {
		const cleaned = otp.replace(/\D/g, '').slice(0, OTP_LENGTH);
		if (cleaned !== otp) otp = cleaned;
	});

	$effect(() => {
		resendKey;
		secondsLeft = RESEND_SECONDS;
		const id = setInterval(() => {
			secondsLeft -= 1;
			if (secondsLeft <= 0) clearInterval(id);
		}, 1000);
		return () => clearInterval(id);
	});
</script>

<form
	class="space-y-4"
	method="POST"
	action={verifyAction}
	use:enhance={safeSubmit((b) => (submitting = b))}
>
	<div>
		<label for="otp-input" class="mb-1.5 block text-sm tracking-wide text-muted-foreground">
			Enter 6-digit OTP sent to {identifier}
		</label>
		<div class={cn('relative w-full')}>
			<span
				class="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/70"
				aria-hidden="true"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
					<rect x="4" y="11" width="16" height="10" rx="2" />
					<path d="M8 11V8a4 4 0 0 1 8 0v3" />
				</svg>
			</span>

			<SvaKoshInput
				id="otp-input"
				type="text"
				placeholder="123456"
				autofocus
				autocomplete="one-time-code"
				inputmode="numeric"
				pattern={`[0-9]{${OTP_LENGTH}}`}
				title="Enter the 6-digit code"
				maxlength={OTP_LENGTH}
				required
				bind:value={otp}
				class="py-[13.5px] pl-10"
			/>
		</div>
	</div>

	{#if message || error}
		<OtpFeedback {message} {error} />
	{/if}

	<input type="hidden" name="identifier" value={identifier} />
	<input type="hidden" name="otp" value={otp} />
	<input type="hidden" name="redirect" value={redirectTo} />

	<SvaKoshButton
		type="submit"
		variant="solid"
		disabled={submitting || !isValidOtp}
		label={submitting ? 'Verifying…' : ctaLabel}
		class="w-full py-3.5 text-sm"
	>
		{#snippet icon()}
			<span class="material-symbols-outlined icon-size">arrow_forward</span>
		{/snippet}
	</SvaKoshButton>
</form>

<div class="mt-5 flex items-center justify-between text-sm text-muted-foreground">
	<button type="button" onclick={onChange} class="hover:text-primary transition-colors">
		{changeLabel}
	</button>

	{#if canResend}
		<form
			method="POST"
			action={resendAction}
			use:enhance={safeSubmit(
				(b) => (resending = b),
				() => resendKey++
			)}
			class="inline"
		>
			<input type="hidden" name="identifier" value={identifier} />
			<input type="hidden" name="redirect" value={redirectTo} />
			<button
				type="submit"
				disabled={resending}
				class="hover:text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				{resending ? 'Resending…' : 'Resend OTP'}
			</button>
		</form>
	{:else}
		<span>Resend in {secondsLeft}s</span>
	{/if}
</div>
