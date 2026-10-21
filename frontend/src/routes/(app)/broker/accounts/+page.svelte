<script lang="ts">
	import { onMount } from 'svelte';
	import { BRAND } from '$lib/brand';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import CopyField from '$lib/components/trade/CopyField.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import SymbolImage from '$lib/components/symbol-image/SymbolImage.svelte';
	import ExpandLess from '$lib/components/svg-provider/material/ExpandLess.svelte';
	import { slide } from 'svelte/transition';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { page } from '$app/state';
	import { BROKERS, LIVE_BROKERS, brokerOf } from '$lib/trade/brokers';
	import { CALLBACK_PATH, TRADE_STATIC_IP, EMPTY_STATE } from '$lib/trade/const';
	import { timeOf } from '$lib/trade/format';
	import { linkAccount, unlinkAccount, updateAccount } from '$lib/trade/service';
	import type { TBrokerAccount } from '$lib/trade/types';

	type TMode = 'add' | 'edit' | 'remove';

	const blank = () => Object.fromEntries(BROKERS.flatMap((b) => b.fields).map((f) => [f.key, '']));

	let modalOpen = $state(false);
	let mode = $state<TMode>('add');
	let target = $state<TBrokerAccount | null>(null);
	let broker = $state(LIVE_BROKERS[0].value);
	let setupOpen = $state(false);
	let tag = $state('');
	let creds = $state<Record<string, string>>(blank());
	let changeLogin = $state(false);
	let busy = $state(false);
	let loggingIn = $state('');

	const brokerName = (value: string) => brokerOf(value)?.label ?? value;
	const fields = $derived(
		(brokerOf(broker)?.fields ?? []).filter((f) => mode === 'add' || f.key !== 'client_id')
	);
	const needsLogin = $derived(mode === 'add' || changeLogin);
	const guide = $derived(brokerOf(broker)?.guide);
	const label = 'text-foreground/80 mb-2 ml-0 text-sm normal-case tracking-normal';
	const redirectUrl = $derived(`${page.url.origin}${CALLBACK_PATH}`);
	const ready = $derived(!needsLogin || fields.every((f) => (creds[f.key] ?? '').trim()));
	const titles: Record<TMode, string> = {
		add: 'Link broker account',
		edit: 'Edit broker account',
		remove: 'Remove broker account'
	};
	const subtitles: Partial<Record<TMode, string>> = {
		edit: 'Change the tag or update the API key.',
		remove: 'Saved details are deleted. Orders at your broker stay.'
	};

	function open(next: TMode, account: TBrokerAccount | null = null) {
		mode = next;
		target = account;
		broker = account?.broker ?? LIVE_BROKERS[0].value;
		tag = account?.account_tag ?? '';
		creds = blank();
		changeLogin = false;
		setupOpen = false;
		modalOpen = true;
	}

	function credentials() {
		const out = Object.fromEntries(fields.map((f) => [f.key, (creds[f.key] ?? '').trim()]));
		return target ? { ...out, client_id: target.client_id } : out;
	}

	async function save() {
		if (mode === 'add')
			return linkAccount({ broker, account_tag: tag.trim(), credentials: credentials() });
		if (mode === 'edit' && target) {
			return updateAccount(target.id, {
				account_tag: tag.trim(),
				...(changeLogin ? { credentials: credentials() } : {})
			});
		}
		return target ? unlinkAccount(target.id) : null;
	}

	async function login(account: TBrokerAccount) {
		loggingIn = account.id;
		const error = await tradeAccounts.login(account.id);
		if (!error) return;
		loggingIn = '';
		toast.error({ title: 'Could not start broker login', description: error });
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy || !ready) return;
		busy = true;
		const res = await save();
		busy = false;
		if (!res) return;
		if (!res.ok) {
			toast.error({ title: 'Could not save', description: res.error });
			return;
		}
		const done = {
			add: 'Broker account linked',
			edit: 'Broker account updated',
			remove: 'Broker account removed'
		};
		toast.success({ title: done[mode] });
		creds = blank();
		modalOpen = false;
		await tradeAccounts.load();
	}

	onMount(() => {
		tradeAccounts.load();
	});
</script>

<svelte:head>
	<title>Broker accounts | {BRAND.name}</title>
</svelte:head>

<div class="text-foreground py-2">
	<header class="mb-5">
		<h1 class="text-primary mb-1 text-2xl tracking-tight">Broker accounts</h1>
		<p class="text-muted-foreground text-sm">
			Link the broker accounts you trade with, then log in on your broker's page each day.
		</p>
	</header>

	{#if !tradeAccounts.loaded}
		<div class="relative h-40"><SvaKoshLoader inline message="" /></div>
	{:else if tradeAccounts.error}
		<EmptyState
			class={EMPTY_STATE}
			title="Trading is not available right now"
			description={tradeAccounts.error}
			actionLabel="Retry"
			onAction={() => tradeAccounts.load()}
		/>
	{:else if !tradeAccounts.list.length}
		<EmptyState
			class={EMPTY_STATE}
			title="No broker account linked"
			description="Link your Angel One account to start trading from Svakosh."
		>
			<SvaKoshButton
				variant="solid"
				label="Link account"
				class="px-6 py-3 text-sm"
				onclick={() => open('add')}
			/>
		</EmptyState>
	{:else}
		<div class="mb-4">
			<SvaKoshButton
				variant="solid"
				label="Link account"
				class="px-6 py-3 text-sm"
				onclick={() => open('add')}
			/>
		</div>
		<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each tradeAccounts.list as account (account.id)}
				{@const active = account.id === tradeAccounts.accountId}
				<div class="glass-panel rounded-xl p-4 {active ? 'border-primary/40' : ''}">
					<div class="flex items-start justify-between gap-3">
						<div class="flex min-w-0 items-center gap-3">
							<SymbolImage
								name={brokerOf(account.broker)?.logo ?? account.broker}
								class="h-9 w-9 shrink-0"
								initialClass="text-base"
							/>
							<div class="min-w-0">
								<p class="text-foreground truncate text-sm">
									{account.account_tag || account.client_id}
								</p>
								<p class="text-muted-foreground mt-0.5 text-xs">
									{brokerName(account.broker)} · {account.client_id}
								</p>
							</div>
						</div>
						{#if active}
							<span class="text-primary shrink-0 text-xs tracking-widest uppercase">Active</span>
						{:else}
							<button
								type="button"
								class="text-muted-foreground hover:text-primary shrink-0 text-xs tracking-widest uppercase transition-colors"
								onclick={() => tradeAccounts.select(account.id)}>Use</button
							>
						{/if}
					</div>
					<div class="mt-3 flex items-center justify-between gap-3">
						<span class="text-xs {account.logged_in ? 'text-bullish' : 'text-muted-foreground'}">
							{account.logged_in ? 'Logged in today' : 'Login required'}
						</span>
						<SvaKoshButton
							variant={account.logged_in ? 'secondary' : 'primary'}
							label={loggingIn === account.id
								? 'Opening…'
								: account.logged_in
									? 'Log in again'
									: 'Log in'}
							disabled={loggingIn === account.id}
							onclick={() => login(account)}
						/>
					</div>
					<div
						class="border-border-subtle mt-3 flex items-center justify-between gap-3 border-t pt-3 text-xs"
					>
						<span class="text-muted-foreground">Linked {timeOf(account.created_at)}</span>
						<div class="flex gap-4">
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground transition-colors"
								onclick={() => open('edit', account)}>Edit</button
							>
							<button
								type="button"
								class="text-bearish/80 hover:text-bearish transition-colors"
								onclick={() => open('remove', account)}>Remove</button
							>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<SvaKoshModal bind:isOpen={modalOpen} width="34rem" class="overflow-hidden">
	<ModalHeader
		title={titles[mode]}
		subtitle={subtitles[mode]}
		onClose={() => (modalOpen = false)}
	/>
	<form
		class="flex max-h-[75vh] flex-col gap-6 overflow-y-auto p-5"
		onsubmit={submit}
		autocomplete="off"
	>
		{#if mode === 'remove' && target}
			<p class="text-muted-foreground text-base">
				Remove <span class="text-foreground">{target.account_tag || target.client_id}</span>
				({brokerName(target.broker)} · {target.client_id})? Its saved details are deleted. Orders
				already placed stay at your broker.
			</p>
			<SvaKoshButton
				type="submit"
				variant="bearish"
				label={busy ? 'Removing…' : 'Remove account'}
				disabled={busy}
			/>
		{:else}
			{#if mode === 'add'}
				<div>
					<p class={label}>Broker</p>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{#each LIVE_BROKERS as option (option.value)}
							{@const selected = broker === option.value}
							<button
								type="button"
								aria-pressed={selected}
								onclick={() => (broker = option.value)}
								class="flex items-center gap-3 rounded-xl p-3 text-left transition-colors {selected
									? 'bg-primary/15 border border-transparent'
									: 'glass-panel hover:border-primary/30'}"
							>
								<SymbolImage
									name={option.logo}
									class="h-10 w-10 shrink-0"
									initialClass="text-base"
								/>
								<span class="min-w-0">
									<span class="text-foreground block truncate text-sm">{option.label}</span>
									<span class="text-muted-foreground flex items-center gap-1.5 text-xs">
										{option.api}
										{#if option.partner}<span class="text-primary">Partner</span>{/if}
									</span>
								</span>
							</button>
						{/each}
					</div>
				</div>
			{:else if target}
				<div
					class="border-border-subtle bg-surface-elevated flex items-center gap-3 rounded-xl border p-3"
				>
					<SymbolImage
						name={brokerOf(target.broker)?.logo ?? target.broker}
						class="h-10 w-10 shrink-0"
						initialClass="text-base"
					/>
					<div>
						<p class="text-foreground text-sm">{brokerName(target.broker)}</p>
						<p class="text-muted-foreground text-sm">{target.client_id}</p>
					</div>
				</div>
			{/if}

			{#if mode === 'edit'}
				<div class="text-foreground flex items-center justify-between gap-3 text-sm">
					Update API key
					<SvaKoshSwitch bind:checked={changeLogin} size="sm" label="Update API key" />
				</div>
			{/if}

			<div class="grid gap-4 sm:grid-cols-2">
				{#if needsLogin}
					{#each fields as field (field.key)}
						<div class={field.key === 'client_id' ? 'order-1' : 'order-3 sm:col-span-2'}>
							<SvaKoshLabel for={`cred-${field.key}`} class={label}>{field.label}</SvaKoshLabel>
							<SvaKoshInput
								id={`cred-${field.key}`}
								bind:value={creds[field.key]}
								placeholder={field.placeholder}
								type={field.secret ? 'password' : 'text'}
								autocomplete="off"
								spellcheck="false"
								class="text-sm"
							/>
						</div>
					{/each}
				{/if}
				<div class="order-2">
					<SvaKoshLabel for="account-tag" class={label}>Account tag (optional)</SvaKoshLabel>
					<SvaKoshInput
						id="account-tag"
						bind:value={tag}
						placeholder="Main, Family"
						maxlength="40"
						class="text-sm"
					/>
				</div>
			</div>

			{#if needsLogin}
				{#if guide}
					<section class="border-border-subtle bg-surface-elevated rounded-xl border">
						<button
							type="button"
							aria-expanded={setupOpen}
							onclick={() => (setupOpen = !setupOpen)}
							class="text-foreground flex w-full items-center justify-between gap-3 px-4 py-3 text-sm"
						>
							How to set up your {brokerName(broker)} app
							<ExpandLess
								class="icon-size text-primary transition-transform {setupOpen ? '' : 'rotate-180'}"
							/>
						</button>
						{#if setupOpen}
							<div class="flex flex-col gap-3 px-4 pb-4" transition:slide={{ duration: 200 }}>
								<ol class="text-muted-foreground flex list-decimal flex-col gap-1.5 pl-5 text-sm">
									{#each guide.steps as step (step)}<li>{step}</li>{/each}
								</ol>
								<CopyField label="Redirect URL" value={redirectUrl} />
								<CopyField label="Primary Static IP" value={TRADE_STATIC_IP} />
								<a
									href={guide.portal}
									target="_blank"
									rel="external noopener noreferrer"
									class="text-primary self-start text-sm hover:underline">Open SmartAPI apps ↗</a
								>
							</div>
						{/if}
					</section>
				{/if}
			{/if}

			<SvaKoshButton
				type="submit"
				variant="solid"
				class="py-3 text-sm"
				label={busy ? 'Saving…' : mode === 'add' ? 'Link account' : 'Save'}
				disabled={busy || !ready}
			/>
		{/if}
	</form>
</SvaKoshModal>
