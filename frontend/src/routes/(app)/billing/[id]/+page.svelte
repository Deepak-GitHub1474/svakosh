<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import AnimatedStatus from '$lib/components/svg-provider/AnimatedStatus.svelte';
	import { PLAN_HOME, STATUS_POLL_LIMIT, STATUS_POLL_MS, TENURE_LABELS } from '$lib/billing/const';
	import { shortDate } from '$lib/billing/helper';
	import { getSubscription } from '$lib/billing/service';
	import type { TSubscription } from '$lib/billing/types';
	import { MODAL_BUTTON } from '$lib/trade/const';

	let { data }: { data: { subscription: TSubscription | null; error: string } } = $props();

	const BUTTON = `${MODAL_BUTTON} mt-4 min-w-40 border-transparent px-6`;

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
	<div class="flex w-full max-w-md flex-col items-center gap-4 text-center">
		{#if view === 'done' && sub}
			<AnimatedStatus tone="success" class="text-bullish" />
			<div class="rise [--i:3]">
				<h1 class="text-foreground text-2xl font-medium">You're subscribed</h1>
				<p class="text-muted-foreground mt-1 text-sm">
					{sub.plan?.name} · {TENURE_LABELS[sub.tenure]}
				</p>
			</div>
			<p class="rise text-muted-foreground text-sm [--i:4]">
				{sub.expires_at
					? `Active until ${shortDate(sub.expires_at)}${sub.auto_renew ? ', renews automatically.' : '.'}`
					: 'Active.'}
			</p>
			<div class="rise [--i:5]">
				<SvaKoshButton variant="solid" label={home.label} href={home.href} class={BUTTON} />
			</div>
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
					class={BUTTON}
					onclick={() => window.location.reload()}
				/>
			{/if}
		{:else}
			<AnimatedStatus tone="error" class="text-bearish" />
			<div class="rise [--i:3]">
				<h1 class="text-foreground text-2xl font-medium">
					{view === 'missing' ? 'Subscription not found' : 'Payment not completed'}
				</h1>
				<p class="text-muted-foreground mt-1 text-sm">
					{view === 'missing'
						? data.error || 'This link does not match any of your subscriptions.'
						: 'No money was taken for this attempt. You can start again from plans.'}
				</p>
			</div>
			<div class="rise [--i:4]">
				<SvaKoshButton
					variant="solid"
					label="Back to plans"
					href={resolve('/pricing')}
					class={BUTTON}
				/>
			</div>
		{/if}
	</div>
</div>
