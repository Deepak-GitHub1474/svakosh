<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto, invalidateAll, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import { IP_LABELS, PLAN_CODES, QUOTE_DELAY_MS, SKELETON } from '$lib/billing/const';
	import { MODAL_BUTTON } from '$lib/trade/const';
	import { ipSupported, openRazorpay } from '$lib/billing/helper';
	import { confirmPayment, getQuote, startCheckout } from '$lib/billing/service';
	import type { TPlan, TQuote, TQuoteRequest, TTenure } from '$lib/billing/types';
	import { accountLabel, tradeAccounts } from '$lib/trade/accounts.svelte';
	import AccountPicker from './_components/AccountPicker.svelte';
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
	let loading = $state(true);
	let paying = $state(false);
	let notice = $state<{ tone: string; text: string } | null>(null);

	const plan = $derived(data.plans.find((p) => p.code === planCode) ?? data.plans[0]);
	const isBroker = $derived(plan?.type === 'broker');
	const noAccount = $derived(isBroker && tradeAccounts.loaded && !tradeAccounts.list.length);
	const tabs = $derived(data.plans.map((p) => ({ label: p.name, value: p.code })));
	const accounts = $derived(tradeAccounts.list);
	const account = $derived(accounts.find((a) => a.id === accountId));
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
			loading = isBroker && !tradeAccounts.loaded;
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

	function syncUrl() {
		const url = new URL(page.url);
		url.searchParams.set('plan', planCode);
		if (accountId) url.searchParams.set('account', accountId);
		else url.searchParams.delete('account');
		replaceState(url, page.state);
	}

	function selectPlan(code: string) {
		planCode = code;
		quote = null;
		syncUrl();
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
			await openRazorpay(checkout, {
				onPaid: async (payment) => {
					notice = { tone: 'text-muted-foreground', text: 'Confirming your payment…' };
					await confirmPayment(payment);
					await done(checkout.subscription_id);
				},
				onDismiss: () => {
					paying = false;
					notice ??= {
						tone: 'text-muted-foreground',
						text: 'Payment not completed.'
					};
				},
				onFailed: (reason) => {
					notice = { tone: 'text-bearish', text: reason };
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
	<div
		class="grid grid-cols-1 gap-6 pt-2 pb-8 lg:justify-start {noAccount
			? ''
			: 'lg:grid-cols-[auto_24rem]'}"
	>
		<SvaKoshCard class="flex flex-col" contentClass="flex flex-1 flex-col">
			<div class="flex flex-1 flex-col gap-6">
				{#if tabs.length > 1}
					<SvaKoshTabs
						{tabs}
						activeTab={plan.code}
						onTabChange={selectPlan}
						class="border-primary/20 bg-primary-subtle w-fit"
					/>
				{/if}

				{#if isBroker}
					<div>
						<SvaKoshLabel>Broker account</SvaKoshLabel>
						{#if !tradeAccounts.loaded}
							<div
								class="glass-panel flex animate-pulse items-center justify-between gap-3 rounded-xl px-4 py-3 sm:max-w-md"
								aria-busy="true"
							>
								<span class="flex flex-col gap-1.5">
									<span class="{SKELETON} h-4 w-24"></span>
									<span class="{SKELETON} h-3 w-16"></span>
								</span>
								<span class="{SKELETON} h-10 w-[6.875rem]"></span>
							</div>
						{:else if accounts.length}
							<div
								class="glass-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3 sm:max-w-md"
							>
								<span class="min-w-0">
									<span class="text-foreground block truncate text-sm">
										{account ? accountLabel(account) : 'No account chosen'}
									</span>
									{#if account}
										<span class="text-muted-foreground block text-xs capitalize"
											>{account.broker}</span
										>
									{/if}
								</span>
								<SvaKoshButton
									variant="secondary"
									label={account ? 'Change' : 'Choose'}
									class="border-transparent"
									onclick={() => {
										accountOpen = true;
									}}
								/>
							</div>
						{:else}
							<p class="text-muted-foreground ml-1 text-sm">
								Link a broker account to subscribe. You can choose a billing period after linking.
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

				<div class="mt-auto">
					<SvaKoshLabel>Billing period</SvaKoshLabel>
					<TenurePicker
						{plan}
						broker={account?.broker ?? null}
						ip={isBroker ? ip : null}
						readonly={noAccount}
						bind:value={tenure}
					/>
				</div>

				{#if noAccount}
					<SvaKoshButton
						variant="solid"
						label="Link broker account"
						href={resolve('/broker/accounts')}
						class="w-full justify-center border-transparent sm:w-fit {MODAL_BUTTON}"
					/>
				{/if}
			</div>
		</SvaKoshCard>

		<div class:hidden={noAccount}>
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

<AccountPicker
	bind:isOpen={accountOpen}
	{accounts}
	value={accountId}
	onSelect={(id) => {
		accountId = id;
		syncUrl();
	}}
/>
