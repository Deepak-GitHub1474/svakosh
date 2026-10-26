<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import { TENURE_LABELS, TENURE_UNITS } from '$lib/billing/const';
	import { rupees, shortDate } from '$lib/billing/helper';
	import type { TQuote } from '$lib/billing/types';

	let {
		quote,
		loading,
		error,
		couponText = $bindable(),
		applied,
		blocked,
		paying,
		notice,
		onApply,
		onPay
	}: {
		quote: TQuote | null;
		loading: boolean;
		error: string;
		couponText: string;
		applied: string;
		blocked: string;
		paying: boolean;
		notice: { tone: string; text: string } | null;
		onApply: () => void;
		onPay: () => void;
	} = $props();

	const free = $derived(quote?.price_paise === 0);
	const trial = $derived(!!quote?.trial);
	const couponNote = $derived.by(() => {
		if (!quote) return null;
		if (applied && quote.coupon_error) return { tone: 'text-bearish', text: quote.coupon_error };
		if (quote.coupon?.kind === 'referral')
			return { tone: 'text-bullish', text: 'Referral discount applied.' };
		if (quote.coupon) return { tone: 'text-bullish', text: `Coupon ${quote.coupon.code} applied.` };
		return null;
	});
</script>

<SvaKoshCard class="flex flex-col gap-5 p-5 sm:p-6">
	<h2 class="text-muted-foreground flex items-center gap-2 text-sm tracking-wider uppercase">
		<span class="bg-primary h-4 w-1 rounded-full"></span>
		Bill summary
	</h2>

	{#if !free && !trial}
		<div>
			<SvaKoshLabel for="coupon">Coupon code</SvaKoshLabel>
			<form
				class="flex gap-2"
				onsubmit={(e) => {
					e.preventDefault();
					onApply();
				}}
			>
				<SvaKoshInput
					id="coupon"
					bind:value={couponText}
					placeholder="Have a coupon?"
					maxlength={32}
					class="uppercase"
				/>
				<SvaKoshButton
					type="submit"
					variant="secondary"
					label="Apply"
					class="px-4"
					disabled={!couponText.trim() || loading}
				/>
			</form>
			{#if couponNote}
				<p class="mt-1.5 ml-1 text-xs {couponNote.tone}">{couponNote.text}</p>
			{/if}
		</div>
	{/if}

	{#if error}
		<p class="text-bearish text-sm">{error}</p>
	{:else if quote}
		<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm tabular-nums">
			<dt class="text-muted-foreground">{quote.plan.name} · {TENURE_LABELS[quote.tenure]}</dt>
			<dd class="text-foreground text-right">{free ? 'Free' : rupees(quote.price_paise)}</dd>
			{#if quote.discount_paise}
				<dt class="text-muted-foreground">
					{trial
						? 'First month free'
						: quote.coupon?.kind === 'referral'
							? 'Referral discount'
							: `Coupon ${quote.coupon?.code}`}
				</dt>
				<dd class="text-bullish text-right">−{rupees(quote.discount_paise)}</dd>
			{/if}
			<div class="col-span-2 my-1 h-[0.0625rem] bg-white/5"></div>
			<dt class="text-foreground font-medium">Pay now</dt>
			<dd class="text-foreground text-right text-lg font-medium">
				{free ? 'Free' : rupees(quote.payable_paise)}
			</dd>
		</dl>
		{#if trial}
			<p class="text-muted-foreground text-xs">
				You authorise autopay now. First charge of {rupees(quote.price_paise)} on {shortDate(
					quote.first_charge_at
				)}, then every {TENURE_UNITS[quote.tenure]}. Cancel before then and you won't be charged.
			</p>
		{:else if !free}
			<p class="text-muted-foreground text-xs">
				{quote.discount_paise
					? `Renews at ${rupees(quote.price_paise)} per ${TENURE_UNITS[quote.tenure]} with autopay. `
					: `Renews every ${TENURE_UNITS[quote.tenure]} with autopay. `}Cancel autopay anytime from
				Subscription.
			</p>
		{/if}
	{:else}
		<p class="text-muted-foreground text-sm">{loading ? 'Calculating…' : 'Choose a plan.'}</p>
	{/if}

	{#if notice}
		<p class="text-sm {notice.tone}">{notice.text}</p>
	{/if}

	{#if blocked}
		<p class="text-primary text-sm">{blocked}</p>
	{:else}
		<SvaKoshButton
			variant="solid"
			label={paying
				? 'Processing…'
				: free
					? 'Activate'
					: trial
						? 'Start free month'
						: notice
							? 'Try again'
							: `Pay ${quote ? rupees(quote.payable_paise) : ''}`}
			class="h-11 w-full justify-center text-sm font-semibold"
			disabled={!quote || !!error || loading || paying}
			onclick={onPay}
		/>
	{/if}
</SvaKoshCard>
