<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import Info from '$lib/components/svg-provider/Info.svelte';
	import CurrencyRupee from '$lib/components/svg-provider/material/CurrencyRupee.svelte';
	import { MODAL_BUTTON } from '$lib/trade/const';
	import { GST_PERCENT, SKELETON, TENURE_LABELS, TENURE_UNITS } from '$lib/billing/const';
	import { includedGst, rupees, shortDate } from '$lib/billing/helper';
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

	const NOTE =
		'border-border-subtle text-muted-foreground flex items-center gap-2 border-t border-dashed pt-4 text-sm';

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

<SvaKoshCard class="flex h-full flex-col" contentClass="flex flex-1 flex-col">
	<div class="flex flex-1 flex-col gap-6">
		<div class="flex items-center gap-3">
			<span class="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-lg">
				<CurrencyRupee class="text-2xl" />
			</span>
			<div class="min-w-0">
				<h2 class="text-muted-foreground text-sm tracking-wider uppercase">Bill summary</h2>
				<div class="mt-1 flex h-6 items-center gap-2 text-sm">
					{#if loading}
						<span class="{SKELETON} h-4 w-32 animate-pulse"></span>
					{:else if quote}
						<span class="text-foreground truncate">{quote.plan.name}</span>
						<span class="bg-primary-subtle text-primary shrink-0 rounded px-2 py-0.5 text-xs">
							{TENURE_LABELS[quote.tenure]}
						</span>
					{/if}
				</div>
			</div>
		</div>

		{#if quote && !free && !trial}
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
						class="border-transparent"
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
		{:else if loading}
			<div class="flex animate-pulse flex-col gap-2" aria-busy="true" aria-label="Calculating">
				{#each ['w-40', 'w-28'] as width (width)}
					<div class="flex h-5 items-center justify-between">
						<span class="{SKELETON} h-3.5 {width}"></span>
						<span class="{SKELETON} h-3.5 w-12"></span>
					</div>
				{/each}
				<div class="my-1 h-[0.0625rem] bg-white/5"></div>
				<div class="flex h-7 items-center justify-between">
					<span class="{SKELETON} h-3.5 w-16"></span>
					<span class="{SKELETON} h-5 w-14"></span>
				</div>
				<div class="border-border-subtle mt-4 border-t border-dashed pt-4">
					<span class="{SKELETON} block h-4 w-56"></span>
				</div>
			</div>
		{:else if quote}
			<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm tabular-nums">
				<dt class="text-muted-foreground">Price</dt>
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
				{#if quote.payable_paise}
					<dt class="text-muted-foreground">Includes {GST_PERCENT}% GST</dt>
					<dd class="text-muted-foreground text-right">
						{rupees(includedGst(quote.payable_paise))}
					</dd>
				{/if}
				<div class="col-span-2 my-1 h-[0.0625rem] bg-white/5"></div>
				<dt class="text-foreground font-medium">Pay now</dt>
				<dd class="text-foreground text-right text-lg font-medium">
					{free ? 'Free' : rupees(quote.payable_paise)}
				</dd>
			</dl>
			{#if trial}
				<p class={NOTE}>
					<Info class="size-4 shrink-0" />
					{rupees(quote.price_paise)} from {shortDate(quote.first_charge_at)}, every {TENURE_UNITS[
						quote.tenure
					]}.
				</p>
			{:else if !free}
				<p class={NOTE}>
					Renews at {rupees(quote.price_paise)} every {TENURE_UNITS[quote.tenure]}. Cancel anytime.
				</p>
			{/if}
		{:else}
			<p class="text-muted-foreground text-sm">Choose a plan.</p>
		{/if}

		{#if notice}
			<p class="text-sm {notice.tone}">{notice.text}</p>
		{/if}

		<div class="mt-auto">
			{#if blocked}
				<p class="text-primary text-sm">{blocked}</p>
			{:else if loading && !quote}
				<span class="{SKELETON} block w-full animate-pulse {MODAL_BUTTON}"></span>
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
					class="w-full justify-center border-transparent {MODAL_BUTTON}"
					disabled={!quote || !!error || loading || paying}
					onclick={onPay}
				/>
			{/if}
		</div>
	</div>
</SvaKoshCard>
