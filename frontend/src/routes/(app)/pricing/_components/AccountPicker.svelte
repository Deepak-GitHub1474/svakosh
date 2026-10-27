<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import TradeSheet from '$lib/components/trade/TradeSheet.svelte';
	import { accountLabel } from '$lib/trade/accounts.svelte';
	import { RADIO } from '$lib/billing/const';
	import { MODAL_ACTION, MODAL_ACTIONS } from '$lib/trade/const';
	import type { TBrokerAccount } from '$lib/trade/types';

	let {
		isOpen = $bindable(false),
		accounts,
		value,
		onSelect
	}: {
		isOpen: boolean;
		accounts: TBrokerAccount[];
		value: string;
		onSelect: (id: string) => void;
	} = $props();

	let draft = $derived(value);

	function select() {
		isOpen = false;
		onSelect(draft);
	}
</script>

{#snippet actions()}
	<div class={MODAL_ACTIONS}>
		<SvaKoshButton
			variant="secondary"
			label="Cancel"
			class="border-transparent {MODAL_ACTION}"
			onclick={() => {
				isOpen = false;
			}}
		/>
		<SvaKoshButton
			variant="solid"
			label="Select"
			class="border-transparent {MODAL_ACTION}"
			disabled={!draft}
			onclick={select}
		/>
	</div>
{/snippet}

<TradeSheet bind:isOpen width="26rem" footer={actions}>
	<ModalHeader title="Choose broker account" onClose={() => (isOpen = false)} />
	<fieldset class="hide-scrollbar flex max-h-[50vh] flex-col gap-1 overflow-y-auto p-4">
		<legend class="sr-only">Broker account</legend>
		{#each accounts as account (account.id)}
			<label
				class="hover:bg-glass flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors"
			>
				<input
					type="radio"
					name="broker-account"
					class={RADIO}
					checked={draft === account.id}
					onchange={() => (draft = account.id)}
				/>
				<span class="min-w-0 flex-1">
					<span class="text-foreground block truncate text-sm">{accountLabel(account)}</span>
					<span class="text-muted-foreground block text-xs capitalize">{account.broker}</span>
				</span>
			</label>
		{/each}
	</fieldset>
</TradeSheet>
