<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import CheckCircle from '$lib/components/svg-provider/material/CheckCircle.svelte';
	import ErrorIcon from '$lib/components/svg-provider/ErrorIcon.svelte';
	import { PLAN_HOME, STATUS_POLL_LIMIT, STATUS_POLL_MS, TENURE_LABELS } from '$lib/billing/const';
	import { shortDate } from '$lib/billing/helper';
	import { getSubscription } from '$lib/billing/service';
	import type { TSubscription } from '$lib/billing/types';

	let { data }: { data: { subscription: TSubscription | null; error: string } } = $props();

	let sub = $state(untrack(() => data.subscription));
	let polls = $state(0);

	const view = $derived(
		!sub
			? 'missing'
			: sub.status === 'active' || sub.status === 'cancelled'
				? 'done'
				: sub.status === 'pending'
					? 'waiting'
					: 'failed'
	);
	const home = $derived(sub?.plan ? PLAN_HOME[sub.plan.type] : PLAN_HOME.analytics);

	onMount(() => {
		if (view === 'done') invalidateAll();
		const timer = setInterval(async () => {
			if (!sub || sub.status !== 'pending' || polls >= STATUS_POLL_LIMIT) {
				clearInterval(timer);
				return;
			}
			polls += 1;
			const res = await getSubscription(sub.id);
			if (res.ok) {
				sub = res.data;
				if (res.data.status === 'active') invalidateAll();
			}
		}, STATUS_POLL_MS);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>Subscription | SvaKosh</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center py-8">
	<SvaKoshCard class="flex w-full max-w-md flex-col items-center gap-4 p-6 text-center sm:p-8">
		{#if view === 'done' && sub}
			<CheckCircle class="text-bullish text-5xl" />
			<div>
				<h1 class="text-foreground text-xl font-medium">You're subscribed</h1>
				<p class="text-muted-foreground mt-1 text-sm">
					{sub.plan?.name} · {TENURE_LABELS[sub.tenure]}
				</p>
			</div>
			<p class="text-muted-foreground text-sm">
				{sub.expires_at
					? `Active until ${shortDate(sub.expires_at)}${sub.auto_renew ? ', renews automatically.' : '.'}`
					: 'Active.'}
			</p>
			<SvaKoshButton
				variant="solid"
				label={home.label}
				href={home.href}
				class="h-11 w-full justify-center text-sm font-semibold"
			/>
		{:else if view === 'waiting'}
			{#if polls < STATUS_POLL_LIMIT}
				<div class="relative h-16 w-full"><SvaKoshLoader inline message="" /></div>
				<h1 class="text-foreground text-xl font-medium">Confirming your payment</h1>
				<p class="text-muted-foreground text-sm">This usually takes a few seconds.</p>
			{:else}
				<h1 class="text-foreground text-xl font-medium">Still confirming</h1>
				<p class="text-muted-foreground text-sm">
					If you paid, your subscription activates as soon as the payment is confirmed. Check again
					in a minute.
				</p>
				<SvaKoshButton
					variant="solid"
					label="Check again"
					class="h-11 w-full justify-center text-sm font-semibold"
					onclick={() => window.location.reload()}
				/>
			{/if}
		{:else}
			<ErrorIcon class="text-bearish" />
			<h1 class="text-foreground text-xl font-medium">
				{view === 'missing' ? 'Subscription not found' : 'Payment not completed'}
			</h1>
			<p class="text-muted-foreground text-sm">
				{view === 'missing'
					? data.error || 'This link does not match any of your subscriptions.'
					: 'No money was taken for this attempt. You can start again from plans.'}
			</p>
			<SvaKoshButton
				variant="solid"
				label="Back to plans"
				href={resolve('/pricing')}
				class="h-11 w-full justify-center text-sm font-semibold"
			/>
		{/if}
	</SvaKoshCard>
</div>
