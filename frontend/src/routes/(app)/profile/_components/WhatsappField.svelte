<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { apiCall } from '$lib/api';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';

	let { initial = '' }: { initial?: string } = $props();

	const RESEND_SECONDS = 30;

	let current = $state(untrack(() => initial));
	let number = $state(untrack(() => initial));
	let otp = $state('');
	let modalOpen = $state(false);
	let busy = $state(false);
	let msg = $state('');
	let err = $state(false);
	let cooldown = $state(0);
	let cooldownId: ReturnType<typeof setInterval> | undefined;

	const canSend = $derived(number.length === 10 && number !== current);

	function startCooldown() {
		cooldown = RESEND_SECONDS;
		clearInterval(cooldownId);
		cooldownId = setInterval(() => {
			cooldown -= 1;
			if (cooldown <= 0) {
				cooldown = 0;
				clearInterval(cooldownId);
			}
		}, 1000);
	}

	onDestroy(() => clearInterval(cooldownId));

	async function sendOtp() {
		busy = true;
		msg = '';
		err = false;
		const res = await apiCall('/api/profile/whatsapp/send-otp', 'POST', { whatsapp_number: number });
		busy = false;
		if (!res.ok) {
			err = true;
			msg = res.error;
			return;
		}
		otp = '';
		msg = '';
		modalOpen = true;
		startCooldown();
	}

	async function verify() {
		busy = true;
		msg = '';
		err = false;
		const res = await apiCall('/api/profile/whatsapp/verify', 'POST', {
			whatsapp_number: number,
			otp
		});
		if (!res.ok) {
			busy = false;
			err = true;
			msg = res.error;
			return;
		}
		current = number;
		modalOpen = false;
		otp = '';
		msg = 'WhatsApp number verified.';
		await invalidateAll();
		busy = false;
	}
</script>

<SvaKoshLabel for="whatsapp_number">WhatsApp Number</SvaKoshLabel>
<div class="flex items-end gap-2">
	<div class="flex-1">
		<SvaKoshInput id="whatsapp_number" bind:value={number} placeholder="9876543210" maxlength={10} />
	</div>
	{#if canSend}
		<SvaKoshButton
			variant="solid"
			type="button"
			label={cooldown > 0 ? `${cooldown}s` : busy ? '...' : 'Send OTP'}
			disabled={busy || cooldown > 0}
			onclick={sendOtp}
			class="shrink-0"
		/>
	{/if}
</div>
{#if msg && !modalOpen}
	<p class="mt-1 ml-1 text-[0.7rem] {err ? 'text-bearish' : 'text-bullish'}">{msg}</p>
{/if}

<SvaKoshModal
	bind:isOpen={modalOpen}
	title="Verify WhatsApp Number"
	width="24rem"
	showClose
	onClose={() => {
		otp = '';
		msg = '';
		err = false;
	}}
>
	<div class="flex flex-col gap-4 p-5">
		<p class="text-muted-foreground text-sm">
			Enter the 6-digit OTP sent to <span class="text-foreground">{number}</span>.
		</p>
		<SvaKoshInput bind:value={otp} placeholder="6-digit OTP" maxlength={6} />
		<SvaKoshButton
			variant="solid"
			type="button"
			label={busy ? 'Verifying...' : 'Verify'}
			disabled={busy || otp.length !== 6}
			onclick={verify}
			class="w-full"
		/>
		{#if msg}
			<p class="text-[0.75rem] {err ? 'text-bearish' : 'text-bullish'}">{msg}</p>
		{/if}
		<div class="flex items-center justify-between text-xs">
			<span class="text-muted-foreground">Didn't get the code?</span>
			{#if cooldown > 0}
				<span class="text-muted-foreground">Resend in {cooldown}s</span>
			{:else}
				<button
					type="button"
					onclick={sendOtp}
					disabled={busy}
					class="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
				>
					Resend OTP
				</button>
			{/if}
		</div>
	</div>
</SvaKoshModal>
