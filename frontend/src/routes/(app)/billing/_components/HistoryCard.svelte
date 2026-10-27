<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import { TENURE_LABELS } from '$lib/billing/const';
	import { lastPayment, paidTotal, planMeta, renewal, rupees } from '$lib/billing/helper';
	import type { TSubscription } from '$lib/billing/types';
	import StatusBadge from './StatusBadge.svelte';

	let { sub, target, onCancel }: { sub: TSubscription; target: string; onCancel: () => void } =
		$props();

	const ROW = 'grid grid-cols-[minmax(0,1fr)_auto] gap-x-6';
	const LABEL = 'text-muted-foreground truncate text-sm';
	const VALUE = 'text-foreground mt-1 truncate text-base font-medium';

	const renews = $derived(renewal(sub));
	const payment = $derived(lastPayment(sub));
	const meta = $derived(
		[planMeta(sub, target), TENURE_LABELS[sub.tenure], payment.status]
			.filter((v) => v && v !== '—')
			.join(' · ')
	);
</script>

{#snippet field(label: string, value: string, end = false)}
	<div class="min-w-0 {end ? 'text-right' : ''}">
		<p class={LABEL}>{label}</p>
		<p class={VALUE} title={value}>{value}</p>
	</div>
{/snippet}

<article class="glass-panel flex flex-col gap-4 rounded-xl p-4">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="text-foreground truncate text-base font-medium">{sub.plan?.name ?? 'Plan'}</p>
			<p class="text-muted-foreground mt-0.5 truncate text-sm">{meta}</p>
		</div>
		<StatusBadge status={sub.status} />
	</div>
	<div class={ROW}>
		{@render field('Period', payment.period)}
		{@render field(renews.label, renews.value, true)}
	</div>
	<div class={ROW}>
		{@render field('Payment ID', payment.reference)}
		{@render field('Amount', rupees(paidTotal(sub)), true)}
	</div>
	{#if sub.status === 'active' && sub.auto_renew}
		<div class="border-border-subtle flex justify-end border-t pt-3">
			<SvaKoshButton
				variant="secondary"
				label="Cancel autopay"
				class="border-transparent"
				onclick={onCancel}
			/>
		</div>
	{/if}
</article>
