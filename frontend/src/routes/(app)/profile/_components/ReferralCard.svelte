<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import CopyField from '$lib/components/trade/CopyField.svelte';
	import { REFERRAL_PATH } from '$lib/billing/const';
	import { rupees, shortDate } from '$lib/billing/helper';
	import { applyReferral } from '$lib/billing/service';
	import type { TReferral } from '$lib/billing/types';

	let { initial }: { initial: TReferral } = $props();

	let referral = $state(untrack(() => initial));
	let code = $state(page.url.searchParams.get('ref')?.toUpperCase() ?? '');
	let applying = $state(false);
	let message = $state<{ ok: boolean; text: string } | null>(null);

	const link = $derived(
		referral.code ? `${page.url.origin}${REFERRAL_PATH}?ref=${referral.code}` : ''
	);

	async function apply(event: SubmitEvent) {
		event.preventDefault();
		if (!code.trim() || applying) return;
		applying = true;
		const res = await applyReferral(code.trim().toUpperCase());
		applying = false;
		if (!res.ok) {
			message = { ok: false, text: res.error };
			return;
		}
		referral = res.data;
		message = {
			ok: true,
			text: `Applied. You get ${res.data.discount_percent}% off your first purchase.`
		};
	}
</script>

<SvaKoshCard class="p-5 sm:p-6">
	<h2 class="text-muted-foreground mb-5 flex items-center gap-2 text-sm tracking-wider uppercase">
		<span class="bg-primary h-4 w-1 rounded-full"></span>
		Referral
	</h2>
	<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
		<div class="flex flex-col gap-3">
			{#if referral.code}
				<CopyField label="Your referral link" value={link} />
				<p class="text-muted-foreground text-xs">
					Friends get {referral.discount_percent}% off their first purchase, and you earn {referral.reward_percent}%
					of what they pay. Used {referral.used_count} of {referral.max_uses}.
				</p>
				<dl class="grid grid-cols-3 gap-2 text-center tabular-nums">
					<div class="glass-panel rounded-xl px-2 py-2.5">
						<dt class="text-muted-foreground text-xs">Referrals</dt>
						<dd class="text-foreground mt-0.5 text-sm">{referral.referrals}</dd>
					</div>
					<div class="glass-panel rounded-xl px-2 py-2.5">
						<dt class="text-muted-foreground text-xs">Pending</dt>
						<dd class="text-primary mt-0.5 text-sm">{rupees(referral.pending_paise)}</dd>
					</div>
					<div class="glass-panel rounded-xl px-2 py-2.5">
						<dt class="text-muted-foreground text-xs">Paid</dt>
						<dd class="text-bullish mt-0.5 text-sm">{rupees(referral.paid_paise)}</dd>
					</div>
				</dl>
			{/if}
		</div>

		<div>
			{#if referral.referred_by}
				<SvaKoshLabel>Referred by</SvaKoshLabel>
				<SvaKoshInput value={referral.referred_by} disabled />
			{:else if referral.can_apply}
				<SvaKoshLabel for="referral_code">Have a referral code?</SvaKoshLabel>
				<form class="flex gap-2" onsubmit={apply}>
					<SvaKoshInput
						id="referral_code"
						bind:value={code}
						placeholder="Enter referral code"
						maxlength={32}
						class="uppercase"
					/>
					<SvaKoshButton
						type="submit"
						variant="solid"
						label={applying ? 'Applying…' : 'Apply'}
						class="border-transparent"
						disabled={!code.trim() || applying}
					/>
				</form>
				<p class="text-muted-foreground mt-1.5 ml-1 text-xs">
					You can apply a code until {shortDate(referral.apply_until)}.
				</p>
			{:else}
				<SvaKoshLabel>Referral code</SvaKoshLabel>
				<p class="text-muted-foreground text-sm">
					Referral codes could be applied until {shortDate(referral.apply_until)}. This window has
					ended.
				</p>
			{/if}
			{#if message}
				<p class="mt-1.5 ml-1 text-xs {message.ok ? 'text-bullish' : 'text-bearish'}">
					{message.text}
				</p>
			{/if}
		</div>
	</div>
</SvaKoshCard>
