<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshDrawer from '$lib/components/svakosh/SvaKoshDrawer.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import { shortDate } from '$lib/billing/helper';
	import type { TSubscription } from '$lib/billing/types';
	import { MODAL_ACTION, MODAL_ACTIONS, MODAL_DANGER } from '$lib/trade/const';

	let {
		sub,
		busy,
		isDesktop,
		onConfirm,
		onClose
	}: {
		sub: TSubscription | null;
		busy: boolean;
		isDesktop: boolean;
		onConfirm: () => void;
		onClose: () => void;
	} = $props();

	let isOpen = $derived(!!sub);
	function close() {
		if (!busy) onClose();
	}
</script>

{#snippet message()}
	<p class="text-muted-foreground text-sm">
		{sub?.plan?.name ?? 'This plan'} won't renew.
		{#if sub?.expires_at}
			You keep access until {shortDate(sub.expires_at)}.
		{/if}
	</p>
{/snippet}

{#snippet actions()}
	<div class={MODAL_ACTIONS}>
		<SvaKoshButton
			variant="secondary"
			label="Keep autopay"
			class="border-transparent {MODAL_ACTION}"
			disabled={busy}
			onclick={close}
		/>
		<SvaKoshButton
			variant="bearish"
			label={busy ? 'Cancelling…' : 'Cancel autopay'}
			class={MODAL_DANGER}
			disabled={busy}
			onclick={onConfirm}
		/>
	</div>
{/snippet}

{#if isDesktop}
	<SvaKoshModal bind:isOpen title="Cancel autopay?" showClose footer={actions} onClose={close}>
		<div class="p-4">
			{@render message()}
		</div>
	</SvaKoshModal>
{:else}
	<SvaKoshDrawer
		bind:isOpen
		title="Cancel autopay?"
		showClose
		onClose={close}
		footer={actions}
		contentClass="p-4"
	>
		{@render message()}
	</SvaKoshDrawer>
{/if}
