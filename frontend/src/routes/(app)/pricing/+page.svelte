<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import { FEATURE_LABELS, IP_LABELS, PLAN_CODES, QUOTE_DELAY_MS } from '$lib/billing/const';
	import { ipSupported, openRazorpay } from '$lib/billing/helper';
	import { confirmPayment, getQuote, startCheckout } from '$lib/billing/service';
	import type { TPlan, TQuote, TQuoteRequest, TTenure } from '$lib/billing/types';
	import { accountLabel, tradeAccounts } from '$lib/trade/accounts.svelte';
	import BillSummary from './_components/BillSummary.svelte';
	import TenurePicker from './_components/TenurePicker.svelte';

	let { data }: { data: { plans: TPlan[]; plansError: string } } = $props();

	const params = page.url.searchParams;
	let planCode = $state(params.get('plan') ?? PLAN_CODES.analytics);
	let accountId = $state(params.get('account') ?? '');
	let accountOpen = $state(false);
	let tenure = $state<TTenure>('monthly');
	let ip = $state('ipv4');
	let couponText = $state(params.get('coupon')?.toUpperCase() ?? '');
	let applied = $state(untrack(() => couponText));
	let quote = $state<TQuote | null>(null);
	let quoteError = $state('');
	let loading = $state(false);
	let paying = $state(false);
	let notice = $state<{ tone: string; text: string } | null>(null);

	const plan = $derived(data.plans.find((p) => p.code === planCode) ?? data.plans[0]);
	const isBroker = $derived(plan?.type === 'broker');
	const tabs = $derived(data.plans.map((p) => ({ label: p.name, value: p.code })));
	const accounts = $derived(tradeAccounts.list);
	const account = $derived(accounts.find((a) => a.id === accountId));
	const accountOptions = $derived(
		accounts.map((a) => ({ label: `${accountLabel(a)} · ${a.broker}`, value: a.id }))
	);
	const ipOptions = $derived(
		[...new Set(plan?.prices.flatMap((p) => (p.ip ? [p.ip] : [])) ?? [])]
			.filter((value) => plan && ipSupported(plan, account?.broker ?? null, value))
			.map((value) => ({ label: IP_LABELS[value] ?? value, value }))
	);
	const entitlements = $derived(page.data.entitlements);
	const blocked = $derived.by(() => {
		if (!plan) return '';
		if (isBroker) {
			return account && entitlements?.broker_accounts.includes(account.id)
				? 'This broker account is already subscribed.'
				: '';
		}
		return plan.features.every((f) => entitlements?.features.includes(f))
			? `You already have ${plan.name}.`
			: '';
	});
	const request = $derived<TQuoteRequest | null>(
		!plan || (isBroker && !accountId)
			? null
			: {
					plan: plan.code,
					tenure,
					...(isBroker ? { broker_account_id: accountId, ip } : {}),
					...(applied ? { coupon: applied } : {})
				}
	);

	onMount(() => {
		if (!tradeAccounts.loaded) tradeAccounts.load();
	});

	$effect(() => {
		if (isBroker && !accountId && accounts.length) accountId = accounts[0].id;
	});

	$effect(() => {
		if (ipOptions.length && !ipOptions.some((o) => o.value === ip)) ip = ipOptions[0].value;
	});

	$effect(() => {
		const body = request;
		notice = null;
		if (!body) {
			quote = null;
			return;
		}
		loading = true;
		let live = true;
		const timer = setTimeout(async () => {
			const res = await getQuote(body);
			if (!live) return;
			loading = false;
			quote = res.ok ? res.data : null;
			quoteError = res.ok ? '' : res.error;
		}, QUOTE_DELAY_MS);
		return () => {
			live = false;
			clearTimeout(timer);
		};
	});

	function selectPlan(code: string) {
		planCode = code;
		quote = null;
	}

	function applyCoupon() {
		applied = couponText.trim().toUpperCase();
	}

	async function done(subscriptionId: string) {
		await invalidateAll();
		goto(resolve(`/billing/${subscriptionId}`));
	}

	async function pay() {
		if (!request || paying) return;
		paying = true;
		notice = null;
		const res = await startCheckout(request);
		if (!res.ok) {
			paying = false;
			notice = { tone: 'text-bearish', text: res.error };
			return;
		}
		const checkout = res.data;
		if (!checkout.razorpay) {
			await done(checkout.subscription_id);
			return;
		}
		try {
			await openRazorpay(checkout, `${plan?.name ?? ''} · ${tenure}`, {
				onPaid: async (payment) => {
					notice = { tone: 'text-muted-foreground', text: 'Confirming your payment…' };
					await confirmPayment(payment);
					await done(checkout.subscription_id);
				},
				onDismiss: () => {
					paying = false;
					notice ??= {
						tone: 'text-muted-foreground',
						text: 'Payment was not completed. You can try again whenever you are ready.'
					};
				},
				onFailed: (reason) => {
					notice = { tone: 'text-bearish', text: `${reason} You can try again.` };
				}
			});
		} catch (e) {
			paying = false;
			notice = { tone: 'text-bearish', text: (e as Error).message };
		}
	}
</script>

<svelte:head>
	<title>Plans | SvaKosh</title>
</svelte:head>

{#if !plan}
	<EmptyState
		class="min-h-[50vh]"
		title="Plans are not available right now"
		description={data.plansError || 'Please try again in a moment.'}
		actionLabel="Retry"
		onAction={() => invalidateAll()}
	/>
{:else}
	<div class="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-[1fr_22rem]">
		<SvaKoshCard
			class="flex flex-col gap-6 overflow-visible p-5 sm:p-6 {accountOpen ? 'z-40' : ''}"
		>
			{#if tabs.length > 1}
				<SvaKoshTabs
					{tabs}
					activeTab={plan.code}
					onTabChange={selectPlan}
					class="border-primary/20 bg-primary-subtle w-fit"
				/>
			{/if}

			<div>
				<h1 class="text-foreground text-xl font-medium">{plan.name}</h1>
				<p class="text-muted-foreground mt-1 text-sm">{plan.description}</p>
				<ul class="text-foreground/80 mt-3 flex flex-wrap gap-2 text-xs">
					{#each plan.features as feature (feature)}
						<li class="bg-primary/10 text-primary rounded-md px-2 py-1">
							{FEATURE_LABELS[feature] ?? feature}
						</li>
					{/each}
				</ul>
			</div>

			{#if isBroker}
				<div>
					<SvaKoshLabel for="account">Broker account</SvaKoshLabel>
					{#if accounts.length}
						<SvaKoshSelector
							id="account"
							options={accountOptions}
							bind:value={accountId}
							bind:isOpen={accountOpen}
							placeholder="Choose a broker account"
							onSelect={(v) => (accountId = v)}
						/>
					{:else}
						<p class="text-muted-foreground text-sm">
							Link a broker account first.
							<a href={resolve('/broker/accounts')} class="text-primary hover:underline"
								>Link account</a
							>
						</p>
					{/if}
				</div>
			{/if}

			{#if isBroker && ipOptions.length > 1}
				<div>
					<SvaKoshLabel>Static IP</SvaKoshLabel>
					<SvaKoshTabs
						tabs={ipOptions}
						activeTab={ip}
						onTabChange={(value: string) => (ip = value)}
						class="border-primary/20 bg-primary-subtle w-fit"
					/>
				</div>
			{/if}

			<div>
				<SvaKoshLabel>Billing period</SvaKoshLabel>
				<TenurePicker
					{plan}
					broker={account?.broker ?? null}
					ip={isBroker ? ip : null}
					bind:value={tenure}
				/>
			</div>
		</SvaKoshCard>

		<div class="lg:sticky lg:top-4 lg:self-start">
			<BillSummary
				{quote}
				{loading}
				error={quoteError}
				bind:couponText
				{applied}
				{blocked}
				{paying}
				{notice}
				onApply={applyCoupon}
				onPay={pay}
			/>
		</div>
	</div>
{/if}
