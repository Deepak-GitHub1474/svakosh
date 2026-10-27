<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import TradeSheet from '$lib/components/trade/TradeSheet.svelte';
	import { MODAL_ACTION, MODAL_ACTIONS } from '$lib/trade/const';
	import type { TOpResult } from './types';

	interface Props {
		isOpen: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		loadingLabel?: string;
		onClose: () => void;
		onConfirm: () => Promise<TOpResult>;
	}

	let {
		isOpen,
		title,
		description,
		confirmLabel = 'Delete',
		loadingLabel = 'Deleting...',
		onClose,
		onConfirm
	}: Props = $props();

	let isLoading = $state(false);

	$effect(() => {
		if (isOpen) {
			isLoading = false;
		}
	});

	function close() {
		if (isLoading) return;
		onClose();
	}

	async function handleConfirm() {
		isLoading = true;
		const res = await onConfirm();
		isLoading = false;
		if (res.ok) onClose();
		else toast.error({ description: res.error });
	}
</script>

{#if isOpen}
	{#snippet actions()}
		<div class={MODAL_ACTIONS}>
			<SvaKoshButton
				variant="secondary"
				label="Cancel"
				disabled={isLoading}
				onclick={close}
				class="{MODAL_ACTION} [--terminal-border-hover:transparent] [--terminal-border:transparent]"
			/>
			<SvaKoshButton
				variant="bearish"
				label={isLoading ? loadingLabel : confirmLabel}
				disabled={isLoading}
				onclick={handleConfirm}
				class="{MODAL_ACTION} [--terminal-bg-hover:var(--bearish-solid-hover)] [--terminal-bg:var(--bearish-solid)] [--terminal-border-hover:transparent] [--terminal-border:transparent] [--terminal-fg:white]"
			/>
		</div>
	{/snippet}

	<TradeSheet isOpen={true} onClose={close} width="26rem" footer={actions}>
		<ModalHeader {title} onClose={close} />
		<div class="flex flex-col gap-4 p-4">
			<p class="text-foreground/80 text-sm">{description}</p>
		</div>
	</TradeSheet>
{/if}
