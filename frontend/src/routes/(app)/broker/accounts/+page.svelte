<script lang="ts">
	import { onMount } from 'svelte';
	import { BRAND } from '$lib/brand';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import CopyField from '$lib/components/trade/CopyField.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import SymbolImage from '$lib/components/symbol-image/SymbolImage.svelte';
	import Delete from '$lib/components/svg-provider/material/Delete.svelte';
	import Edit from '$lib/components/svg-provider/material/Edit.svelte';
	import ExpandLess from '$lib/components/svg-provider/material/ExpandLess.svelte';
	import { slide } from 'svelte/transition';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { tradeAccounts } from '$lib/trade/accounts.svelte';
	import { page } from '$app/state';
	import { BROKERS, LIVE_BROKERS, brokerOf } from '$lib/trade/brokers';
	import {
		BROKER_VIEW_KEY,
		CALLBACK_PATH,
		EMPTY_STATE,
		TABLE,
		TRADE_STATIC_IP
	} from '$lib/trade/const';
	import { timeOf } from '$lib/trade/format';
	import { linkAccount, unlinkAccount, updateAccount } from '$lib/trade/service';
	import type { TBrokerAccount } from '$lib/trade/types';

	type TMode = 'add' | 'edit' | 'remove';
	type TView = 'cards' | 'table';

	const VIEWS: { label: string; value: TView; svgPath: string }[] = [
		{
			label: 'Cards',
			value: 'cards',
			svgPath: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z'
		},
		{ label: 'Table', value: 'table', svgPath: 'M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h18v4H3v-4z' }
	];
	const ICON_BUTTON =
		'bg-glass inline-flex size-9 items-center justify-center rounded-lg transition-colors';
	const SOFT_BUTTON =
		'[--terminal-bg-hover:color-mix(in_srgb,var(--primary)_22%,transparent)] [--terminal-bg:color-mix(in_srgb,var(--primary)_14%,transparent)] [--terminal-border-hover:transparent] [--terminal-border:transparent] [--terminal-fg:var(--primary)]';

	const blank = () => Object.fromEntries(BROKERS.flatMap((b) => b.fields).map((f) => [f.key, '']));

	let modalOpen = $state(false);
	let mode = $state<TMode>('add');
	let target = $state<TBrokerAccount | null>(null);
	let broker = $state(LIVE_BROKERS[0].value);
	let setupOpen = $state(false);
	let tag = $state('');
	let creds = $state<Record<string, string>>(blank());
	let busy = $state(false);
	let loggingIn = $state('');
	let view = $state<TView>('cards');

	const brokerName = (value: string) => brokerOf(value)?.label ?? value;
	const fields = $derived(
		(brokerOf(broker)?.fields ?? []).filter((f) => mode === 'add' || f.key !== 'client_id')
	);
	const keyChanged = $derived(fields.some((f) => (creds[f.key] ?? '').trim()));
	const guide = $derived(brokerOf(broker)?.guide);
	const label = 'text-foreground/80 mb-2 ml-0 text-sm normal-case tracking-normal';
	const redirectUrl = $derived(`${page.url.origin}${CALLBACK_PATH}`);
	const ready = $derived(mode !== 'add' || fields.every((f) => (creds[f.key] ?? '').trim()));
	const titles: Record<TMode, string> = {
		add: 'Link broker account',
		edit: 'Update broker account',
		remove: 'Remove broker account'
	};
	const subtitles: Partial<Record<TMode, string>> = {
		remove: 'Saved details are deleted. Orders at your broker stay.'
	};

	function open(next: TMode, account: TBrokerAccount | null = null) {
		mode = next;
		target = account;
		broker = account?.broker ?? LIVE_BROKERS[0].value;
		tag = account?.account_tag ?? '';
		creds = blank();
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
				...(keyChanged ? { credentials: credentials() } : {})
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

	function setView(next: TView) {
		view = next;
		try {
			localStorage.setItem(BROKER_VIEW_KEY, next);
		} catch {
			return;
		}
	}

	onMount(() => {
		tradeAccounts.load();
		try {
			const saved = localStorage.getItem(BROKER_VIEW_KEY);
			if (saved && VIEWS.some((v) => v.value === saved)) view = saved as TView;
		} catch {
			return;
		}
	});
</script>

<svelte:head>
	<title>Broker accounts | {BRAND.name}</title>
</svelte:head>

<div class="text-foreground py-2">
	<header class="mb-5 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="text-primary mb-1 text-2xl tracking-tight">Broker accounts</h1>
			<p class="text-muted-foreground text-sm">Log in on your broker's page once a day.</p>
		</div>
		<div class="flex w-full items-stretch gap-3 sm:w-auto">
			{#if tradeAccounts.list.length}
				<SvaKoshTabs
					tabs={VIEWS}
					activeTab={view}
					onTabChange={setView}
					class="flex-1 sm:flex-none [&>button]:flex-1 [&>button]:justify-center"
				/>
			{/if}
			<SvaKoshButton
				variant="solid"
				label="Link account"
				class="min-h-0 flex-1 px-5 py-3 text-xs sm:flex-none"
				onclick={() => open('add')}
			/>
		</div>
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
		/>
	{:else if view === 'table'}
		<div class="border-glass-border hide-scrollbar overflow-x-auto rounded-xl border">
			<table class={TABLE.table}>
				<thead>
					<tr class={TABLE.head}>
						<th class={TABLE.th}>Account</th>
						<th class={TABLE.th}>Broker</th>
						<th class={TABLE.th}>Session</th>
						<th class={TABLE.th}>Linked</th>
						<th class="{TABLE.th} w-px text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each tradeAccounts.list as account (account.id)}
						<tr class={TABLE.row}>
							<td class={TABLE.td}>
								<div class="flex items-center gap-2.5">
									<SymbolImage
										name={brokerOf(account.broker)?.logo ?? account.broker}
										class="h-7 w-7 shrink-0"
										initialClass="text-xs"
									/>
									<div>
										{account.account_tag || account.client_id}
										{#if account.account_tag}
											<span class="text-muted-foreground block text-xs">{account.client_id}</span>
										{/if}
									</div>
								</div>
							</td>
							<td class="{TABLE.td} text-muted-foreground">{brokerName(account.broker)}</td>
							<td class={TABLE.td}>{@render session(account)}</td>
							<td class="{TABLE.td} text-muted-foreground">{timeOf(account.created_at)}</td>
							<td class={TABLE.td}>
								<div class="flex items-center justify-end gap-2">
									{@render iconActions(account)}
									{@render loginButton(account)}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div
			class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-3 lg:grid-cols-[repeat(auto-fill,24rem)]"
		>
			{#each tradeAccounts.list as account (account.id)}
				<div class="glass-panel rounded-xl p-4">
					<div class="flex items-stretch justify-between gap-3">
						<div class="flex min-w-0 items-start gap-3">
							<SymbolImage
								name={brokerOf(account.broker)?.logo ?? account.broker}
								class="size-11.5 shrink-0"
								initialClass="text-base"
							/>
							<div class="min-w-0">
								<p class="text-foreground truncate text-base font-medium">
									{account.account_tag || account.client_id}
								</p>
								<p class="text-muted-foreground mt-1.5 text-xs">
									{account.client_id}
								</p>
							</div>
						</div>
						<div class="flex shrink-0 flex-col items-end justify-between">
							{@render session(account)}
							<span class="text-muted-foreground text-xs">Linked {timeOf(account.created_at)}</span>
						</div>
					</div>
					<div
						class="border-border-subtle mt-3 flex items-center justify-between gap-3 border-t pt-3"
					>
						<div class="flex gap-2">{@render iconActions(account)}</div>
						{@render loginButton(account)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#snippet session(account: TBrokerAccount)}
	<span
		class="shrink-0 rounded px-2 py-1 text-xs font-semibold {account.logged_in
			? 'bg-bullish-subtle text-bullish'
			: 'bg-bearish-subtle text-bearish'}"
	>
		{account.logged_in ? 'Active' : 'Expired'}
	</span>
{/snippet}

{#snippet loginButton(account: TBrokerAccount)}
	<SvaKoshButton
		variant="solid"
		label={loggingIn === account.id ? 'Opening…' : account.logged_in ? 'Re-login' : 'Login'}
		class="px-4 py-1.5 text-xs {account.logged_in ? SOFT_BUTTON : ''}"
		disabled={loggingIn === account.id}
		onclick={() => login(account)}
	/>
{/snippet}

{#snippet iconActions(account: TBrokerAccount)}
	<button
		type="button"
		aria-label="Edit {account.account_tag || account.client_id}"
		title="Edit"
		class="{ICON_BUTTON} text-muted-foreground hover:text-foreground"
		onclick={() => open('edit', account)}
	>
		<Edit class="size-4.5" />
	</button>
	<button
		type="button"
		aria-label="Remove {account.account_tag || account.client_id}"
		title="Remove"
		class="{ICON_BUTTON} text-bearish/80 hover:text-bearish"
		onclick={() => open('remove', account)}
	>
		<Delete class="size-4.5" />
	</button>
{/snippet}

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

			<div class="grid gap-4 sm:grid-cols-2">
				{#each fields as field (field.key)}
					<div
						class={field.key === 'client_id'
							? 'order-1'
							: mode === 'edit'
								? 'order-2'
								: 'order-3 sm:col-span-2'}
					>
						<SvaKoshLabel for={`cred-${field.key}`} class={label}>{field.label}</SvaKoshLabel>
						<SvaKoshInput
							id={`cred-${field.key}`}
							bind:value={creds[field.key]}
							placeholder={mode === 'edit' ? 'Leave empty to keep it' : field.placeholder}
							type={field.secret ? 'password' : 'text'}
							autocomplete="off"
							spellcheck="false"
							class="text-sm"
						/>
					</div>
				{/each}
				<div class={mode === 'edit' ? 'order-1' : 'order-2'}>
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
