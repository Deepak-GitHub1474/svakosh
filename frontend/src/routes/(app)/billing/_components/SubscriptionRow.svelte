<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import { STATUS_LABELS, STATUS_TONE, TENURE_LABELS } from '$lib/billing/const';
	import { shortDate } from '$lib/billing/helper';
	import type { TSubscription } from '$lib/billing/types';

	let {
		sub,
		target,
		busy,
		onCancel
	}: { sub: TSubscription; target: string; busy: boolean; onCancel: () => void } = $props();

	let confirming = $state(false);

	const until = $derived(
		sub.expires_at
			? `${sub.status === 'expired' ? 'Ended' : sub.auto_renew ? 'Renews' : 'Valid until'} ${shortDate(sub.expires_at)}`
			: 'No expiry'
	);
</script>

<li class="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
	<div class="min-w-0">
		<p class="text-foreground truncate text-sm font-medium">
			{sub.plan?.name ?? 'Plan'}{target ? ` · ${target}` : ''}
		</p>
		<p class="text-muted-foreground mt-0.5 text-xs">
			{TENURE_LABELS[sub.tenure]} ·
			<span class={STATUS_TONE[sub.status]}>{STATUS_LABELS[sub.status]}</span>
			·
			{until}
		</p>
	</div>
	{#if sub.status === 'active' && sub.auto_renew}
		{#if confirming}
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground text-xs"
					>Stop renewing? Access stays until the end date.</span
				>
				<SvaKoshButton
					variant="bearish"
					label={busy ? 'Cancelling…' : 'Yes, cancel'}
					class="px-3 py-1.5 text-xs"
					disabled={busy}
					onclick={onCancel}
				/>
				<SvaKoshButton
					variant="secondary"
					label="Keep"
					class="px-3 py-1.5 text-xs"
					disabled={busy}
					onclick={() => {
						confirming = false;
					}}
				/>
			</div>
		{:else}
			<SvaKoshButton
				variant="secondary"
				label="Cancel autopay"
				class="px-3 py-1.5 text-xs"
				onclick={() => {
					confirming = true;
				}}
			/>
		{/if}
	{/if}
</li>
