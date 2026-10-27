<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import TradeSheet from '$lib/components/trade/TradeSheet.svelte';
	import { MODAL_ACTION, MODAL_ACTIONS, MODAL_CONTROL } from '$lib/trade/const';
	import type { TOpResult } from './types';

	interface Props {
		isOpen: boolean;
		title: string;
		submitLabel: string;
		initialName?: string;
		onClose: () => void;
		onSubmit: (name: string) => Promise<TOpResult>;
	}

	let { isOpen, title, submitLabel, initialName = '', onClose, onSubmit }: Props = $props();

	let modalOpen = $state(false);
	let name = $state('');
	let isLoading = $state(false);

	$effect(() => {
		modalOpen = isOpen;
		if (isOpen) {
			name = initialName;
			setTimeout(() => document.getElementById('watchlist-name')?.focus(), 50);
		}
	});

	const isDirty = $derived(name.trim().length > 0 && name.trim() !== initialName.trim());

	function close() {
		modalOpen = false;
		onClose();
	}

	async function handleSubmit() {
		const trimmed = name.trim();
		if (!trimmed) {
			toast.error({ description: 'Name is required.' });
			return;
		}
		if (trimmed === initialName.trim()) {
			close();
			return;
		}
		isLoading = true;
		const res = await onSubmit(trimmed);
		isLoading = false;
		if (res.ok) close();
		else toast.error({ description: res.error });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

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
			variant="solid"
			label={isLoading ? 'Saving…' : submitLabel}
			disabled={isLoading || !isDirty}
			onclick={handleSubmit}
			class={MODAL_ACTION}
		/>
	</div>
{/snippet}

<TradeSheet bind:isOpen={modalOpen} onClose={close} width="26rem" footer={actions}>
	<ModalHeader {title} onClose={close} />
	<div class="flex flex-col gap-4 p-4">
		<div>
			<SvaKoshLabel for="watchlist-name" class="text-foreground/80">Name</SvaKoshLabel>
			<SvaKoshInput
				id="watchlist-name"
				bind:value={name}
				placeholder="Watchlist name"
				maxlength="64"
				disabled={isLoading}
				onkeydown={handleKeydown}
				class={MODAL_CONTROL}
			/>
		</div>
	</div>
</TradeSheet>
