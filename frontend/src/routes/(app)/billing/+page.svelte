<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { rupees, shortDate } from '$lib/billing/helper';
	import { cancelAutopay } from '$lib/billing/service';
	import type { TOverview } from '$lib/billing/types';
	import { accountLabel, tradeAccounts } from '$lib/trade/accounts.svelte';
	import SubscriptionRow from './_components/SubscriptionRow.svelte';

	let { data }: { data: { overview: TOverview | null; error: string } } = $props();

	let overview = $state(untrack(() => data.overview));
	let busy = $state('');

	const subs = $derived(overview?.subscriptions ?? []);
	const payments = $derived(overview?.payments ?? []);

	onMount(() => {
		if (!tradeAccounts.loaded) tradeAccounts.load();
	});

	function targetOf(accountId: string | null) {
		if (!accountId) return '';
		const account = tradeAccounts.list.find((a) => a.id === accountId);
		return account ? accountLabel(account) : 'Broker account';
	}

	async function cancel(id: string) {
		busy = id;
		const res = await cancelAutopay(id);
		busy = '';
		if (!res.ok) {
			toast.error({ title: 'Could not cancel autopay', description: res.error });
			return;
		}
		overview = overview && {
			...overview,
			subscriptions: overview.subscriptions.map((s) => (s.id === id ? res.data : s))
		};
		toast.success({
			title: 'Autopay cancelled',
			description: 'Access continues until the end date.'
		});
		invalidateAll();
	}
</script>

<svelte:head>
	<title>Subscription | SvaKosh</title>
</svelte:head>

{#if !overview}
	<EmptyState
		class="min-h-[50vh]"
		title="Subscriptions are not available right now"
		description={data.error || 'Please try again in a moment.'}
		actionLabel="Retry"
		onAction={() => invalidateAll()}
	/>
{:else}
	<div class="flex flex-col gap-6 pb-8">
		<SvaKoshCard class="p-5 sm:p-6">
			<div class="mb-5 flex items-center justify-between gap-3">
				<h2 class="text-muted-foreground flex items-center gap-2 text-sm tracking-wider uppercase">
					<span class="bg-primary h-4 w-1 rounded-full"></span>
					Subscriptions
				</h2>
				<SvaKoshButton
					variant="solid"
					label="See plans"
					href={resolve('/pricing')}
					class="px-4 py-2 text-xs"
				/>
			</div>
			{#if subs.length}
				<ul class="flex flex-col gap-2">
					{#each subs as sub (sub.id)}
						<SubscriptionRow
							{sub}
							target={targetOf(sub.broker_account_id)}
							busy={busy === sub.id}
							onCancel={() => cancel(sub.id)}
						/>
					{/each}
				</ul>
			{:else}
				<p class="text-muted-foreground text-sm">You have no subscriptions yet.</p>
			{/if}
		</SvaKoshCard>

		{#if payments.length}
			<SvaKoshCard class="p-5 sm:p-6">
				<h2
					class="text-muted-foreground mb-5 flex items-center gap-2 text-sm tracking-wider uppercase"
				>
					<span class="bg-primary h-4 w-1 rounded-full"></span>
					Payments
				</h2>
				<ul class="flex flex-col gap-2 text-sm tabular-nums">
					{#each payments as p (p.id)}
						<li
							class="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3"
						>
							<span class="text-muted-foreground text-xs">
								{shortDate(p.paid_at)} · {shortDate(p.period_start)} – {shortDate(p.period_end)}
							</span>
							<span
								class={p.status === 'refunded'
									? 'text-muted-foreground line-through'
									: 'text-foreground'}
							>
								{rupees(p.amount_paise)}
								{#if p.discount_paise}
									<span class="text-bullish ml-1 text-xs">saved {rupees(p.discount_paise)}</span>
								{/if}
							</span>
						</li>
					{/each}
				</ul>
			</SvaKoshCard>
		{/if}
	</div>
{/if}
